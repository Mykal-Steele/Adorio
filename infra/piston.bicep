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
mkdir -p data/piston/packages

cat > nginx.conf <<'NGINX_EOF'
server {
    listen __PROXY_PORT__;

    location /health {
        return 200 "ok";
        add_header Content-Type text/plain;
    }

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
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - piston
COMPOSE_EOF

docker compose up -d

# Piston's port 2000 is intentionally never published to the host (only nginx's
# __PROXY_PORT__ is, gated by the auth token) — so bootstrap calls go through
# the same public path everything else does, not a shortcut to localhost:2000.
AUTH_HEADER="X-Auth-Token: __PISTON_AUTH_TOKEN__"
BASE_URL="http://localhost:__PROXY_PORT__"

for i in $(seq 1 30); do
  if curl -sf -H "$AUTH_HEADER" "$BASE_URL/api/v2/runtimes" >/dev/null 2>&1; then break; fi
  sleep 2
done

# Install the Java package by its exact advertised version — safer than
# assuming a "*" wildcard is accepted, since that's undocumented for the raw
# HTTP API (only confirmed for the CLI tool).
JAVA_VERSION=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/v2/packages" | jq -r '[.[] | select(.language=="java")][0].language_version')
if [ -n "$JAVA_VERSION" ] && [ "$JAVA_VERSION" != "null" ]; then
  curl -s -X POST "$BASE_URL/api/v2/packages" \
    -H "Content-Type: application/json" -H "$AUTH_HEADER" \
    -d "{\"language\": \"java\", \"version\": \"$JAVA_VERSION\"}"
fi
'''

var renderedCloudInit = replace(
  replace(cloudInitScript, '__PROXY_PORT__', string(proxyPort)),
  '__PISTON_AUTH_TOKEN__',
  pistonAuthToken
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
          protocol: 'Http'
          port: proxyPort
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
output pistonUrl string = 'http://${publicIp.properties.dnsSettings.fqdn}:${proxyPort}'
