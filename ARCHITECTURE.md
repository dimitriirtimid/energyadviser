# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      End User Browser                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Vue.js Single Page Application                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Dashboard View                                       │  │
│  │ - Display Summary Statistics                         │  │
│  │ - Show Peak Hours                                    │  │
│  │ - Display Recommendations                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Analysis View                                        │  │
│  │ - Detailed Hourly Breakdown                          │  │
│  │ - Night Consumption Analysis                         │  │
│  │ - Anomalies & Outliers                              │  │
│  │ - Trends & Recommendations                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Router                                               │  │
│  │ - Route Protection (Auth Guards)                     │  │
│  │ - Navigation Management                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API Calls
                          │ JSON over HTTP(S)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          Express.js Server (Node.js Backend)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes & Controllers                                 │  │
│  │                                                      │  │
│  │ 1. Authentication Route (/api/auth/*)               │  │
│  │    - OAuth2 Flow with EnergyID                       │  │
│  │    - Session Management                             │  │
│  │    - User Status Checks                             │  │
│  │                                                      │  │
│  │ 2. Energy Data Route (/api/energy/*)                │  │
│  │    - Fetch consumption data from EnergyID API       │  │
│  │    - Get meter information                          │  │
│  │                                                      │  │
│  │ 3. Analysis Route (/api/analysis/*)                 │  │
│  │    - Request analysis of energy data                │  │
│  │    - Return statistical insights                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Analysis Service                                     │  │
│  │                                                      │  │
│  │ • calculateSummary()       - Aggregate statistics   │  │
│  │ • detectOutliers()         - Statistical analysis   │  │
│  │ • analyzePeakHours()       - Hourly patterns        │  │
│  │ • analyzeNightConsumption()- Idle consumption       │  │
│  │ • calculateTrends()        - Trend analysis         │  │
│  │ • generateRecommendations()- AI suggestions         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                     │  │
│  │ (Security, Compression, Session Management)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ OAuth Redirects
                          │ API Requests
                          ▼ (Bearer Token)
┌─────────────────────────────────────────────────────────────┐
│              EnergyID External Services                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ OAuth Provider                                       │  │
│  │ ├─ Authorize endpoint                               │  │
│  │ └─ Token endpoint                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Energy Data API                                      │  │
│  │ ├─ Interval data endpoint                            │  │
│  │ ├─ Meter information                                 │  │
│  │ └─ Calendar data                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User → [Click Login] → Frontend → Backend (GET /api/auth/login)
  ↓
Backend → OAuth Authorize → EnergyID OAuth Server
  ↓
User Grants Permission → EnergyID Redirects to Callback
  ↓
Backend (GET /api/auth/callback) → Exchange Code for Token
  ↓
Backend → Create Session → Redirect to Dashboard
  ↓
Frontend → Display Dashboard
```

### 2. Energy Analysis Flow

```
User → [View Dashboard] → Frontend (mounted)
  ↓
Frontend → Request Energy Data (GET /api/energy/consumption)
  ↓
Backend → Fetch from EnergyID API (with Bearer Token)
  ↓
EnergyID API → Return Consumption Records
  ↓
Backend → Return Data to Frontend
  ↓
Frontend → POST /api/analysis/analyze with data
  ↓
Backend (Analysis Service) → Process:
  • Calculate Summary Stats
  • Detect Outliers (Z-score)
  • Analyze Peak Hours
  • Analyze Night Consumption
  • Identify Trends
  • Generate Recommendations
  ↓
Backend → Return Analysis Results
  ↓
Frontend → Display Charts & Insights
```

## Component Hierarchy

```
App.vue (Root)
├── Navigation Bar
│   ├── Logo
│   ├── Navigation Links
│   └── Auth Links
├── RouterView
│   ├── Dashboard.vue
│   │   ├── Hero Section
│   │   ├── Auth Section (if not logged in)
│   │   ├── Statistics Cards
│   │   ├── Summary Stats
│   │   └── Recommendations
│   ├── Analysis.vue
│   │   ├── Period Selector
│   │   ├── Peak Hours Analysis
│   │   ├── Night Consumption Card
│   │   ├── Anomalies Card
│   │   ├── Trends Card
│   │   └── Recommendations Card
│   └── Unauthorized.vue
│       └── Login Prompt
└── Footer
```

## Analysis Algorithms

### Peak Hour Detection

```
1. Group consumption by hour
2. Calculate average per hour
3. Sort by consumption (descending)
4. Identify top 3 hours
5. Span is range from min to max of top 3

Time Complexity: O(n)
Space Complexity: O(24) for hourly buckets
```

### Anomaly Detection (Z-Score Method)

```
1. Calculate mean of all values
2. Calculate standard deviation
3. For each value:
   z_score = (value - mean) / std_dev
   if z_score > 2: marked as outlier
   if z_score > 3: marked as high severity

Detection threshold: 2 standard deviations
Handles both positive (high) and negative (low) anomalies

Time Complexity: O(2n) = O(n)
Space Complexity: O(n) for outlier list
```

### Night Consumption Analysis

```
Night Hours: 00:00 - 06:00
Day Hours: 06:00 - 18:00
Evening Hours: 19:00 - 23:00

1. Separate measurements by time period
2. Calculate average for each period
3. Percentage = (night_avg / day_avg) * 100
4. Recommendation threshold: > 30%

Useful for identifying:
• Phantom loads (standby power)
• Always-on devices
• Ineffective power management
```

### Trend Analysis

```
1. Split data into two halves
2. Calculate average for each half
3. Percentage change = ((second - first) / first) * 100
4. Classify:
   - Increasing: change > 5%
   - Decreasing: change < -5%
   - Stable: -5% ≤ change ≤ 5%

Indicates:
• Seasonal changes
• Behavioral changes
• Equipment efficiency changes
```

## Real-Time Processing

**Key Advantage**: No database needed

```
Data Flow:
┌─────────────────────────────────────────┐
│ EnergyID API Returns JSON Data          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Analysis Service Processes In-Memory    │
│                                         │
│ • Performs calculations                 │
│ • Generates statistics                  │
│ • Identifies patterns                   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Returns Results to Frontend             │
│                                         │
│ • No database latency                   │
│ • Instant results                       │
│ • Always fresh analysis                 │
└─────────────────────────────────────────┘
```

## Security Architecture

```
User Request
    ↓
Helmet Middleware (Security Headers)
    ↓
CORS Middleware (Origin Validation)
    ↓
Session Middleware (Cookie Validation)
    ↓
Passport Authentication (OAuth Verification)
    ↓
Route Handler (Process Request)
    ↓
Response with:
• Secure Cookies (HttpOnly, Secure, SameSite)
• CORS Headers
• Security Headers
```

## Deployment Architecture (Azure)

```
Azure App Service
├── Application Code
│   ├── server.js
│   ├── routes/
│   ├── services/
│   └── dist/ (built Vue.js)
├── Node.js Runtime (18+)
├── Environment Variables
│   ├── ENERGYID_CLIENT_ID
│   ├── ENERGYID_CLIENT_SECRET
│   ├── SESSION_SECRET
│   └── NODE_ENV
└── Configuration
    ├── web.config (IIS integration)
    └── package.json
```

## Performance Considerations

### Response Times

- **Consumption Data Fetch**: ~1-2s (EnergyID API)
- **Analysis Processing**: ~100-200ms (in-memory)
- **Total Dashboard Load**: ~2-3s

### Memory Usage

- **Data Set (30 days)**: ~100-500KB
- **Analysis Results**: ~50KB
- **Server Runtime**: ~50-100MB

### Scalability

- Stateless design (scales horizontally)
- Session cookies (can use sticky sessions)
- Real-time processing (no queue needed)
- Can handle 100+ concurrent users on B1 Azure SKU

## Future Architecture Enhancements

```
Current (In-Memory Only)
├── User
├── Backend (Real-time Analysis)
└── EnergyID API

Future (With Persistence)
├── User
├── Backend
├── Cache Layer (Redis)
├── Database (PostgreSQL)
├── Queue (RabbitMQ)
├── Machine Learning Service
├── EnergyID API
└── External Data Sources
```

## Error Handling

```
Application Error
    ↓
Caught by Route Handler or Error Middleware
    ↓
Log to Console (development) or APM (production)
    ↓
Return JSON Error Response
    ├── 400: Bad Request (invalid input)
    ├── 401: Unauthorized (not authenticated)
    ├── 403: Forbidden (no permission)
    ├── 500: Server Error (processed safely)
    └── Include helpful message if development mode
```

## Technology Rationale

| Layer      | Technology        | Why                                               |
| ---------- | ----------------- | ------------------------------------------------- |
| Backend    | Express.js        | Lightweight, fast, excellent middleware ecosystem |
| Frontend   | Vue.js 3          | Reactive, easy to learn, great for dashboards     |
| Build      | Vite              | Lightning fast, modern ES modules support         |
| Auth       | Passport.js       | Standardized OAuth implementation                 |
| API Client | Axios             | Promise-based, interceptor support                |
| Server     | Node.js           | JavaScript full-stack, single language            |
| Deployment | Azure App Service | Managed, scalable, pay-as-you-go                  |

## Monitoring & Debugging

```
Development:
├── Console logs (npm start)
├── Browser DevTools
├── Postman for API testing
└── network tab for request/response

Production:
├── Azure Application Insights
├── Error logging & alerts
├── Performance monitoring
└── Usage analytics
```

## API Response Examples

### Successful Analysis Response

```json
{
  "success": true,
  "analysis": {
    "summary": {
      "totalConsumption": 145.23,
      "averageConsumption": 4.84,
      "minConsumption": 1.2,
      "maxConsumption": 8.5,
      "dataPoints": 30,
      "variance": 2.15
    },
    "peakHours": {
      "peakStartHour": 18,
      "peakEndHour": 21,
      "peakConsumption": 7.2,
      "averageConsumption": 4.84
    },
    "nightConsumption": {
      "nightConsumption": 0.8,
      "dayConsumption": 5.2,
      "nightPercentage": 15.4
    },
    "outliers": [],
    "trends": {
      "trend": "stable",
      "percentageChange": -2.3
    },
    "recommendations": [...]
  }
}
```
