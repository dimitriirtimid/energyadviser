# Demo Mode Quick Start Guide

## 30-Second Setup

1. **Set environment variable:**

   ```bash
   echo DEMO_MODE=true > .env
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Login (via API):**

   ```bash
   curl http://localhost:3000/api/auth/demo-login
   ```

4. **Get demo data:**
   ```bash
   curl -b "connect.sid=your_session_id" http://localhost:3000/api/energy/meters
   ```

## What You Get

✅ No OAuth setup required  
✅ No real energy data connection needed  
✅ Complete sample data for testing:

- Electricity and Gas meters
- 30+ days of hourly consumption data
- Realistic consumption patterns

## Testing the Full API

```bash
# 1. Check if demo mode is available
curl http://localhost:3000/api/auth/demo-status

# 2. Login to demo
curl -c cookies.txt http://localhost:3000/api/auth/demo-login

# 3. Get meters
curl -b cookies.txt http://localhost:3000/api/energy/meters

# 4. Get 30 days consumption
curl -b cookies.txt "http://localhost:3000/api/energy/consumption?days=30"

# 5. Get today's consumption
curl -b cookies.txt http://localhost:3000/api/energy/today

# 6. Check auth status
curl -b cookies.txt http://localhost:3000/api/auth/status

# 7. Logout
curl -b cookies.txt http://localhost:3000/api/auth/logout
```

## Frontend Testing with Sample Data

The API now includes an `isDemoData` flag in all energy responses when in demo mode. Your frontend can use this to:

- Show a "Demo Mode" indicator
- Add sample data watermarks
- Test UI with realistic data without external dependencies

All data is realistic and includes:

- Night vs. day consumption patterns
- Peak hours (morning and evening)
- Varying consumption patterns across days

## Switching Between Modes

**Enable Demo:**

```bash
DEMO_MODE=true npm start
```

**Disable Demo (use OAuth):**

```bash
DEMO_MODE=false npm start
```

## Documentation

See [DEMO_MODE.md](DEMO_MODE.md) for complete documentation.
