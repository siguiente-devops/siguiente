metadata description = 'Provisions resources for a web application that uses Azure SDK for Python to connect to Azure Cosmos DB for NoSQL.'

targetScope = 'resourceGroup'

param githubRepo string

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention.')
param environmentName string

@minLength(1)
@description('Primary location for all resources.')
param location string

var resourceToken = toLower(uniqueString(resourceGroup().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
  repo: githubRepo
}

resource msi 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: 'msi'
  location: location
}

var databaseName = 'ai'
var containerName = 'texts'

module cosmosDbAccount 'br/public:avm/res/document-db/database-account:0.8.1' = {
  name: 'cosmos-db-account'
  params: {
    name: 'cosmos-db-nosql-${resourceToken}'
    location: location
    locations: [
      {
        failoverPriority: 0
        locationName: location
        isZoneRedundant: false
      }
    ]
    tags: tags
    disableKeyBasedMetadataWriteAccess: true
    disableLocalAuth: true
    networkRestrictions: {
      publicNetworkAccess: 'Enabled'
      ipRules: []
      virtualNetworkRules: []
    }
    capabilitiesToAdd: [
      'EnableServerless'
    ]
    sqlRoleDefinitions: [
      {
        name: 'nosql-data-plane-contributor'
        dataAction: [
          'Microsoft.DocumentDB/databaseAccounts/readMetadata'
          'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*'
          'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*'
        ]
      }
    ]
    sqlRoleAssignmentsPrincipalIds: [
        msi.properties.principalId
    ]
    sqlDatabases: [
      {
        name: databaseName
        containers: [
          {
            name: containerName
            kind: 'MultiHash'
            version: 2
            paths: [
              '/document_id'
              '/language_iso'
            ]
          }
        ]
      }
    ]
  }
}

module logAnalyticsWorkspace 'br/public:avm/res/operational-insights/workspace:0.7.0' = {
  name: 'log-analytics-workspace'
  params: {
    name: 'log-analytics-${resourceToken}'
    location: location
    tags: tags
  }
}

module applicationInsights 'br/public:avm/res/insights/component:0.4.0' = {
  name: 'application-insights'
  params: {
    name: 'insights-${resourceToken}'
    workspaceResourceId: logAnalyticsWorkspace.outputs.resourceId
    location: location
  }
}

module storageAccount 'br/public:avm/res/storage/storage-account:0.15.0' = {
  name: 'storageAccountDeployment'
  params: {
    // Required parameters
    name: 'azfnstore${resourceToken}'
    // Non-required parameters
    skuName: 'Standard_LRS'
    allowBlobPublicAccess: false
    location: location
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
    }
  }
}

module appservicePlan 'core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  params: {
    name: 'appserviceplan-${resourceToken}'
    location: location
    sku: {
      name: 'FC1'
      tier: 'FlexConsumption'
    }
  }
}

module processor './core/host/functions.bicep' = {
  name: 'functionsApp'
  params: {
    name: 'fnmx-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'functionsApp' })
    identityType: 'UserAssigned'
    identityId: msi.id
    appSettings: {
      AzureWebJobsStorage__clientId : msi.properties.clientId
      APPLICATIONINSIGHTS_AUTHENTICATION_STRING: applicationInsights.outputs.connectionString
    }
    applicationInsightsName: applicationInsights.outputs.name
    appServicePlanId: appservicePlan.outputs.id
    runtimeName: 'node'
    runtimeVersion: '20'
    storageAccountName: storageAccount.outputs.name
  }
}

// Static webapp outputs
output AZ_ORIGIN string = processor.outputs.uri

// Azure Cosmos DB for Table outputs
output CONFIGURATION__AZURECOSMOSDB__ENDPOINT string = cosmosDbAccount.outputs.endpoint
output CONFIGURATION__AZURECOSMOSDB__DATABASENAME string = databaseName
output CONFIGURATION__AZURECOSMOSDB__CONTAINERNAME string = containerName

// Logging & Analytics outputs
output AZ_APP_INSIGHTS_INSTRUMENTATION_KEY string = applicationInsights.outputs.instrumentationKey
