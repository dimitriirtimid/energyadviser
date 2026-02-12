# Demo Mode Setup Checklist

Use this checklist to quickly set up and verify demo mode is working.

## ✅ Pre-Setup

- [ ] Node.js 18+ is installed
- [ ] Project dependencies are installed (`npm install`)
- [ ] You are in the project root directory

## ✅ Enable Demo Mode

### Option 1: Create/Edit .env file

```bash
# Create .env file in project root with:
DEMO_MODE=true
```

- [ ] `.env` file exists in project root
- [ ] `DEMO_MODE=true` is set in `.env`
- [ ] No other conflicting settings in `.env`

### Option 2: Set via environment

```bash
# Windows
set DEMO_MODE=true && npm start

# Linux/macOS
DEMO_MODE=true npm start
```

## ✅ Verify Sample Data

- [ ] `data/sample-data.json` file exists
- [ ] File contains valid JSON
- [ ] File has `meters`, `consumptionData`, and `todayConsumption` sections
- [ ] Sample data includes realistic consumption patterns

## ✅ Start Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

- [ ] Server starts without errors
- [ ] Console shows: "✓ Demo mode: Sample data loaded successfully"
- [ ] Server is listening on port 3000 (or configured PORT)

## ✅ Test Authentication

```bash
curl http://localhost:3000/api/auth/demo-status
```

- [ ] Returns valid JSON response
- [ ] `demoModeEnabled` is `true`
- [ ] `sampleDataLoaded` is `true`

```bash
curl http://localhost:3000/api/auth/demo-login
```

- [ ] Returns 200 status code
- [ ] Response includes user object with `isDemoMode: true`
- [ ] User has `id`, `email`, `name` fields

## ✅ Test Data Endpoints

### Test Meters

```bash
curl -b cookies.txt http://localhost:3000/api/energy/meters
```

- [ ] Returns array of meters
- [ ] Includes electricity and gas meters
- [ ] Response includes `isDemoData: true`

### Test Consumption Data

```bash
curl -b cookies.txt "http://localhost:3000/api/energy/consumption?days=7"
```

- [ ] Returns consumption data array
- [ ] Includes `timestamp` and `consumption` fields
- [ ] Response includes `isDemoData: true`
- [ ] Contains realistic hourly values (0.6-2.5 kWh)

### Test Today's Data

```bash
curl -b cookies.txt http://localhost:3000/api/energy/today
```

- [ ] Returns today's consumption data
- [ ] Includes hourly breakdown
- [ ] Response includes `isDemoData: true`

## ✅ Test Analysis Endpoints

Assuming Analysis service uses same auth:

```bash
# Get some data first
curl -b cookies.txt "http://localhost:3000/api/energy/consumption?days=7" > consumption.json

# Send to analysis
curl -X POST -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"data": [...]}' \
  http://localhost:3000/api/analysis/analyze
```

- [ ] Analysis endpoints work with demo data
- [ ] All calculations produce valid results
- [ ] No errors in processing

## ✅ Test Logout

```bash
curl -b cookies.txt http://localhost:3000/api/auth/logout
```

- [ ] Returns success message
- [ ] Session is cleared

```bash
curl -b cookies.txt http://localhost:3000/api/auth/user
```

- [ ] Returns 401 Unauthorized (no longer authenticated)

## ✅ Frontend Integration

If you have a Vue.js frontend:

- [ ] Login form offers demo mode option
- [ ] `POST` to `/api/auth/demo-login` or similar endpoint
- [ ] User is authenticated and can access dashboard
- [ ] Data loads and displays properly
- [ ] Optional: Demo mode indicator/badge shows on page

## ✅ Documentation Review

- [ ] Read [DEMO_MODE.md](DEMO_MODE.md) for full details
- [ ] Read [DEMO_MODE_QUICKSTART.md](DEMO_MODE_QUICKSTART.md) for quick reference
- [ ] Read [DEMO_MODE_IMPLEMENTATION.md](DEMO_MODE_IMPLEMENTATION.md) for technical details

## ✅ Optional: Advanced Testing

```bash
# Run the test script (Linux/macOS)
./test-demo-mode.sh

# Or Windows
test-demo-mode.bat
```

- [ ] All tests pass
- [ ] All endpoints return valid responses

## ✅ Demo Ready!

You're all set! Your application now:

- ✅ Supports demo mode with no OAuth
- ✅ Serves realistic sample data from JSON file
- ✅ Works completely offline
- ✅ Can be toggled with environment variable
- ✅ Is backward compatible with real OAuth

## Switch Back to Production

When ready to use real OAuth:

1. [ ] Set `DEMO_MODE=false` in `.env`
2. [ ] Add valid OAuth credentials:
   - [ ] `ENERGYID_CLIENT_ID`
   - [ ] `ENERGYID_CLIENT_SECRET`
3. [ ] Restart server
4. [ ] Standard OAuth login flow will be used

## Troubleshooting

| Issue                                                    | Solution                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| "Demo mode: Sample data loaded successfully" not in logs | Check that `DEMO_MODE=true` is set in environment               |
| `demoModeEnabled` returns false                          | Restart server and verify `DEMO_MODE=true` in `.env`            |
| `isDemoData` not in response                             | Ensure user has `isDemoMode: true` (check via `/api/auth/user`) |
| 401 Unauthorized errors                                  | May need to login first via `/api/auth/demo-login`              |
| Sample data not updating                                 | Restart server after editing `data/sample-data.json`            |

## Performance Notes

- Demo mode is **fast** - reads from local JSON file
- No network calls to external services
- Perfect for testing and demonstrations
- Works offline

## Security Notes

- Demo users are **not** stored in any database
- Demo mode should only be used for development/demo
- No real authentication when in demo mode
- Always use `DEMO_MODE=false` in production

---

**Questions?** Check the documentation files or add more sample data to `data/sample-data.json`
