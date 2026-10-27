@description('Azure region for all resources')
param location string = 'southeastasia'

@description('Name of the Container Apps environment')
param environmentName string = 'adorio-prod-env'

@description('Name of the Azure Container Registry (globally unique, lowercase alphanumeric)')
param registryName string = 'adorioacr'

@description('Name of the Container App')
param containerAppName string = 'adorio'

@description('Name of the user-assigned managed identity used by GitHub Actions to deploy')
param deployIdentityName string = 'adorio-github-deploy-identity'

@description('GitHub repo in "owner/repo" form, used to scope the OIDC federated credential')
param githubRepo string = 'Mykal-Steele/Adorio'

// No default on purpose. CI updates the image with `az containerapp update` and never
// runs this template, which only gets re-applied for infra changes (RBAC, scaling).
// With a default, an infra apply silently reset the live app to that image and moved
// traffic to it. That already happened once. Pass the running image every time.
@description('Image the container app should run — always pass the current running image explicitly, no default')
param containerImage string

@secure()
param mongoUri string

@secure()
param jwtSecret string

@secure()
param refreshTokenSecret string

@secure()
param cloudinaryKey string

@secure()
param cloudinarySecret string

@secure()
param cloudinaryUrl string

@secure()
param resendApiKey string

@secure()
@description('Piston URL (pistonUrl output of piston.bicep), e.g. https://adorio-piston.<region>.cloudapp.azure.com:2358')
param pistonUrl string

@secure()
@description('Must match the token baked into the Piston nginx sidecar via piston.bicep')
param pistonToken string

@secure()
@description('Self-signed TLS cert (PEM, fullchain) baked into the Piston VM via piston.bicep\'s pistonTlsCert. Pinned here as an extra trusted CA so the backend can verify HTTPS to Piston without a public CA.')
param pistonCaCert string

// Cloudflare R2 file hosting (S3 API). Optional: leave the account id and keys
// empty and the hosting endpoints just report unconfigured.
@description('Cloudflare account id that owns the R2 bucket (empty disables R2 file hosting)')
param r2AccountId string = ''

@secure()
@description('R2 API token access key id (S3-compatible key, scoped to the bucket)')
param r2AccessKeyId string = ''

@secure()
@description('R2 API token secret access key')
param r2SecretAccessKey string = ''

@description('R2 bucket that stores hosted files')
param r2Bucket string = 'adorio-hosted'

@description('Public base URL files are served from — the bucket\'s custom domain, no trailing slash')
param r2PublicUrl string = 'https://files.adorio.space'

var r2Enabled = !empty(r2AccountId) && !empty(r2AccessKeyId) && !empty(r2SecretAccessKey)

// Cloudflare Turnstile bot check on uploads. Optional as a pair: leave both
// empty and the upload form renders no widget and the backend skips the check.
@description('Cloudflare Turnstile site key shown in the upload form (empty disables the bot check)')
param turnstileSiteKey string = ''

@secure()
@description('Cloudflare Turnstile secret key used to verify upload tokens')
param turnstileSecretKey string = ''

var turnstileEnabled = !empty(turnstileSiteKey) && !empty(turnstileSecretKey)

@description('Hard cap on total hosted-file storage in bytes (default 9 GiB, just under R2\'s 10 GB free tier)')
param hostedStorageLimitBytes string = '9663676416'

// The two below are optional and go together. Leave them empty (a fork with
// no Piston, or a first deploy before the VM exists) and the backend only
// reports whether Piston answers. main.bicepparam sets both for this
// deployment, so a re-apply through that file needs nothing extra.
@description('Name of the Piston VM created by piston.bicep in this resource group. Setting this is what lets the backend start the VM on demand and deallocate it when idle.')
param pistonVmName string = ''

@description('Name of the identity piston.bicep created to start and stop that VM')
param runnerControlIdentityName string = ''

var runnerControlEnabled = !empty(pistonVmName) && !empty(runnerControlIdentityName)

// looked up instead of passed in so the ids can't drift from what piston.bicep made
resource runnerControlIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' existing = if (runnerControlEnabled) {
  name: runnerControlIdentityName
}

param clientUrl string = 'https://adorio.space'
param cloudinaryName string

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${environmentName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2025-11-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

// the app pulls from ACR with this, no admin credentials
resource containerAppPullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: '${containerAppName}-pull-identity'
  location: location
}

resource acrPullForContainerApp 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, containerAppPullIdentity.id, 'AcrPull')
  scope: registry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: containerAppPullIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: union(
      { '${containerAppPullIdentity.id}': {} },
      runnerControlEnabled ? { '${runnerControlIdentity.id}': {} } : {}
    )
  }
  // Bicep can't infer this one. The AcrPull grant has to exist before the first pull.
  dependsOn: [
    acrPullForContainerApp
  ]
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
      }
      registries: [
        {
          server: registry.properties.loginServer
          identity: containerAppPullIdentity.id
        }
      ]
      secrets: concat([
        { name: 'mongo-uri', value: mongoUri }
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'refresh-token-secret', value: refreshTokenSecret }
        { name: 'cloudinary-key', value: cloudinaryKey }
        { name: 'cloudinary-secret', value: cloudinarySecret }
        { name: 'cloudinary-url', value: cloudinaryUrl }
        { name: 'resend-api-key', value: resendApiKey }
        { name: 'piston-url', value: pistonUrl }
        { name: 'piston-token', value: pistonToken }
        { name: 'piston-ca-cert', value: pistonCaCert }
      ], r2Enabled ? [
        { name: 'r2-access-key-id', value: r2AccessKeyId }
        { name: 'r2-secret-access-key', value: r2SecretAccessKey }
      ] : [], turnstileEnabled ? [
        { name: 'turnstile-secret-key', value: turnstileSecretKey }
      ] : [])
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: concat(concat([
            { name: 'NODE_ENV', value: 'production' }
            { name: 'BACKEND_INTERNAL_URL', value: 'http://localhost:3000' }
            { name: 'CLIENT_URL', value: clientUrl }
            { name: 'CLOUDINARY_NAME', value: cloudinaryName }
            { name: 'MONGO_URI', secretRef: 'mongo-uri' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'REFRESH_TOKEN_SECRET', secretRef: 'refresh-token-secret' }
            { name: 'CLOUDINARY_KEY', secretRef: 'cloudinary-key' }
            { name: 'CLOUDINARY_SECRET', secretRef: 'cloudinary-secret' }
            { name: 'CLOUDINARY_URL', secretRef: 'cloudinary-url' }
            { name: 'RESEND_API_KEY', secretRef: 'resend-api-key' }
            { name: 'PISTON_URL', secretRef: 'piston-url' }
            { name: 'PISTON_TOKEN', secretRef: 'piston-token' }
            { name: 'PISTON_CA_CERT', secretRef: 'piston-ca-cert' }
            { name: 'HOSTED_STORAGE_LIMIT_BYTES', value: hostedStorageLimitBytes }
          ], runnerControlEnabled ? [
            { name: 'PISTON_VM_RESOURCE_ID', value: resourceId('Microsoft.Compute/virtualMachines', pistonVmName) }
            // The app has two identities, so the backend has to say which one it means.
            { name: 'PISTON_CONTROL_CLIENT_ID', value: runnerControlIdentity!.properties.clientId }
          ] : []), r2Enabled ? [
            { name: 'R2_ACCOUNT_ID', value: r2AccountId }
            { name: 'R2_BUCKET', value: r2Bucket }
            { name: 'R2_PUBLIC_URL', value: r2PublicUrl }
            { name: 'R2_ACCESS_KEY_ID', secretRef: 'r2-access-key-id' }
            { name: 'R2_SECRET_ACCESS_KEY', secretRef: 'r2-secret-access-key' }
          ] : [], turnstileEnabled ? [
            { name: 'TURNSTILE_SITE_KEY', value: turnstileSiteKey }
            { name: 'TURNSTILE_SECRET_KEY', secretRef: 'turnstile-secret-key' }
          ] : [])
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 8080
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// GitHub Actions signs in as this through OIDC, no stored secret
resource deployIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: deployIdentityName
  location: location
}

resource githubFederatedCredential 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2024-11-30' = {
  parent: deployIdentity
  name: 'github-actions-main'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubRepo}:ref:refs/heads/main'
    audiences: ['api://AzureADTokenExchange']
  }
}

resource acrPushForDeployIdentity 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, deployIdentity.id, 'AcrPush')
  scope: registry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e382-0749-4cb8-b61a-304f252e45ec')
    principalId: deployIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// `az acr build` needs this on top of AcrPush, since uploading the context and queuing
// the run are ARM actions. With AcrPush alone, listBuildSourceUploadUrl fails with
// "resource could not be found" / "AuthorizationFailed" (found out the hard way).
resource acrTasksContributorForDeployIdentity 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, deployIdentity.id, 'ContainerRegistryTasksContributor')
  scope: registry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'fb382eab-e894-4461-af04-94435c366c3f')
    principalId: deployIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource containerAppsContributorForDeployIdentity 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, deployIdentity.id, 'ContainerAppsContributor')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '358470bc-b998-42bd-ab17-a7e34c199c0f')
    principalId: deployIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

@description('Where code runner alerts are emailed')
param alertEmail string = 'mykal.stele@gmail.com'

resource alertEmailGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'adorio-alert-email'
  location: 'global'
  properties: {
    groupShortName: 'adorioalert'
    enabled: true
    emailReceivers: [
      {
        name: 'owner'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

// The practice page shows "starting" for every way the runner can fail to come
// up, so without these nobody hears about it. Both read the code-runner log
// lines from backend/services/codeRunnerService.js. A 15 minute check is the
// cheapest log alert tier, and these are stateful: one email when it fires,
// one when it clears.
resource runnerTokenRejectedAlert 'Microsoft.Insights/scheduledQueryRules@2023-12-01' = {
  name: 'code-runner-token-rejected'
  location: location
  properties: {
    displayName: 'Code runner token rejected'
    description: 'Piston answered 401 or 403, so PISTON_TOKEN on the Container App does not match PISTON_AUTH_TOKEN in infra/.secrets/piston-deploy.env. Set the piston-token secret to that value and restart the revision.'
    severity: 1
    enabled: true
    scopes: [logAnalytics.id]
    evaluationFrequency: 'PT15M'
    windowSize: 'PT30M'
    autoMitigate: true
    criteria: {
      allOf: [
        {
          query: '''
ContainerAppConsoleLogs_CL
| where Log_s startswith '{"scope":"code-runner"'
| where tostring(parse_json(Log_s).event) == 'auth_failed'
'''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [alertEmailGroup.id]
    }
  }
}

// A start normally logs "ready" within about 30 seconds, and the stop check
// logs it within a minute even if nobody is on the page. A start with no
// "ready" after it for 10 minutes means the runner is not coming up: a wrong
// token, Docker or Piston failing on the VM, or the VM unreachable.
resource runnerStuckStartingAlert 'Microsoft.Insights/scheduledQueryRules@2023-12-01' = {
  name: 'code-runner-stuck-starting'
  location: location
  properties: {
    displayName: 'Code runner never became ready'
    description: 'The Piston VM was started over 10 minutes ago and Piston has not answered with both runtimes since. Check the code-runner logs for auth_failed, then the VM with az vm run-command.'
    severity: 2
    enabled: true
    scopes: [logAnalytics.id]
    evaluationFrequency: 'PT15M'
    windowSize: 'PT1H'
    autoMitigate: true
    criteria: {
      allOf: [
        {
          query: '''
let runner = ContainerAppConsoleLogs_CL
| where Log_s startswith '{"scope":"code-runner"'
| extend event = tostring(parse_json(Log_s).event);
let lastReady = toscalar(runner | where event == 'ready' | summarize max(TimeGenerated));
runner
| where event == 'start_requested'
| where TimeGenerated < ago(10m)
| where isnull(lastReady) or TimeGenerated > lastReady
'''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [alertEmailGroup.id]
    }
  }
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output registryLoginServer string = registry.properties.loginServer
output deployIdentityClientId string = deployIdentity.properties.clientId
output deployIdentityPrincipalId string = deployIdentity.properties.principalId
