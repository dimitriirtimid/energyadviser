# Getting Started Checklist

## ✅ Pre-Requisites (5 minutes) - Optional for Demo Mode

- [ ] Install Node.js 20+ from https://nodejs.org/
- [ ] Verify installation: `node --version` and `npm --version`
- [ ] (Optional) Register for EnergyID account at https://energyid.eu/
- [ ] (Optional) Create OAuth application at https://oauth.energyid.eu/
- [ ] (Optional) Note down Client ID and Client Secret

**Or** just use Demo Mode (no registration needed!):

## ✅ Local Setup (10 minutes)

```bash
# 1. Open terminal in project directory
cd d:\develop\git\energyadviser

# 2. Install all dependencies
npm install

# 3. Create environment file
copy .env.example .env

# 4. Edit .env file with your credentials
#    ENERGYID_CLIENT_ID=your_client_id
#    ENERGYID_CLIENT_SECRET=your_client_secret
#    SESSION_SECRET=generate_a_random_string
#    ENERGYID_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

## ✅ Build Frontend (5 minutes)

```bash
npm run build
```

This creates the `dist/` folder with compiled Vue.js application.

## ✅ Start Development (2 minutes)

```bash
npm start
```

Application runs at: **http://localhost:3000**

## ✅ Test Application (5 minutes)

### Option 1: Use Demo Mode (Fastest!)

1. Open http://localhost:3000 in browser
2. Click "Demo-modus proberen"
3. Instantly view dashboard with sample data
4. No OAuth, no external connections needed

### Option 2: Use Real OAuth

1. Open http://localhost:3000 in browser
2. DEMO_MODE_QUICKSTART.md`| Want to try demo without OAuth |
|`DEMO_MODE.md`        | Want full demo mode docs          |
|`Click "Inloggen met EnergyID"
3. Grant permission to Energy Adviser
4. View Dashboard with your energy data
5. Click "Analyse" for detailed insights

## ✅ Detailed Documentation (Read as Needed)

| Document               | Read When                         |
| ---------------------- | --------------------------------- |
| `QUICKSTART.md`        | Want faster overview              |
| `README.md`            | Need installation help            |
| `PROJECT_STRUCTURE.md` | Want to understand file structure |
| `ARCHITECTURE.md`      | Want to understand system design  |
| `DEPLOYMENT.md`        | Ready to deploy to Azure          |

## ✅ Deploy to Azure (20 minutes)

### Step 1: Prepare Build

```bash
npm run build:all
```

### Step 2: Create Azure Resources

```bash
# Install Azure CLI from https://docs.microsoft.com/cli/azure/
az login

# Create resource group
az group create --name energy-adviser-rg --location eastus

# Create app service plan
az appservice plan create \
  --name energy-adviser-plan \
  --resource-group energy-adviser-rg \
  --sku B1

# Create web app
az webapp create \
  --resource-group energy-adviser-rg \
  --plan energy-adviser-plan \
  --name energy-adviser-app \
  --runtime "NODE|18"
```

### Step 3: Configure Settings

```bash
az webapp config appsettings set \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --settings \
  NODE_ENV=production \
  ENERGYID_CLIENT_ID="your_id" \
  ENERGYID_CLIENT_SECRET="your_secret" \
  ENERGYID_CALLBACK_URL="https://energy-adviser-app.azurewebsites.net/api/auth/callback" \
  SESSION_SECRET="your_random_secret"
```

### Step 4: Deploy

```bash
# Create deployment package
Compress-Archive -Path .\* -DestinationPath deployment.zip `
  -Exclude 'node_modules','dist','.git','.env'

# Deploy
az webapp deployment source config-zip \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --src deployment.zip
```

### Step 5: Go Live

Visit: **https://energy-adviser-app.azurewebsites.net**

## ✅ Troubleshooting

### Problem: npm install fails

**Solution**: Ensure Node.js 20+ is installed

```bash
node --version  # Should show v18.x.x or higher
```

### Problem: OAuth login doesn't work

**Solution**: Check credentials in .env file

- Verify Client ID and Secret are correct
- Check EnergyID callback URL matches exactly
- Ensure OAuth app is properly registered

### Problem: No energy data appears

**Solution**: Check EnergyID account

- Verify account has active energy meters
- Check that OAuth permissions were granted
- Wait a moment as API might be loading

### Problem: Port 3000 already in use

**Solution**: Use different port

```bash
# PowerShell
$env:PORT=3001
npm start
```

### Problem: Build produces errors

**Solution**: Clean and rebuild

```bash
# Remove node_modules and reinstall
rm -r node_modules
npm install
npm run build
```

## ✅ File Checklist

Verify these files exist after setup:

```bash
✓ package.json              (dependencies)
✓ server.js                 (Express app)
✓ routes/auth.js            (OAuth routes)
✓ routes/energy.js          (Energy data routes)
✓ routes/analysis.js        (Analysis routes)
✓ services/analysisService.js  (Analysis logic)
✓ src/main.js               (Vue entry)
✓ src/App.vue               (Root component)
✓ src/views/Dashboard.vue   (Dashboard page)
✓ src/views/Analysis.vue    (Analysis page)
✓ dist/                     (Build output - after npm run build)
✓ .env                      (Configuration - created from .env.example)
```

## ✅ Quick Commands Reference

```bash
# Development
npm install              # Install packages
npm run build            # Build frontend
npm start                # Start server

# Deployment
npm run build:all        # Create production build
npm run dev              # Dev server with hot reload

# Troubleshooting
node --version          # Check Node.js version
npm --version          # Check npm version
npm list               # List installed packages
npm audit              # Check for vulnerabilities
```

## ✅ API Endpoints Quick Reference

```bash
# Authentication
GET  /api/auth/login              # Start OAuth
GET  /api/auth/callback           # OAuth callback
GET  /api/auth/status             # Check if logged in
GET  /api/auth/user               # Get user info
GET  /api/auth/logout             # Logout

# Energy Data
GET  /api/energy/consumption      # Get consumption history
GET  /api/energy/today            # Today's consumption
GET  /api/energy/meters           # Meter information

# Analysis
POST /api/analysis/analyze        # Full analysis
POST /api/analysis/summary        # Summary stats
POST /api/analysis/anomalies      # Detect anomalies
POST /api/analysis/peak-hours     # Peak hour analysis
POST /api/analysis/night-consumption # Night analysis

# Health
GET  /api/health                  # Server health check
```

## ✅ Environment Variables Needed

```bash
# Required for OAuth
ENERGYID_CLIENT_ID=your_client_id_here
ENERGYID_CLIENT_SECRET=your_client_secret_here

# Generated/Custom
SESSION_SECRET=generate_a_long_random_string

# Optional
NODE_ENV=development|production
PORT=3000
ENERGYID_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

## ✅ Success Indicators

You'll know it's working when:

1. ✅ `npm install` completes without errors
2. ✅ `npm run build` creates `dist/` folder
3. ✅ `npm start` shows "server running on port 3000"
4. ✅ http://localhost:3000 loads in browser
5. ✅ "Login with EnergyID" button appears
6. ✅ OAuth redirect to EnergyID works
7. ✅ You see your energy data on dashboard
8. ✅ Analysis page shows charts and recommendations

## 📞 Need Help?

1. **Quick setup**: Read `QUICKSTART.md`
2. **Installation issues**: Check `README.md`
3. **Deployment help**: See `DEPLOYMENT.md`
4. **Want to understand system**: Read `ARCHITECTURE.md`
5. **See file structure**: Check `PROJECT_STRUCTURE.md`

## 🎉 You're Ready!

Follow the checklist steps above and you'll have:

- ✅ Working local application
- ✅ Full energy analysis
- ✅ Beautiful dashboard
- ✅ Deployed to Azure (optional)

**Estimated Total Time**: 30-45 minutes (including reading docs)

**Estimated Cost**:

- Local development: FREE
- Azure deployment: $13-15/month (B1 plan)

Start with "Local Setup" above! 🚀
