@description('Azure region, same as main.bicep so this shares the resource group/subscription')
param location string = 'southeastasia'

@description('Base name for all Piston resources')
param name string = 'adorio-piston'

@description('VM size. The VM is deallocated whenever nobody is running code, so this is billed by the hour of real use, not by the month. That makes dedicated (non-burstable) cores affordable: 4 vCPUs is about 2.4x the busiest class measured on the old 2 vCPU instance (58% CPU over 5 minutes on 17 Sep 2026). Raise to Standard_D8as_v5 for bigger classes.')
param vmSize string = 'Standard_D4as_v5'

@description('Piston job slots. Scale with vmSize: the old 2 vCPU instance ran 12.')
param maxConcurrentJobs int = 24

@description('DNS label on the public IP. The backend reaches Piston at <label>.<region>.cloudapp.azure.com and the pinned TLS cert is issued for that name, so the label has to stay "adorio-piston" in production. Pass a different label only to stand a second VM up beside the live one.')
param dnsLabel string = name

@description('Admin username for SSH')
param adminUsername string = 'adorio'

@description('SSH public key for the admin user. Azure needs one to create a Linux VM with password login disabled, but nothing can reach port 22: the network security group below has no SSH rule. Use "az vm run-command invoke" to run commands on the VM.')
param adminSshPublicKey string

@secure()
@description('Shared secret every request must send as X-Auth-Token. Piston has no built-in auth, so the nginx sidecar enforces this instead')
param pistonAuthToken string

@secure()
@description('TLS certificate (PEM, fullchain) for the nginx sidecar. Self-signed, pinned on the backend via PISTON_CA_CERT (main.bicep) instead of trusting a public CA. Not renewed automatically; regenerate and redeploy both this and main.bicep before it expires.')
param pistonTlsCert string

@secure()
@description('Private key matching pistonTlsCert (PEM).')
param pistonTlsKey string

@description('Last line of defence against a VM left running: the VM deallocates itself after this many seconds with no code execution request. The backend normally stops it much sooner (PISTON_IDLE_MINUTES); this only matters if the backend is down or its stop call keeps failing. Must stay above the longest admin hold (240 min).')
param idleBackstopSeconds int = 18000

var proxyPort = 2358

// Raw string, placeholders are filled by replace() below instead of Bicep
// interpolation so they can't collide with the script's own bash/nginx ${...}.
//
// cloud-init runs this once, at first provisioning. Later boots (each start from
// deallocated) skip it: Docker's restart policy brings the two containers back,
// the runtimes are still on the OS disk, and the systemd units are already enabled.
var cloudInitScript = '''#!/bin/bash
set -euo pipefail

apt-get update
apt-get install -y ca-certificates curl jq

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker

mkdir -p /opt/piston
cd /opt/piston
mkdir -p data/piston/packages tls logs

# Containers must never reach the instance metadata service. This VM has a
# managed identity (used only by idle-stop.sh below), and IMDS hands its token
# to anything on the box that asks. Piston already runs submissions with
# networking off, so this is a second lock on the same door, and it has to be
# re-applied on every boot because iptables rules do not survive one.
cat > /etc/systemd/system/piston-block-imds.service <<'IMDS_EOF'
[Unit]
Description=Block container access to the instance metadata service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c '/usr/sbin/iptables -C DOCKER-USER -d 169.254.169.254 -j DROP 2>/dev/null || /usr/sbin/iptables -I DOCKER-USER -d 169.254.169.254 -j DROP'

[Install]
WantedBy=multi-user.target
IMDS_EOF
systemctl daemon-reload
systemctl enable --now piston-block-imds.service

cat > tls/fullchain.pem <<'CERT_EOF'
__PISTON_TLS_CERT__
CERT_EOF
cat > tls/privkey.pem <<'KEY_EOF'
__PISTON_TLS_KEY__
KEY_EOF
chmod 600 tls/privkey.pem

cat > nginx.conf <<'NGINX_EOF'
# Only real code executions are logged, to their own file. idle-stop.sh reads
# that file's modification time as "last time someone ran code", so the
# backend's readiness polls of /api/v2/runtimes must not touch it.
map $request_uri $is_execute {
    default 0;
    ~^/api/v2/execute 1;
}

server {
    listen __PROXY_PORT__ ssl;
    ssl_certificate     /etc/piston-tls/fullchain.pem;
    ssl_certificate_key /etc/piston-tls/privkey.pem;

    access_log /var/log/piston/execute.log combined if=$is_execute;

    location / {
        set $auth_ok 0;
        if ($http_x_auth_token = "__PISTON_AUTH_TOKEN__") {
            set $auth_ok 1;
        }
        if ($auth_ok = 0) {
            return 401;
        }
        proxy_pass http://piston:2000;
        proxy_read_timeout 60s;
        client_max_body_size 10m;
    }
}
NGINX_EOF

cat > docker-compose.yml <<COMPOSE_EOF
services:
  piston:
    image: ghcr.io/engineer-man/piston
    container_name: piston_api
    restart: always
    privileged: true
    environment:
      - PISTON_MAX_CONCURRENT_JOBS=__MAX_CONCURRENT_JOBS__
    volumes:
      - ./data/piston/packages:/piston/packages
    tmpfs:
      - /tmp:exec

  nginx:
    image: nginx:1.27-alpine
    container_name: piston_proxy
    restart: always
    ports:
      - "__PROXY_PORT__:__PROXY_PORT__"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./tls:/etc/piston-tls:ro
      - ./logs:/var/log/piston
    depends_on:
      - piston
COMPOSE_EOF

docker compose up -d

cat > /etc/logrotate.d/piston <<'LOGROTATE_EOF'
/opt/piston/logs/*.log {
    weekly
    rotate 4
    missingok
    notifempty
    copytruncate
}
LOGROTATE_EOF

# Piston's port 2000 is intentionally never published to the host (only nginx's
# __PROXY_PORT__ is, gated by the auth token), so bootstrap calls go through
# the same nginx path everything else does, not a shortcut to localhost:2000.
# -k (skip cert verification) is deliberate here and only here: the cert's
# CN/SAN is the public FQDN, not "localhost", and this is the VM talking to
# itself over loopback, with no network path for a MITM to sit on. The
# backend's connection to the real public endpoint still fully verifies via
# the pinned CA; this local shortcut never affects that.
AUTH_HEADER="X-Auth-Token: __PISTON_AUTH_TOKEN__"
BASE_URL="https://localhost:__PROXY_PORT__"

for i in $(seq 1 30); do
  if curl -sfk -H "$AUTH_HEADER" "$BASE_URL/api/v2/runtimes" >/dev/null 2>&1; then break; fi
  sleep 2
done

# Install the Java package by its exact advertised version. That is safer than
# assuming a "*" wildcard is accepted, since that's undocumented for the raw
# HTTP API (only confirmed for the CLI tool). -f makes this fail loudly (and,
# under set -e, abort the whole script) instead of silently no-op'ing on a
# non-2xx response.
JAVA_VERSION=$(curl -fsSk -H "$AUTH_HEADER" "$BASE_URL/api/v2/packages" | jq -r '[.[] | select(.language=="java")][0].language_version')
if [ -z "$JAVA_VERSION" ] || [ "$JAVA_VERSION" = "null" ]; then
  echo "Piston did not advertise a Java package version" >&2
  exit 1
fi

curl -fsSk -X POST "$BASE_URL/api/v2/packages" \
  -H "Content-Type: application/json" -H "$AUTH_HEADER" \
  -d "{\"language\": \"java\", \"version\": \"$JAVA_VERSION\"}"

# Python, same pattern as Java above. The backend's codingService.js
# LANGUAGE_CONFIG expects both installed. Add a matching block here (and to
# the readiness check below, and REQUIRED_RUNTIMES in codeRunnerService.js)
# for any future language.
# Piston's package catalog lists every Python release (2.7.18 through 3.12.x)
# all under language "python". Picking [0] grabs whichever the catalog
# happens to list first, which has been the ancient 2.7.18 build. Sort by the
# numeric version parts and take the highest so this always resolves to the
# newest Python 3 release instead. (Piston also reports installed 2.x builds
# back from /api/v2/runtimes under language "python2", not "python", which is
# another reason to never let this land on a 2.x version: the readiness check
# below would then never see it as installed.)
PYTHON_VERSION=$(curl -fsSk -H "$AUTH_HEADER" "$BASE_URL/api/v2/packages" | jq -r '[.[] | select(.language=="python")] | sort_by(.language_version | split(".") | map(tonumber)) | last | .language_version')
if [ -z "$PYTHON_VERSION" ] || [ "$PYTHON_VERSION" = "null" ]; then
  echo "Piston did not advertise a Python package version" >&2
  exit 1
fi

curl -fsSk -X POST "$BASE_URL/api/v2/packages" \
  -H "Content-Type: application/json" -H "$AUTH_HEADER" \
  -d "{\"language\": \"python\", \"version\": \"$PYTHON_VERSION\"}"

# Self-stop backstop. The backend deallocates this VM once it has been idle
# for PISTON_IDLE_MINUTES. If the backend is down, mid-failover, or its stop
# call keeps failing, nothing else would ever turn the VM off and it would
# bill around the clock. This timer makes the VM deallocate itself after
# __IDLE_BACKSTOP_SECONDS__ seconds without a code execution. An OS-level
# shutdown is not enough for that: a stopped-but-allocated VM is still billed,
# only a deallocate through Azure's API releases the compute. The VM's own
# managed identity is allowed that one action on itself and nothing else.
cat > /opt/piston/idle-stop.sh <<'IDLESTOP_EOF'
#!/bin/bash
set -uo pipefail
IDLE_LIMIT_SECONDS=__IDLE_BACKSTOP_SECONDS__
ACTIVITY_FILE=/opt/piston/logs/execute.log
IMDS="http://169.254.169.254/metadata"

# A VM that only just booted has not been idle for the limit yet, whatever
# the activity file from its previous run says.
UPTIME_SECONDS=$(cut -d. -f1 /proc/uptime)
if [ "$UPTIME_SECONDS" -lt "$IDLE_LIMIT_SECONDS" ]; then exit 0; fi

LAST_ACTIVITY=0
if [ -f "$ACTIVITY_FILE" ]; then LAST_ACTIVITY=$(stat -c %Y "$ACTIVITY_FILE"); fi
IDLE_SECONDS=$(( $(date +%s) - LAST_ACTIVITY ))
if [ "$IDLE_SECONDS" -lt "$IDLE_LIMIT_SECONDS" ]; then exit 0; fi

RESOURCE_ID=$(curl -fsS -H Metadata:true "$IMDS/instance/compute/resourceId?api-version=2021-02-01&format=text")
TOKEN=$(curl -fsS -G -H Metadata:true "$IMDS/identity/oauth2/token" \
  --data-urlencode "api-version=2018-02-01" --data-urlencode "resource=__ARM_ENDPOINT__" | jq -r '.access_token')
if [ -z "$RESOURCE_ID" ] || [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "idle-stop: could not read the resource id or a token from IMDS" >&2
  exit 1
fi

echo "idle-stop: no code execution for ${IDLE_SECONDS}s, deallocating"
curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Length: 0" \
  "__ARM_ENDPOINT__${RESOURCE_ID#/}/deallocate?api-version=2024-07-01"
IDLESTOP_EOF
chmod +x /opt/piston/idle-stop.sh

cat > /etc/systemd/system/piston-idle-stop.service <<'SERVICE_EOF'
[Unit]
Description=Deallocate this VM when no code has run for a long time
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/opt/piston/idle-stop.sh
SERVICE_EOF

# OnBootSec gives it a first run on its own. OnUnitActiveSec alone never
# fires until the service has been activated by systemd at least once.
cat > /etc/systemd/system/piston-idle-stop.timer <<'TIMER_EOF'
[Unit]
Description=Check every 5 minutes whether this VM should deallocate itself

[Timer]
OnBootSec=10min
OnUnitActiveSec=5min
AccuracySec=30s

[Install]
WantedBy=timers.target
TIMER_EOF

systemctl daemon-reload
systemctl enable --now piston-idle-stop.timer

# Block until both runtimes are really installed, so a broken install fails
# the provisioning loudly instead of leaving a VM that looks fine and cannot
# grade anything. The backend runs this same check on every start
# (codeRunnerService.js) before it tells anyone the runner is ready.
RUNTIMES_READY=0
for i in $(seq 1 60); do
  RUNTIMES=$(curl -fsSk -H "$AUTH_HEADER" "$BASE_URL/api/v2/runtimes" 2>/dev/null || true)
  JAVA_COUNT=$(echo "$RUNTIMES" | jq -r '[.[] | select(.language=="java")] | length' 2>/dev/null || true)
  PYTHON_COUNT=$(echo "$RUNTIMES" | jq -r '[.[] | select(.language=="python")] | length' 2>/dev/null || true)
  if [ "${JAVA_COUNT:-0}" -gt 0 ] 2>/dev/null && [ "${PYTHON_COUNT:-0}" -gt 0 ] 2>/dev/null; then
    RUNTIMES_READY=1
    break
  fi
  sleep 2
done

if [ "$RUNTIMES_READY" -ne 1 ]; then
  echo "Java/Python runtimes never became available after install" >&2
  exit 1
fi
'''

var cloudInitReplacements = {
  // Ends in a slash, e.g. https://management.azure.com/
  __ARM_ENDPOINT__: environment().resourceManager
  __PROXY_PORT__: string(proxyPort)
  __MAX_CONCURRENT_JOBS__: string(maxConcurrentJobs)
  __IDLE_BACKSTOP_SECONDS__: string(idleBackstopSeconds)
  __PISTON_AUTH_TOKEN__: pistonAuthToken
  __PISTON_TLS_CERT__: pistonTlsCert
  __PISTON_TLS_KEY__: pistonTlsKey
}

var renderedCloudInit = reduce(
  items(cloudInitReplacements),
  cloudInitScript,
  (script, entry) => replace(script, entry.key, entry.value)
)

resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: '${name}-vnet'
  location: location
  properties: {
    addressSpace: { addressPrefixes: ['10.21.0.0/24'] }
    subnets: [
      {
        name: 'default'
        properties: { addressPrefix: '10.21.0.0/24' }
      }
    ]
  }
}

// The proxy port is the only way in. There is deliberately no SSH rule: the VM
// has its own public IP, so one would put port 22 on the internet.
resource nsg 'Microsoft.Network/networkSecurityGroups@2024-05-01' = {
  name: '${name}-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'allow-piston-proxy'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: string(proxyPort)
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

// Static, so the address (and the DNS label on it) survives every
// deallocate/start cycle. A deallocated VM keeps paying for this IP and its OS
// disk, about $6 a month together. That is the whole idle cost.
resource publicIp 'Microsoft.Network/publicIPAddresses@2024-05-01' = {
  name: '${name}-vm-ip'
  location: location
  sku: { name: 'Standard' }
  properties: {
    publicIPAllocationMethod: 'Static'
    dnsSettings: { domainNameLabel: dnsLabel }
  }
}

resource nic 'Microsoft.Network/networkInterfaces@2024-05-01' = {
  name: '${name}-vm-nic'
  location: location
  properties: {
    networkSecurityGroup: { id: nsg.id }
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: { id: vnet.properties.subnets[0].id }
          publicIPAddress: { id: publicIp.id }
        }
      }
    ]
  }
}

resource vm 'Microsoft.Compute/virtualMachines@2024-11-01' = {
  name: '${name}-vm'
  location: location
  // Used only by /opt/piston/idle-stop.sh to deallocate this VM (see
  // vmSelfStopRole below).
  identity: { type: 'SystemAssigned' }
  properties: {
    hardwareProfile: { vmSize: vmSize }
    securityProfile: {
      securityType: 'TrustedLaunch'
      uefiSettings: {
        secureBootEnabled: true
        vTpmEnabled: true
      }
    }
    osProfile: {
      computerName: name
      adminUsername: adminUsername
      customData: base64(renderedCloudInit)
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: adminSshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: 'ubuntu-24_04-lts'
        sku: 'server'
        version: 'latest'
      }
      osDisk: {
        name: '${name}-vm-osdisk'
        createOption: 'FromImage'
        deleteOption: 'Delete'
        managedDisk: { storageAccountType: 'StandardSSD_LRS' }
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: nic.id
          properties: { deleteOption: 'Delete' }
        }
      ]
    }
    diagnosticsProfile: {
      bootDiagnostics: { enabled: true }
    }
  }
}

// the backend (Container App in main.bicep) starts and stops the VM with this.
// Kept apart from the ACR pull identity so each one only has one job's access.
resource runnerControlIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: '${name}-control-identity'
  location: location
}

// Built-in "Virtual Machine Contributor" would also let the holder resize,
// delete, or run commands on the VM. The backend needs none of that: it reads
// the power state, starts, and deallocates.
resource runnerOperatorRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(resourceGroup().id, 'adorio-code-runner-operator')
  properties: {
    roleName: 'Adorio Code Runner Operator'
    description: 'Read the power state of, start, and deallocate the Piston code runner VM. Nothing else.'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Compute/virtualMachines/read'
          'Microsoft.Compute/virtualMachines/instanceView/read'
          'Microsoft.Compute/virtualMachines/start/action'
          'Microsoft.Compute/virtualMachines/deallocate/action'
        ]
        notActions: []
      }
    ]
    assignableScopes: [resourceGroup().id]
  }
}

resource vmSelfStopRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(resourceGroup().id, 'adorio-code-runner-self-stop')
  properties: {
    roleName: 'Adorio Code Runner Self Stop'
    description: 'Deallocate the Piston code runner VM. Held only by the VM itself, for its idle backstop.'
    type: 'CustomRole'
    permissions: [
      {
        actions: ['Microsoft.Compute/virtualMachines/deallocate/action']
        notActions: []
      }
    ]
    assignableScopes: [resourceGroup().id]
  }
}

resource operatorRoleForBackend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vm.id, runnerControlIdentity.id, runnerOperatorRole.id)
  scope: vm
  properties: {
    roleDefinitionId: runnerOperatorRole.id
    principalId: runnerControlIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource selfStopRoleForVm 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vm.id, 'self', vmSelfStopRole.id)
  scope: vm
  properties: {
    roleDefinitionId: vmSelfStopRole.id
    principalId: vm.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output pistonFqdn string = publicIp.properties.dnsSettings.fqdn
output pistonUrl string = 'https://${publicIp.properties.dnsSettings.fqdn}:${proxyPort}'
output pistonVmResourceId string = vm.id
output runnerControlIdentityId string = runnerControlIdentity.id
output runnerControlIdentityClientId string = runnerControlIdentity.properties.clientId
