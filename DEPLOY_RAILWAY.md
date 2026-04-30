# Railway Deploy Guide (Backend)

## 1) Push backend to GitHub
- Ensure `backend/` is in your repo.
- Commit and push your latest backend changes.

## 2) Create Railway project
- Go to [Railway](https://railway.app/)
- `New Project` -> `Deploy from GitHub repo`
- Select your repository and set **Root Directory** to `backend`

## 3) Add persistent volume (important)
- In Railway project: `New` -> `Volume`
- Mount path: `/data`
- Railway auto-sets `RAILWAY_VOLUME_MOUNT_PATH` for mounted volume.

This backend now stores runtime DB file at:
- `${RAILWAY_VOLUME_MOUNT_PATH}/data/database.json`

So data remains after redeploy/restart.

## 4) Environment variables
- `PORT` is auto-provided by Railway (no need to hardcode)
- Optional:
  - `DATABASE_FILE=/data/database.json` (if you want explicit file path)

## 5) Auto deploy from GitHub
- In Railway service settings, enable `Auto Deploy` from your branch (usually `main`)
- From now on, every push triggers build and deploy automatically.

## 6) Verify
- Open: `https://<your-railway-domain>/api/health`
- Expected response: `{ "ok": true, "service": "vacancy-backend" }`

## 7) Frontend API URL
Set frontend env:
- `VITE_API_BASE_URL=https://<your-railway-domain>/api`

## 8) SSE (Realtime) checklist
- SSE endpointlar:
  - `GET /api/events/company?ownerUserId=...`
  - `GET /api/events/employee?userId=...&email=...`
- Server heartbeat yuboradi (`: ping`) har ~25s; bu Railway/proxy idle timeoutlarga qarshi kerak.
- Frontend `EventSource` ulanishi uzilganda avtomatik reconnect qiladi (2s interval bilan).
- `CORS_ORIGINS` env ga frontend domain(lar)ini qo‘shing, aks holda SSE ulanish bloklanadi.
- Railway deploydan keyin brauzer Network’da `event-stream` statusini tekshiring (connection doim ochiq turishi kerak).
- Health check alohida qoladi: `GET /api/health`.

