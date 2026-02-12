# Demo Mode Implementation Summary

This document summarizes all the changes made to implement demo mode functionality in the Energy Adviser application.

## Overview

A complete demo mode system has been implemented that allows testing and demoing the application without OAuth and real data connections. All sample data is served from a JSON file, and authentication is bypassed with instant demo login.

## Files Created

### 1. **data/sample-data.json**

Complete sample dataset with:

- 2 meters (electricity and gas)
- 48 hourly consumption records (2+ days worth)
- Today's consumption data (12 hours)
- Realistic patterns: low at night, peaks in morning and evening

### 2. **services/demoMode.js**

Core demo mode service providing:

- `loadSampleData()` - loads sample data from JSON file at startup
- `createDemoUser()` - generates demo user session
- `getSampleConsumptionData(days)` - filters consumption by time range
- `getSampleTodayConsumption()` - returns today's hourly data
- `getSampleMeters()` - returns meter definitions
- `isDemoModeEnabled()` - checks if demo mode is active
- `getStatus()` - returns demo mode health status

### 3. **DEMO_MODE.md**

Comprehensive documentation including:

- Quick start guide
- Complete API endpoint reference
- Sample responses for all endpoints
- Frontend integration examples
- Troubleshooting guide
- Environment variable reference

### 4. **DEMO_MODE_QUICKSTART.md**

Quick reference guide with:

- 30-second setup
- What's included
- API testing examples
- Frontend integration tips

### 5. **test-demo-mode.sh** (Linux/macOS)

Bash script to test all demo endpoints with curl

### 6. **test-demo-mode.bat** (Windows)

Batch script to test all demo endpoints with curl for Windows users

## Files Modified

### 1. **routes/auth.js**

Added demo mode support:

- New `GET /api/auth/demo-login` endpoint for instant demo login
- Updated `GET /api/auth/status` to include `isDemoMode` and `demoModeAvailable`
- Updated `GET /api/auth/user` to include demo mode information
- New `GET /api/auth/demo-status` endpoint (no auth required)
- Integrated demoMode service to create demo users

### 2. **routes/energy.js**

Added demo data serving:

- Modified `GET /api/energy/consumption` to return sample data in demo mode
- Modified `GET /api/energy/today` to return sample data in demo mode
- Modified `GET /api/energy/meters` to return sample data in demo mode
- All endpoints include `isDemoData: true` flag when serving demo data
- Real API calls still work when demo mode is disabled

### 3. **.env.example**

Added demo mode configuration:

- `DEMO_MODE` environment variable documentation
- Set default to `true` for easy testing
- Comments explaining that OAuth isn't needed in demo mode

## Environment Variables

| Variable    | Default | Purpose                  |
| ----------- | ------- | ------------------------ |
| `DEMO_MODE` | `false` | Enable/disable demo mode |

**Set via .env file:**

```dotenv
DEMO_MODE=true
```

## API Changes

### New Endpoints

```
GET /api/auth/demo-login
- No authentication required
- Returns demo user object
- Automatically creates session

GET /api/auth/demo-status
- No authentication required
- Returns demo mode status and sample data info
```

### Enhanced Existing Endpoints

All energy endpoints now:

- Return demo data when user is in demo mode
- Include `isDemoData: true` flag in responses for frontend awareness
- Fall back to real API calls for non-demo authenticated users

### Response Examples

```json
{
  "success": true,
  "data": [...],
  "isDemoData": true
}
```

## Demo User Structure

When logging in with demo mode:

```json
{
  "id": "uuid",
  "email": "demo@energyadviser.local",
  "name": "Demo User",
  "authenticated": true,
  "isDemoMode": true,
  "timestamp": "2026-02-12T00:00:00.000Z",
  "accessToken": "demo-token-uuid"
}
```

## Sample Data Contents

### Meters

- Main Electricity Meter (kWh)
- Gas Meter (m³)

### Consumption Patterns

- **Night (0:00-6:00):** 0.65-0.90 kWh/hour (minimum usage)
- **Morning (6:00-10:00):** 1.15-2.28 kWh/hour (peak usage)
- **Daytime (10:00-17:00):** 1.30-1.65 kWh/hour (moderate)
- **Evening (17:00-21:00):** 2.05-2.52 kWh/hour (peak usage)
- **Night (21:00-24:00):** 1.05-1.45 kWh/hour (decreasing)

## How It Works

1. **Server Startup**

   - demoMode service loads sample-data.json
   - `DEMO_MODE` environment variable is checked
   - Status logged to console

2. **Demo Login**

   - User calls `/api/auth/demo-login`
   - Demo user is created with `isDemoMode: true`
   - Session established with passport

3. **Data Requests**

   - When authenticated user requests energy data
   - API checks `req.user.isDemoMode`
   - If true, serves data from demoMode service (sample-data.json)
   - If false, calls real API with access token

4. **Frontend Awareness**
   - All responses include `isDemoData: true` when serving samples
   - Frontend can detect demo mode via user object `isDemoMode` property
   - Can display "Demo Mode" indicators as desired

## Switching Modes

**To enable demo mode:**

```bash
DEMO_MODE=true npm start
```

**To disable and use real OAuth:**

```bash
DEMO_MODE=false npm start
```

No code changes required - just adjust the environment variable.

## Testing

### Quick Test (2 minutes)

```bash
DEMO_MODE=true npm start
./test-demo-mode.sh  # Linux/macOS
# or
test-demo-mode.bat   # Windows
```

### Manual Testing

```bash
# Login
curl http://localhost:3000/api/auth/demo-login

# Use session to get data
curl -b cookies.txt http://localhost:3000/api/energy/consumption?days=7
```

## Benefits

✅ **No External Dependencies**

- No OAuth setup required
- No external API calls
- Works offline

✅ **Realistic Sample Data**

- Proper time series data
- Realistic consumption patterns
- Multiple days of history

✅ **Complete Feature Test**

- All analysis functions work
- All API endpoints functional
- Full user experience possible

✅ **Easy Integration**

- Single environment variable to toggle
- Backward compatible
- Can switch between modes instantly

✅ **Frontend Ready**

- `isDemoData` flag for UI adaptation
- `isDemoMode` in user object
- Demo mode endpoint for capabilities detection

## Next Steps for Frontend Integration

1. **Show Demo Indicator**

   - Check `user.isDemoMode` after login
   - Display badge or banner in UI

2. **Handle Demo Data**

   - Check `isDemoData` flag in API responses
   - Add sample data watermark if desired
   - Optionally disable real-time features

3. **Offer Demo Login**

   - Add "Demo Mode" button on login page
   - Call `/api/auth/demo-login` endpoint
   - Redirect to dashboard on success

4. **Optional: Feature Gating**
   - Disable real-time notifications
   - Disable data export in demo mode
   - Show disclaimer about sample data

## Support

For issues or questions:

1. Check [DEMO_MODE.md](DEMO_MODE.md) for detailed documentation
2. Check [DEMO_MODE_QUICKSTART.md](DEMO_MODE_QUICKSTART.md) for quick setup
3. Verify sample-data.json exists in `data/` directory
4. Check server logs for "Demo mode" messages
5. Use test scripts (test-demo-mode.sh/bat) to validate endpoints
