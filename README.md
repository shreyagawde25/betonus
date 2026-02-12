# Betonus

Betonus is now structured as a full-stack AI-assisted server security platform:

- **Landing page** (existing static site in repository root)
- **Backend API** (`backend/`) with Express + TypeScript + MongoDB
- **Dashboard app** (`frontend/`) with React + Vite at `/dashboard`
- **AI integration** for anomaly explanation using OpenAI

## Architecture

### Backend (Node.js + Express + TypeScript)

- `backend/src/routes` for API route definitions
- `backend/src/controllers` for request handlers
- `backend/src/models` for MongoDB entities (users, logs, alerts)
- `backend/src/services` for auth, anomaly detection, and OpenAI calls
- `backend/src/middleware` for auth and validation
- `backend/src/config` for env and DB configuration

### Frontend dashboard (React)

- Route: `/dashboard`
- Shows:
  - recent alerts
  - risk summaries
  - log ingestion status
- Includes sample call flow for AI explain endpoint

## Features implemented

1. **User auth**
   - `POST /api/auth/signup`
   - `POST /api/auth/login`
   - JWT bearer auth for protected endpoints

2. **Log ingestion API**
   - `POST /api/logs` (single log)
   - `POST /api/logs/bulk` (multiple logs)
   - `GET /api/logs/status`

3. **Anomaly detection**
   - Rule heuristics for suspicious auth/network/malware-like patterns
   - Stores alert records in MongoDB when flagged

4. **AI assist endpoint**
   - `POST /api/alerts/:alertId/explain`
   - Returns natural-language explanation, risk score, and steps

5. **Security basics**
   - CORS enabled
   - Helmet enabled
   - Rate limiting enabled
   - Input validation via `express-validator`

## Local development

### Prerequisites

- Node.js 20+
- MongoDB local instance (or Docker)

### 1) Configure env files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set values:

- `backend/.env`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `OPENAI_API_KEY` (optional but required for real AI output)
- `frontend/.env`
  - `VITE_API_URL=http://localhost:4000`
  - `VITE_DEMO_JWT=<token from signup/login>`

### 2) Run backend

```bash
cd backend
npm install
npm run dev
```

### 3) Run dashboard frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/dashboard`.

## Docker deployment (easy start)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# fill environment values first

docker compose up --build
```

Services:
- Frontend: `http://localhost:5173/dashboard`
- Backend: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017`

## Sample API usage

### 1) Signup

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"StrongPass123"}'
```

### 2) Send a log entry

```bash
curl -X POST http://localhost:4000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "host":"web-01",
    "source":"syslog",
    "level":"warn",
    "message":"Failed password for invalid user root from 203.0.113.42",
    "timestamp":"2026-01-01T12:00:00.000Z",
    "metadata":{"ip":"203.0.113.42"}
  }'
```

### 3) Frontend/example call to AI explanation endpoint

```ts
await fetch(`http://localhost:4000/api/alerts/${alertId}/explain`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Existing static site

The original static landing page remains in:

- `index.html`
- `styles.css`

You can still preview it with:

```bash
python3 -m http.server 4173
```
