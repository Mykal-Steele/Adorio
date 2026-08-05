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

@description('Bootstrap image used on first deploy, before CI has pushed a real image')
param bootstrapImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

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

// Identity the Container App itself uses to pull from ACR — no admin credentials involved.
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
    userAssignedIdentities: {
      '${containerAppPullIdentity.id}': {}
    }
  }
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
      secrets: [
        { name: 'mongo-uri', value: mongoUri }
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'refresh-token-secret', value: refreshTokenSecret }
        { name: 'cloudinary-key', value: cloudinaryKey }
        { name: 'cloudinary-secret', value: cloudinarySecret }
        { name: 'cloudinary-url', value: cloudinaryUrl }
        { name: 'resend-api-key', value: resendApiKey }
      ]
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: bootstrapImage
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
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
          ]
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

// Identity GitHub Actions authenticates as (via OIDC federated credential — no stored secret).
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

resource containerAppsContributorForDeployIdentity 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, deployIdentity.id, 'ContainerAppsContributor')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '358470bc-b998-42bd-ab17-a7e34c199c0f')
    principalId: deployIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output registryLoginServer string = registry.properties.loginServer
output deployIdentityClientId string = deployIdentity.properties.clientId
output deployIdentityPrincipalId string = deployIdentity.properties.principalId
