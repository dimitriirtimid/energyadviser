Original prompt:

# Energy Adviser

A comprehensive web application that analyzes your energy consumption and provides actionable advice to reduce energy usage and costs.

## Features

- 🔐 **OAuth2 Authentication**: Secure login via EnergyID
- 📊 **Real-time Energy Analysis**: Analyze consumption patterns without database storage
- 📈 **Peak Hour Detection**: Identify when you use the most energy
- 🌙 **Night Consumption Analysis**: Detect idle/standby consumption patterns
- 🚨 **Anomaly Detection**: Identify unusual consumption spikes
- 💡 **Smart Recommendations**: Personalized advice based on your patterns
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ☁️ **Azure Ready**: Deployable directly to Azure App Service

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Passport.js** for OAuth2 authentication
- **Axios** for API calls
- Real-time in-memory data analysis (no database required)

### Frontend
- **Vue.js 3** with Composition API
- **Vue Router** for navigation
- **Vite** for build optimization
- **Modern CSS** with responsive design

## Project Structure

```
energy-adviser/
├── server.js                 # Main Express server
├── routes/
│   ├── auth.js              # OAuth2 authentication routes
│   ├── energy.js            # Energy data fetching routes
│   └── analysis.js          # Analysis endpoints
├── services/
│   └── analysisService.js   # Energy analysis algorithms
├── src/
│   ├── main.js              # Vue.js entry point
│   ├── App.vue              # Root component
│   ├── style.css            # Global styles
│   ├── router/
│   │   └── index.js         # Vue Router configuration
│   └── views/
│       ├── Dashboard.vue    # Main dashboard
│       ├── Analysis.vue     # Detailed analysis
│       └── Unauthorized.vue # Auth required page
├── dist/                    # Vue.js build output (generated)
├── package.json             # Project dependencies
├── vite.config.js           # Vite configuration
├── index.html               # HTML entry point
├── web.config               # Azure App Service config
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- EnergyID OAuth2 credentials (from https://oauth.energyid.eu)

### Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd energy-adviser
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your EnergyID credentials:
```env
# EnergyID OAuth Configuration
ENERGYID_CLIENT_ID=your_client_id_here
ENERGYID_CLIENT_SECRET=your_client_secret_here
ENERGYID_CALLBACK_URL=http://localhost:3000/api/auth/callback
SESSION_SECRET=your_random_secret_here
```

4. **Build Vue.js frontend** (optional for development)
```bash
npm run build
```

5. **Start the development server**
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Development Mode

For frontend development with hot reload:

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend dev server
npm run dev
```

## Configuration

### Environment Variables

Required:
- `ENERGYID_CLIENT_ID` - OAuth client ID from EnergyID
- `ENERGYID_CLIENT_SECRET` - OAuth client secret from EnergyID
- `SESSION_SECRET` - Random string for session encryption

Optional:
- `NODE_ENV` - Set to 'production' for Azure deployment
- `PORT` - Server port (default: 3000)
- `ENERGYID_CALLBACK_URL` - OAuth callback URL (default: http://localhost:3000/api/auth/callback)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

### EnergyID OAuth Setup

1. Register your application at https://oauth.energyid.eu
2. Configure the callback URL to match your deployment URL
3. Add the required scopes: `reading:interval_data`, `reading:calendar`
4. Copy the client ID and secret to your `.env` file

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate OAuth login
- `GET /api/auth/callback` - OAuth callback endpoint
- `GET /api/auth/user` - Get current user info
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/logout` - Logout user

### Energy Data
- `GET /api/energy/consumption?days=30` - Fetch consumption data
- `GET /api/energy/today` - Get today's consumption
- `GET /api/energy/meters` - Get meter information

### Analysis
- `POST /api/analysis/analyze` - Full analysis of consumption data
- `POST /api/analysis/summary` - Calculate summary statistics
- `POST /api/analysis/anomalies` - Detect outliers
- `POST /api/analysis/peak-hours` - Analyze peak hours
- `POST /api/analysis/night-consumption` - Analyze idle consumption

## Analysis Features

### Peak Hour Detection
Identifies hours with highest energy consumption and provides recommendations for load shifting.

### Night Consumption Analysis
Analyzes standby/idle consumption during low-usage hours to identify potential energy waste.

### Anomaly Detection
Uses statistical methods (Z-score analysis) to detect unusual consumption patterns that may indicate equipment issues.

### Smart Recommendations
Provides personalized recommendations based on:
- Idle consumption levels
- Peak hour patterns
- Consumption trends
- Detected anomalies

## Azure App Service Deployment

### Prerequisites
- Azure subscription
- Azure CLI installed and configured
- Web.config file (included in the project)

### Deployment Steps

1. **Build the application**
```bash
npm run build:all
```

2. **Create Azure App Service**
```bash
az group create --name energy-adviser-rg --location eastus
az appservice plan create --name energy-adviser-plan --resource-group energy-adviser-rg --sku B1
az webapp create --resource-group energy-adviser-rg --plan energy-adviser-plan --name energy-adviser-app --runtime "NODE|18"
```

3. **Configure environment variables in Azure**
```bash
az webapp config appsettings set --resource-group energy-adviser-rg --name energy-adviser-app --settings \
  ENERGYID_CLIENT_ID="your_client_id" \
  ENERGYID_CLIENT_SECRET="your_client_secret" \
  SESSION_SECRET="your_session_secret" \
  NODE_ENV="production"
```

4. **Deploy using Git**
```bash
az webapp deployment user set --user-name <username> --password <password>
git remote add azure <git-clone-url>
git push azure main
```

Or use **ZIP deployment**:
```bash
zip -r deployment.zip . -x "*.git*" "node_modules/*" "dist/*" ".env"
az webapp deployment source config-zip --resource-group energy-adviser-rg --name energy-adviser-app --src deployment.zip
```

5. **Verify deployment**
```bash
https://energy-adviser-app.azurewebsites.net
```

## Performance Considerations

- **Real-time Analysis**: All calculations are performed in-memory, ensuring fast response times
- **Caching**: Session management with cookies for faster subsequent requests
- **Compression**: Gzip compression enabled for all responses
- **Security Headers**: Helmet.js for security headers

## Security

- ✅ HTTPS enforced on production deployments
- ✅ Secure session cookies (HttpOnly, Secure flags)
- ✅ CORS protection
- ✅ OAuth2 authentication
- ✅ No sensitive data stored locally

## Troubleshooting

### OAuth Login Not Working
- Verify `ENERGYID_CLIENT_ID` and `ENERGYID_CLIENT_SECRET`
- Check callback URL matches configuration in EnergyID
- Ensure OAuth scopes include `reading:interval_data`

### No Energy Data
- Verify EnergyID account has associated meters
- Check that OAuth token hasn't expired
- Confirm date range in API calls is valid

### Build Errors on Azure
- Ensure Node.js version matches Azure runtime
- Run `npm run build:all` locally first
- Check that all dependencies are in package.json (not package-lock.json)

## Future Enhancements

- [ ] Historical data storage for trend analysis
- [ ] Machine learning for predictive recommendations
- [ ] Mobile app (React Native/Flutter)
- [ ] Email alerts for consumption anomalies
- [ ] Comparison with similar homes/neighborhoods
- [ ] Integration with smart home systems
- [ ] Export reports (PDF/CSV)

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review EnergyID API documentation
- Open an issue on the repository

## Acknowledgments

- [EnergyID](https://www.energyid.eu) for API access
- [Vue.js](https://vuejs.org) team for the excellent framework
- [Express.js](https://expressjs.com) community
