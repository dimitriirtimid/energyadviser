# Azure App Service Deployment Guide

This guide provides step-by-step instructions for deploying Energy Adviser to Azure App Service.

## Prerequisites

- Azure subscription (free tier available)
- Azure CLI installed ([Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Git installed and configured
- EnergyID OAuth credentials

## Quick Start

### 1. Login to Azure

```bash
az login
```

### 2. Create Resource Group

```bash
az group create \
  --name energy-adviser-rg \
  --location eastus
```

### 3. Create App Service Plan

Choose a SKU based on your needs:

- `B1` (Basic) - Good for development/testing ($13-15/month)
- `S1` (Standard) - For production ($90+/month)

```bash
az appservice plan create \
  --name energy-adviser-plan \
  --resource-group energy-adviser-rg \
  --sku B1 \
  --is-linux
```

### 4. Create Web App

```bash
az webapp create \
  --resource-group energy-adviser-rg \
  --plan energy-adviser-plan \
  --name energy-adviser-app \
  --runtime "NODE|18"
```

### 5. Configure Application Settings

Set your environment variables in Azure:

```bash
az webapp config appsettings set \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --settings \
  NODE_ENV=production \
  ENERGYID_CLIENT_ID="your_client_id_here" \
  ENERGYID_CLIENT_SECRET="your_client_secret_here" \
  ENERGYID_CALLBACK_URL="https://energy-adviser-app.azurewebsites.net/api/auth/callback" \
  SESSION_SECRET="generate_a_random_string_here" \
  ALLOWED_ORIGINS="https://energy-adviser-app.azurewebsites.net"
```

### 6. Build and Deploy

#### Option A: Using GitHub (Recommended)

1. Push your code to GitHub
2. Connect your repository to Azure App Service:

```bash
az webapp deployment source config-zip \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --src "path/to/your/repo"
```

#### Option B: Using ZIP Deployment

```bash
# Build the application
npm run build:all

# Create deployment package
zip -r energy-adviser.zip . \
  -x "*.git*" \
  "node_modules/*" \
  ".env" \
  "src/*" \
  "vite.config.js"

# Deploy
az webapp deployment source config-zip \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --src energy-adviser.zip
```

#### Option C: Using Azure DevOps / GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: energy-adviser-app
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: .
```

### 7. Monitor Deployment

```bash
# Check deployment status
az webapp deployment slot list \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app

# View application logs
az webapp log tail \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app

# View live logs
az webapp up --name energy-adviser-app
```

## Accessing Your Application

After successful deployment:

```bash
https://energy-adviser-app.azurewebsites.net
```

## Post-Deployment Configuration

### 1. Enable Application Insights

```bash
az monitor app-insights component create \
  --app energy-adviser-insights \
  --location eastus \
  --resource-group energy-adviser-rg \
  --application-type web
```

Then add the instrumentation key to application settings.

### 2. Enable SSL/HTTPS

Azure App Service provides SSL by default. To enforce HTTPS:

1. Go to Azure Portal
2. Navigate to SSL settings
3. Enable HTTPS only

### 3. Configure Custom Domain

```bash
az webapp config hostname add \
  --webapp-name energy-adviser-app \
  --resource-group energy-adviser-rg \
  --hostname your-domain.com
```

### 4. Setup Auto-scaling

For predictable scaling based on demand:

```bash
az monitor autoscale create \
  --resource-group energy-adviser-rg \
  --resource energy-adviser-app \
  --resource-type "Microsoft.Web/sites" \
  --name "capacity-scale" \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

## Troubleshooting

### Application won't start

Check logs:

```bash
az webapp log tail \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --provider application
```

Common causes:

- Missing environment variables
- Incorrect Node.js version
- Build errors

### OAuth callback URL mismatch

Ensure your EnergyID OAuth settings match:

- Registered redirect URI: `https://energy-adviser-app.azurewebsites.net/api/auth/callback`
- Update `ENERGYID_CALLBACK_URL` in application settings

### Performance issues

Monitor using Application Insights:

```bash
az monitor app-insights metrics show \
  --app energy-adviser-insights \
  --resource-group energy-adviser-rg \
  --metric "requests/count"
```

## Scaling Costs

- **B1 Plan**: ~$13/month (basic web app)
- **S1 Plan**: ~$90/month (production grade)
- **Data egress**: First 5GB free, then $0.12/GB
- **Application Insights**: First 5GB free/month

## Stopping/Removing Resources

Stop the app (keep resources):

```bash
az webapp stop \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app
```

Delete all resources:

```bash
az group delete \
  --name energy-adviser-rg \
  --yes
```

## Support

For Azure-specific issues:

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://azure.microsoft.com/en-us/develop/nodejs/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/reference-index)
