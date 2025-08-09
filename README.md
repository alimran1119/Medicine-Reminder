# Med Reminder (HTML/CSS/JS + Node + MongoDB)

Designed, responsive, and fully linked UI. Free to run, no paid services.

## 1) Extract & Install
```bash
unzip med-reminder-web-pro.zip
cd med-reminder-web
cp .env.example .env
# Edit .env -> MONGODB_URI (local or MongoDB Atlas free), JWT_SECRET (random string)
npm install
```

## 2) Seed 120+ Medicines (optional but recommended)
```bash
node scripts/seed.js
```

## 3) Run (dev)
```bash
npm run dev
# Open http://localhost:3000
```

## 4) Use the app
- **Login/Register:** http://localhost:3000/index.html
- **Reminders:** http://localhost:3000/dashboard.html
- **Medicine Corner:** http://localhost:3000/catalog.html
- **Admin Upload:** http://localhost:3000/admin.html

> To become **admin**, update your user document in MongoDB: set `role` to `"admin"`.

## 5) Features
- Auth (JWT), responsive UI
- Add/edit reminders (create/delete now; edit can be added)
- Server scheduler (every minute) to roll reminders and send emails (if SMTP set)
- Medicine Corner with grid cards
- Admin upload (name, BDT price, image) — images stored locally in `/uploads`

## 6) Free email reminders (optional)
Edit `.env` with SMTP creds (e.g., Gmail App Password) then restart. If you don’t need emails, leave SMTP empty.

## 7) Common issues
- **Mongo not running**: start local Mongo or use Atlas free connection string
- **JWT error**: set a valid `JWT_SECRET` in `.env`
- **File uploads**: ensure the `uploads/` folder exists (created automatically)

## 8) Next steps (just ask and I’ll add)
- Edit/Delete catalog items from Admin page
- Search/filter in Medicine Corner
- Client-side image compression
- Dockerfile + deploy template (Render/railway free)

## 9) Web Push Notifications (FREE)
1. Generate VAPID keys:
   ```bash
   node scripts/gen-vapid.js
   ```
   Copy the output into `.env`:
   ```
   VAPID_PUBLIC=...
   VAPID_PRIVATE=...
   SITE_URL=http://localhost:3000
   ```
2. Restart the server and open **Dashboard** or **Medicine Corner** → click **Enable Notifications**.
3. Keep the tab open at least once so the Service Worker registers. Reminders will trigger a **browser notification** when due.

## 10) Docker (local, free)
```bash
docker compose up --build
# open http://localhost:3000
```

## 11) One‑click (Render free)
1. Push this repo to GitHub.
2. In Render → **New Web Service** → **Blueprint** → pick your repo (it reads `render.yaml`).
3. Set env vars in Render dashboard: `MONGODB_URI` (Atlas free), `JWT_SECRET`, `VAPID_PUBLIC`, `VAPID_PRIVATE`, `SITE_URL` (your Render URL).
4. Deploy.

> Tip: MongoDB Atlas free cluster works well with Render free web service.

