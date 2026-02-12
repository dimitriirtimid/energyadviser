# Demo Mode Setup

The Energy Adviser application now includes a **Demo Mode** that allows you to test and demonstrate the application without requiring a connection to the energyID OAuth system or real energy data.

## Quick Start

### 1. Enable Demo Mode

Create or update your `.env` file in the project root:

```dotenv
DEMO_MODE=true
```

### 2. Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Login with Demo Credentials

In the application UI, use the demo login option (if implemented in your frontend), or call:

```bash
curl http://localhost:3000/api/auth/demo-login
```

This will return a demo user session that you can use to test the entire application.

## What's Included in Demo Mode

### Authentication

- No OAuth required
- Instant demo user creation at `/api/auth/demo-login`
- Demo user is automatically logged in and can access all protected routes

### Sample Data

All sample data is stored in `data/sample-data.json` and includes:

#### Meters

- Main Electricity Meter (electricity, measured in kWh)
- Gas Meter (gas, measured in m³)

#### Consumption Data

- 30+ days of hourly energy consumption data
- Realistic consumption patterns:
  - Low consumption during night hours (0:00-6:00)
  - Peak consumption during morning (7:00-9:00) and evening (17:00-20:00)
  - Moderate consumption during daytime hours

#### Today's Consumption

- Hourly data for the current day (February 12, 2026)
- Partial day data showing morning consumption

## API Endpoints

### Authentication

#### Demo Login (Demo Mode Only)

```
GET /api/auth/demo-login
```

**Response:**

```json
{
  "success": true,
  "message": "Demo login successful",
  "user": {
    "id": "uuid",
    "email": "demo@energyadviser.local",
    "name": "Demo User",
    "isDemoMode": true
  }
}
```

#### Check Authentication Status

```
GET /api/auth/status
```

**Response includes demo mode information:**

```json
{
  "authenticated": true,
  "isDemoMode": true,
  "demoModeAvailable": true,
  "user": {
    "id": "uuid",
    "email": "demo@energyadviser.local",
    "name": "Demo User",
    "isDemoMode": true,
    "timestamp": "2026-02-12T12:00:00.000Z"
  }
}
```

### Energy Data

All energy endpoints automatically serve demo data when authenticated with a demo user.

#### Get Consumption Data

```
GET /api/energy/consumption?days=30
```

**Response includes demo flag:**

```json
{
  "success": true,
  "data": [...consumption data...],
  "period": {
    "start": "2026-01-13T00:00:00.000Z",
    "end": "2026-02-12T00:00:00.000Z",
    "days": 30
  },
  "isDemoData": true
}
```

#### Get Today's Consumption

```
GET /api/energy/today
```

**Response includes demo flag:**

```json
{
  "success": true,
  "data": [...hourly data for today...],
  "date": "2026-02-12",
  "isDemoData": true
}
```

#### Get Meters

```
GET /api/energy/meters
```

**Response includes demo flag:**

```json
{
  "success": true,
  "meters": [...meter information...],
  "isDemoData": true
}
```

### Demo Status

Check demo mode availability without authentication:

```
GET /api/auth/demo-status
```

**Response:**

```json
{
  "demoModeEnabled": true,
  "sampleDataLoaded": true,
  "sampleDataPoints": 48,
  "meters": 2
}
```

## Frontend Integration

### Login Flow

Update your login page to offer demo mode option:

```javascript
// Demo login
async function demoLogin() {
  const response = await fetch("/api/auth/demo-login");
  const data = await response.json();

  if (data.success) {
    // Redirect to dashboard or home
    window.location.href = "/";
  }
}

// Check if demo mode is available
async function checkDemoAvailable() {
  const response = await fetch("/api/auth/demo-status");
  const status = await response.json();
  return status.demoModeEnabled;
}
```

### Data Handling

The API now includes an `isDemoData` flag in responses. Use this to optionally:

- Display a demo badge/banner
- Disable features that don't make sense with sample data
- Add disclaimers about data being for demonstration purposes

```javascript
// When fetching energy data
const response = await fetch("/api/energy/consumption?days=30");
const result = await response.json();

if (result.isDemoData) {
  console.log("Currently viewing demo/sample data");
  // Could show a banner or indicator
}
```

### Checking Demo Mode

Check if the current user is in demo mode:

```javascript
async function isUserInDemoMode() {
  const response = await fetch("/api/auth/user");

  if (response.ok) {
    const user = await response.json();
    return user.isDemoMode === true;
  }

  return false;
}
```

## Adding More Sample Data

To add more sample data:

1. Edit `data/sample-data.json`
2. Add consumption data points with timestamps
3. Restart the server (the demo mode service automatically reloads the file)

Sample data structure:

```json
{
  "meters": [
    {
      "id": "meter-001",
      "name": "Meter Name",
      "type": "electricity|gas",
      "unit": "kWh|m³",
      "installationDate": "2022-01-15",
      "active": true
    }
  ],
  "consumptionData": [
    {
      "timestamp": "2025-02-02T00:00:00Z",
      "consumption": 0.85,
      "meterId": "meter-001"
    }
  ],
  "todayConsumption": [
    {
      "timestamp": "2026-02-12T00:00:00Z",
      "consumption": 0.9,
      "meterId": "meter-001"
    }
  ]
}
```

## Troubleshooting

### Demo Mode Not Working

1. **Check DEMO_MODE environment variable:**

   ```bash
   echo $DEMO_MODE  # Should output 'true'
   ```

2. **Check sample data is loaded:**

   ```bash
   curl http://localhost:3000/api/auth/demo-status
   ```

   Should show `"sampleDataLoaded": true`

3. **Check logs for errors:**
   - Look for "✓ Demo mode: Sample data loaded successfully" on startup
   - Or look for "✗ Failed to load demo sample data" errors

### Sample Data Not Updating

- The sample data file is loaded when the server starts
- To apply changes, restart the server: `npm restart`

## Environment Variables

| Variable    | Default       | Description                       |
| ----------- | ------------- | --------------------------------- |
| `DEMO_MODE` | `false`       | Set to `true` to enable demo mode |
| `NODE_ENV`  | `development` | Node environment                  |
| `PORT`      | `3000`        | Server port                       |

## Disabling Demo Mode

To switch back to production mode:

1. Set `DEMO_MODE=false` in `.env`
2. Ensure you have valid EnergyID OAuth credentials:
   - `ENERGYID_CLIENT_ID`
   - `ENERGYID_CLIENT_SECRET`
3. Restart the server

Standard OAuth login flow will be used instead.

## Notes

- Demo mode can be enabled/disabled by changing the environment variable without code changes
- Sample data is read-only and loaded from the JSON file at startup
- Demo users are not persisted in any database
- All analysis and calculations work identically with demo data as with real data
- The `isDemoData` flag is included in API responses for frontend awareness
