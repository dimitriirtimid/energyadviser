# Quick Start Guide

Get Energy Adviser up and running in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git ([Download](https://git-scm.com/))

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/energy-adviser.git
cd energy-adviser
npm install
```

### 2. Get EnergyID Credentials

1. Visit https://oauth.energyid.eu/
2. Register your application
3. Note down your Client ID and Client Secret
4. Set Callback URL to `http://localhost:3000/api/auth/callback`

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
ENERGYID_CLIENT_ID=your_client_id
ENERGYID_CLIENT_SECRET=your_client_secret
SESSION_SECRET=random-secret-string-here-make-it-long
NODE_ENV=development
```

### 4. Build Frontend

```bash
npm run build
```

### 5. Start Server

```bash
npm start
```

Visit http://localhost:3000 in your browser.

## Development Mode

For faster frontend development with hot reload:

### Terminal 1 - Backend

```bash
npm start
```

### Terminal 2 - Frontend

```bash
npm run dev
```

This will start:

- Backend: http://localhost:3000
- Frontend dev server: http://localhost:5173

## Project Structure

```
├── server.js              # Express server entry point
├── routes/                # API endpoints
│   ├── auth.js           # OAuth & authentication
│   ├── energy.js         # Energy data from EnergyID
│   └── analysis.js       # Analysis endpoints
├── services/
│   └── analysisService.js # Analysis algorithms
├── src/                   # Vue.js frontend
│   ├── App.vue           # Root component
│   ├── main.js           # Entry point
│   ├── router/           # Vue Router
│   ├── views/            # Page components
│   └── style.css         # Global styles
└── package.json          # Dependencies
```

## Available Scripts

```bash
npm start              # Start production server
npm run build          # Build Vue.js frontend
npm run build:all      # Build and prepare for deployment
npm run dev            # Dev server with hot reload
```

## API Endpoints

### User & Auth

- `GET /api/auth/login` - Start OAuth
- `GET /api/auth/status` - Check if logged in
- `GET /api/auth/logout` - Logout

### Energy Data

- `GET /api/energy/consumption?days=30` - Get consumption data

### Analysis

- `POST /api/analysis/analyze` - Full analysis with body `{data: [...]}`

## Common Issues

### "Cannot find EnergyID API"

- Verify `ENERGYID_API_URL` is set correctly in `.env`
- Check internet connection
- Ensure your EnergyID account has active meters

### OAuth Login Fails

- Verify Client ID and Secret in `.env`
- Check Callback URL matches exactly
- Ensure authorized scopes include `reading:interval_data`

### Frontend Doesn't Load

```bash
# Rebuild
npm run build

# Restart server
npm start
```

### Port Already in Use

```bash
# Use different port
PORT=3001 npm start
```

## Testing the API

Using curl:

```bash
# Check health
curl http://localhost:3000/api/health

# Check auth status
curl http://localhost:3000/api/auth/status
```

## Next Steps

1. **Deploy to Azure**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Review Analysis Features**: Check `services/analysisService.js`
3. **Customize Frontend**: Edit components in `src/views/`
4. **Extend API**: Add new routes in `routes/` directory

## Need Help?

- Check logs: Enable `NODE_ENV=development`
- Review README.md for detailed documentation
- Check EnergyID API docs: https://docs.energyid.eu/

## Quick Deployment to Azure

```bash
# Build
npm run build:all

# Deploy
zip -r deployment.zip . -x "*.git*" "node_modules/*" ".env"
az webapp deployment source config-zip \
  --resource-group energy-adviser-rg \
  --name energy-adviser-app \
  --src deployment.zip
```

See DEPLOYMENT.md for complete Azure setup guide.
