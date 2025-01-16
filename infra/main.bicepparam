using './main.bicep'

param environmentName = readEnvironmentVariable('AZURE_ENV_NAME', 'development')
param location = readEnvironmentVariable('AZURE_LOCATION', 'westus')
param githubRepo = readEnvironmentVariable('GITHUB_REPO', 'https://github.com/siguiente-devops/siguiente')
param githubPrincipalId = readEnvironmentVariable('AZURE_PRINCIPAL_ID', '')
