param name string
param location string = resourceGroup().location
param tags object = {}

// Reference Properties
param applicationInsightsName string = ''
param appServicePlanId string = 'FlexConsumption'
param storageAccountName string
@allowed(['SystemAssigned', 'UserAssigned'])
param identityType string
@description('User assigned identity name')
param identityId string

// Runtime Properties
@allowed([
  'dotnet-isolated', 'node', 'python', 'java', 'powershell', 'custom'
])
param runtimeName string
@allowed(['3.10', '3.11', '7.4', '8.0', '10', '11', '17', '20'])
param runtimeVersion string
param kind string = 'functionapp,linux'

// Microsoft.Web/sites/config
param appSettings object = {}
param instanceMemoryMB int = 2048
param maximumInstanceCount int = 100

resource stg 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}

resource functions 'Microsoft.Web/sites@2023-12-01' = {
  name: name
  location: location
  tags: tags
  kind: kind
  identity: {
    type: identityType
    userAssignedIdentities: { 
      '${identityId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlanId
    functionAppConfig: null
    reserved: false
    isXenon: false
    hyperV: false
    dnsConfiguration: {}
    vnetRouteAllEnabled: false
    vnetImagePullEnabled: false
    vnetContentShareEnabled: false
    siteConfig: {
        numberOfWorkers: 1
        acrUseManagedIdentityCreds: false
        alwaysOn: false
        http20Enabled: false
        functionAppScaleLimit: 200
        minimumElasticInstanceCount: 0
    }
    scmSiteAlsoStopped: false
    clientAffinityEnabled: false
    clientCertEnabled: false
    clientCertMode: 'Required'
    hostNamesDisabled: false
    vnetBackupRestoreEnabled: false
    containerSize: 1536
    dailyMemoryTimeQuota: 0
    httpsOnly: false
    redundancyMode: 'None'
    storageAccountRequired: false
  }

  resource configAppSettings 'config' = {
    name: 'appsettings'
    properties: union(appSettings,
      {
        AzureWebJobsStorage__accountName: stg.name
        AzureWebJobsStorage__credential : 'managedidentity'
        APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
        FUNCTIONS_EXTENSION_VERSION: '~4'
        FUNCTIONS_WORKER_RUNTIME: 'node'
        WEBSITE_NODE_DEFAULT_VERSION: '~22'
        WEBSITE_RUN_FROM_PACKAGE: '1'
      })
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = if (!empty(applicationInsightsName)) {
  name: applicationInsightsName
}

output name string = functions.name
output uri string = 'https://${functions.properties.defaultHostName}'
output identityPrincipalId string = identityType == 'SystemAssigned' ? functions.identity.principalId : ''
