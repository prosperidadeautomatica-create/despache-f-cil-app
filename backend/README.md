# Easy Dispatch Backend

NestJS API Gateway for Easy Dispatch shipping quote management system.

## Features

- 🔐 JWT-based authentication
- 📦 Carrier integration (Frenet) with adapter pattern
- 💰 Server-side profit margin calculation
- 🔥 Firestore persistence
- ⚡ Circuit breaker and retry logic
- 📊 Request correlation IDs and structured logging
- 🧪 Unit and integration tests
- 📚 Swagger API documentation

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Frenet API credentials (or other carrier API)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - Set `JWT_SECRET` to a secure random string
   - Configure Firebase credentials (either JSON file path or environment variables)
   - Add Frenet API credentials
   - Adjust other settings as needed

4. Place your Firebase service account JSON file in the project root (if using file-based auth) and set `FIREBASE_CREDENTIALS_PATH` in `.env`

5. Seed demo client (optional):
```bash
npm run seed:client
```

## Running the Application

### Development
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api/docs`

## Project Structure

```
src/
├── auth/              # Authentication module (JWT)
├── billing/           # Profit margin calculation
├── carriers/          # Carrier adapters (Frenet)
│   ├── adapters/      # Carrier-specific implementations
│   └── circuit-breaker.service.ts
├── common/            # Shared utilities
│   ├── dto/           # Common DTOs
│   ├── filters/       # Exception filters
│   └── interceptors/  # Request interceptors
├── config/            # Configuration schemas
├── firestore/         # Firestore service
├── quotes/            # Quote management
│   ├── dto/           # Request/Response DTOs
│   └── interfaces/    # Type definitions
└── main.ts            # Application entry point
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON | Yes* |
| `CARRIER_FRENET_APIKEY` | Frenet API key | Yes |
| `CARRIER_FRENET_TOKEN` | Frenet API token | Optional |
| `CARRIER_TIMEOUT_MS` | Carrier API timeout (ms) | No (default: 10000) |
| `CARRIER_RETRY_ATTEMPTS` | Number of retry attempts | No (default: 1) |
| `BILLING_MARKUP_PERCENT` | Profit margin percentage | No (default: 20) |
| `BILLING_FIXED_FEE` | Fixed fee amount | No (default: 5.0) |

*Either `FIREBASE_CREDENTIALS_PATH` or `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Quotes
- `POST /api/quotes` - Create a new quote
- `GET /api/quotes` - List quotes (with filters)
- `GET /api/quotes/:id` - Get quote details

All quote endpoints require JWT authentication (Bearer token).

## Profit Margin Calculation

The profit margin is calculated server-side using the formula:
```
P_venda = negotiated_cost * (1 + markup_percent) + fixed_fee
```

Default values:
- Markup: 20% (0.20)
- Fixed fee: 5.00

These can be configured via environment variables.

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Deployment

### Recommended Platforms
- **Render**: Easy deployment with environment variables
- **Railway**: Good for Node.js apps
- **DigitalOcean App Platform**: Simple deployment
- **Google Cloud Run**: Serverless option

### Deployment Steps

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Deploy the `dist` folder (or let the platform build from source)

4. Ensure the following are set:
   - All required environment variables
   - Node.js version 18+
   - Build command: `npm run build`
   - Start command: `npm run start:prod`

## Firestore Security Rules

Example security rules to restrict access by client:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId}/quotes/{quoteId} {
      allow read, write: if request.auth != null && 
        request.auth.token.clientId == clientId;
    }
    match /clients/{clientId} {
      allow read: if request.auth != null && 
        request.auth.token.clientId == clientId;
    }
  }
}
```

## Error Handling

All errors follow a consistent format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "correlationId": "uuid-for-tracking",
  "timestamp": "2024-01-01T12:00:00Z",
  "path": "/api/quotes"
}
```

## Circuit Breaker

The circuit breaker protects against cascading failures:
- Opens after 5 consecutive failures (configurable)
- Automatically resets after 1 minute
- Returns 503 Service Unavailable when open

## Logging

Structured logging with correlation IDs:
- All requests include a correlation ID
- Logs include request/response details
- Errors include stack traces

## License

Proprietary - Easy Dispatch

