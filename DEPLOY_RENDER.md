# Render Deploy Guide (Backend + PostgreSQL)

Hammasi Render platformasida: Web Service (backend) + Render Postgres (ma'lumotlar bazasi).

## 1) Render Postgres yaratish

1. [render.com](https://render.com) → **New** → **PostgreSQL**
2. **Name:** `vacancy-db` (ixtiyoriy)
3. **Instance Type:** Free (1 GB, **30 kundan keyin tugaydi** — demo uchun yetarli)
4. **Create Database**
5. **Connections** bo'limidan **Internal Database URL** ni nusxalang (Web Service bilan bir xil Render account ichida ishlatiladi)

## 2) Render Web Service yaratish

1. **New** → **Web Service** → GitHub repongizni tanlang
2. Sozlamalar:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. **Environment Variables:**
   - `DATABASE_URL` = Postgres **Internal Database URL** (Render avtomatik ham ulashi mumkin — "Link Database" tugmasi)
   - `CORS_ORIGINS` = `https://your-job-by-isroilov.netlify.app,http://localhost:5173`
4. **Create Web Service**

Birinchi deploy'da backend avtomatik ravishda jadval yaratadi va `database.json` dan ma'lumot seed qiladi (agar DB bo'sh bo'lsa).

## 3) Tekshirish

```bash
curl https://<service-name>.onrender.com/api/health
```

Kutilgan javob:
```json
{ "ok": true, "service": "vacancy-backend" }
```

```bash
curl https://<service-name>.onrender.com/api/vacancies
curl https://<service-name>.onrender.com/api/courses
```

## 4) Frontend (Netlify)

1. Netlify → Site settings → Environment variables:
   - `VITE_API_BASE_URL` = `https://<service-name>.onrender.com/api`
2. **Trigger deploy** (qayta build)
3. Local `frontend/.env` faylni ham shu URL bilan yangilang

## 5) Qo'lda seed (ixtiyoriy)

Ma'lumotni qayta yuklash kerak bo'lsa, Render dashboard → Web Service → **Shell**:

```bash
npm run seed:postgres
```

Yoki local (External Database URL bilan):

```powershell
cd backend
$env:DATABASE_URL="postgresql://..."
npm run seed:postgres
```

## Render bepul cheklovlari

| Xizmat | Cheklov |
|--------|---------|
| Web Service | 15 daqiqa faolsizlikdan keyin uxlaydi, cold start 30–60s |
| Postgres (Free) | 1 GB, **30 kundan keyin o'chadi** (keyin $6/oy) |
| Soatlar | 750 soat/oy (1 app 24/7 uchun yetadi) |

SSE (realtime) server uxlasa uziladi — frontend avtomatik reconnect qiladi.

## Local development

Postgres'siz JSON fayl bilan ishlash (eng oson):

```bash
cd backend
npm run dev
```

Local Postgres bilan:

```powershell
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/vacancy"
npm run dev
```
