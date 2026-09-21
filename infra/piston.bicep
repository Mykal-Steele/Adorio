@description('Azure region — same as main.bicep so this shares the resource group/subscription')
param location string = 'southeastasia'

@description('Base name for all Piston resources')
param name string = 'adorio-piston'

@description('Per-instance VM size. Piston is a single lightweight container (no database/cache), so this can stay modest — instance COUNT is what scales, not this size.')
param vmSize string = 'Standard_B2als_v2'

@description('Minimum running instances — kept at 1 so a random practice session at any hour gets an instant response, never a cold-start wait for a new VM to boot.')
param minInstances int = 1

@description('Maximum instances the autoscaler can create during a burst (e.g. a scheduled class).')
param maxInstances int = 6

@description('Admin username for SSH')
param adminUsername string = 'adorio'

@description('SSH public key for the admin user (password auth is disabled)')
param adminSshPublicKey string

@description('CIDR allowed to SSH in, e.g. "203.0.113.4/32"')
param sshSourceAddressPrefix string

@secure()
@description('Shared secret every request must send as X-Auth-Token — Piston has no built-in auth, so this is enforced by the nginx sidecar on each instance instead')
param pistonAuthToken string

@secure()
@description('TLS certificate (PEM, fullchain) for the nginx sidecar. Self-signed and identical across every instance — generate once with openssl, pin it on the backend via PISTON_CA_CERT (main.bicep) instead of trusting a public CA. Not renewed automatically; regenerate and redeploy both this and main.bicep before it expires.')
param pistonTlsCert string

@secure()
@description('Private key matching pistonTlsCert (PEM).')
param pistonTlsKey string

var proxyPort = 2358

// Raw (non-interpolating) multi-line string — placeholders are substituted via
// replace() below, not Bicep interpolation, so the script's own bash/nginx
// ${...} syntax is never at risk of colliding with it.
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
mkdir -p data/piston/packages tls status

# Same cert+key on every instance behind the LB (pinned by the backend via
# NODE_EXTRA_CA_CERTS/PISTON_CA_CERT) — not a publicly-trusted CA, so no
# per-instance issuance, no renewal cron, no port 80 needed for ACME.
cat > tls/fullchain.pem <<'CERT_EOF'
__PISTON_TLS_CERT__
CERT_EOF
cat > tls/privkey.pem <<'KEY_EOF'
__PISTON_TLS_KEY__
KEY_EOF
chmod 600 tls/privkey.pem

cat > nginx.conf <<'NGINX_EOF'
# Plain HTTP, published only to the load balancer's own probe port (never
# opened to the internet by the NSG) — Azure's health probe doesn't speak TLS.
# /ready is only written once the Java runtime is confirmed installed below,
# so this 503s for the whole window where Piston would otherwise accept
# requests it can't actually grade Java against yet.
server {
    listen 8080;

    location /health {
        root /status;
        try_files /ready =503;
    }
}

server {
    listen __PROXY_PORT__ ssl;
    ssl_certificate     /etc/piston-tls/fullchain.pem;
    ssl_certificate_key /etc/piston-tls/privkey.pem;

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
      - PISTON_MAX_CONCURRENT_JOBS=12
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
      - "8080:8080"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./tls:/etc/piston-tls:ro
      - ./status:/status:ro
    depends_on:
      - piston
COMPOSE_EOF

docker compose up -d

# Piston's port 2000 is intentionally never published to the host (only nginx's
# __PROXY_PORT__ is, gated by the auth token) — so bootstrap calls go through
# the same nginx path everything else does, not a shortcut to localhost:2000.
# -k (skip cert verification) is deliberate here and only here: the cert's
# CN/SAN is the public FQDN, not "localhost", and this is the VM talking to
# itself over loopback — there's no network path for a MITM to sit on. The
# backend's connection to the real public endpoint still fully verifies via
# the pinned CA; this local shortcut never affects that.
AUTH_HEADER="X-Auth-Token: __PISTON_AUTH_TOKEN__"
BASE_URL="https://localhost:__PROXY_PORT__"

for i in $(seq 1 30); do
  if curl -sfk -H "$AUTH_HEADER" "$BASE_URL/api/v2/runtimes" >/dev/null 2>&1; then break; fi
  sleep 2
done

# Install the Java package by its exact advertised version — safer than
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

# Python, same pattern as Java above — the backend's codingService.js
# LANGUAGE_CONFIG expects both installed. Add a matching block here (and to
# the two "java" selectors in healthcheck.sh below) for any future language.
PYTHON_VERSION=$(curl -fsSk -H "$AUTH_HEADER" "$BASE_URL/api/v2/packages" | jq -r '[.[] | select(.language=="python")][0].language_version')
if [ -z "$PYTHON_VERSION" ] || [ "$PYTHON_VERSION" = "null" ]; then
  echo "Piston did not advertise a Python package version" >&2
  exit 1
fi

curl -fsSk -X POST "$BASE_URL/api/v2/packages" \
  -H "Content-Type: application/json" -H "$AUTH_HEADER" \
  -d "{\"language\": \"python\", \"version\": \"$PYTHON_VERSION\"}"

# /health only reflects "was ready once at boot" if the readiness marker is
# ever just written once and left alone — if Piston crashes or loses a
# runtime after that, nginx would keep returning 200 forever and the load
# balancer would keep routing submissions at a dead instance. This script
# re-checks Piston live and is run both right now (blocking, until every
# required runtime first comes up) and on a recurring systemd timer below
# (ongoing, so /health tracks reality).
cat > /opt/piston/healthcheck.sh <<'HEALTHCHECK_EOF'
#!/bin/bash
set -uo pipefail
AUTH_HEADER="X-Auth-Token: __PISTON_AUTH_TOKEN__"
BASE_URL="https://localhost:__PROXY_PORT__"
READY_FILE="/opt/piston/status/ready"

RUNTIMES=$(curl -fsSk -H "$AUTH_HEADER" "$BASE_URL/api/v2/runtimes" 2>/dev/null)
JAVA_COUNT=$(echo "$RUNTIMES" | jq -r '[.[] | select(.language=="java")] | length' 2>/dev/null)
PYTHON_COUNT=$(echo "$RUNTIMES" | jq -r '[.[] | select(.language=="python")] | length' 2>/dev/null)

if [ -n "$JAVA_COUNT" ] && [ "$JAVA_COUNT" -gt 0 ] 2>/dev/null \
  && [ -n "$PYTHON_COUNT" ] && [ "$PYTHON_COUNT" -gt 0 ] 2>/dev/null; then
  echo ok > "$READY_FILE"
else
  rm -f "$READY_FILE"
fi
HEALTHCHECK_EOF
chmod +x /opt/piston/healthcheck.sh

RUNTIMES_READY=0
for i in $(seq 1 60); do
  /opt/piston/healthcheck.sh
  if [ -f status/ready ]; then
    RUNTIMES_READY=1
    break
  fi
  sleep 2
done

if [ "$RUNTIMES_READY" -ne 1 ]; then
  echo "Java/Python runtimes never became available after install" >&2
  exit 1
fi

cat > /etc/systemd/system/piston-healthcheck.service <<'SERVICE_EOF'
[Unit]
Description=Piston readiness check

[Service]
Type=oneshot
ExecStart=/opt/piston/healthcheck.sh
SERVICE_EOF

cat > /etc/systemd/system/piston-healthcheck.timer <<'TIMER_EOF'
[Unit]
Description=Run the Piston readiness check periodically

[Timer]
OnUnitActiveSec=15s
AccuracySec=5s

[Install]
WantedBy=timers.target
TIMER_EOF

systemctl daemon-reload
systemctl enable --now piston-healthcheck.timer
'''

var renderedCloudInit = replace(
  replace(
    replace(
      replace(cloudInitScript, '__PROXY_PORT__', string(proxyPort)),
      '__PISTON_AUTH_TOKEN__',
      pistonAuthToken
    ),
    '__PISTON_TLS_CERT__',
    pistonTlsCert
  ),
  '__PISTON_TLS_KEY__',
  pistonTlsKey
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
      {
        name: 'allow-ssh-admin-only'
        properties: {
          priority: 110
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '22'
          sourceAddressPrefix: sshSourceAddressPrefix
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

resource publicIp 'Microsoft.Network/publicIPAddresses@2024-05-01' = {
  name: '${name}-lb-ip'
  location: location
  sku: { name: 'Standard' }
  properties: {
    publicIPAllocationMethod: 'Static'
    dnsSettings: { domainNameLabel: name }
  }
}

resource lb 'Microsoft.Network/loadBalancers@2024-05-01' = {
  name: '${name}-lb'
  location: location
  sku: { name: 'Standard' }
  properties: {
    frontendIPConfigurations: [
      {
        name: 'frontend'
        properties: {
          publicIPAddress: { id: publicIp.id }
        }
      }
    ]
    backendAddressPools: [
      { name: 'backend' }
    ]
    probes: [
      {
        name: 'health-probe'
        properties: {
          // Plain-HTTP probe on the internal-only port — proxyPort now
          // terminates TLS, which an HTTP health probe can't speak, and this
          // port is never opened to the internet by the NSG (Azure's
          // AllowAzureLoadBalancerInBound default rule covers the probe
          // traffic itself, so no explicit NSG rule is needed for it).
          protocol: 'Http'
          port: 8080
          requestPath: '/health'
          intervalInSeconds: 10
          numberOfProbes: 2
        }
      }
    ]
    loadBalancingRules: [
      {
        name: 'proxy-rule'
        properties: {
          frontendIPConfiguration: { id: resourceId('Microsoft.Network/loadBalancers/frontendIPConfigurations', '${name}-lb', 'frontend') }
          backendAddressPool: { id: resourceId('Microsoft.Network/loadBalancers/backendAddressPools', '${name}-lb', 'backend') }
          probe: { id: resourceId('Microsoft.Network/loadBalancers/probes', '${name}-lb', 'health-probe') }
          protocol: 'Tcp'
          frontendPort: proxyPort
          backendPort: proxyPort
          idleTimeoutInMinutes: 4
        }
      }
    ]
  }
}

resource vmss 'Microsoft.Compute/virtualMachineScaleSets@2024-11-01' = {
  name: '${name}-vmss'
  location: location
  sku: {
    name: vmSize
    capacity: minInstances
  }
  properties: {
    overprovision: false
    upgradePolicy: { mode: 'Automatic' }
    virtualMachineProfile: {
      osProfile: {
        computerNamePrefix: name
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
          createOption: 'FromImage'
          managedDisk: { storageAccountType: 'StandardSSD_LRS' }
        }
      }
      networkProfile: {
        networkInterfaceConfigurations: [
          {
            name: '${name}-nic'
            properties: {
              primary: true
              networkSecurityGroup: { id: nsg.id }
              ipConfigurations: [
                {
                  name: 'ipconfig1'
                  properties: {
                    subnet: { id: vnet.properties.subnets[0].id }
                    loadBalancerBackendAddressPools: [
                      { id: resourceId('Microsoft.Network/loadBalancers/backendAddressPools', '${name}-lb', 'backend') }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    lb
  ]
}

resource autoscale 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: '${name}-autoscale'
  location: location
  properties: {
    targetResourceUri: vmss.id
    enabled: true
    profiles: [
      {
        name: 'cpu-based'
        capacity: {
          minimum: string(minInstances)
          maximum: string(maxInstances)
          default: string(minInstances)
        }
        rules: [
          {
            metricTrigger: {
              metricName: 'Percentage CPU'
              metricResourceUri: vmss.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT5M'
              timeAggregation: 'Average'
              operator: 'GreaterThan'
              threshold: 65
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT3M'
            }
          }
          {
            metricTrigger: {
              metricName: 'Percentage CPU'
              metricResourceUri: vmss.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT10M'
              timeAggregation: 'Average'
              operator: 'LessThan'
              threshold: 25
            }
            scaleAction: {
              direction: 'Decrease'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT10M'
            }
          }
        ]
      }
    ]
  }
}

output pistonFqdn string = publicIp.properties.dnsSettings.fqdn
output pistonUrl string = 'https://${publicIp.properties.dnsSettings.fqdn}:${proxyPort}'
