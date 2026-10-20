# TourFlow AI

Tourist destination explorer, crowd estimates and digital FIFO queue management for
destinations across India (100 destinations from the project's tourism dataset).

- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3 + React Router
- **Backend:** Node.js + Express (the only backend dependency)
- **Storage:** one JSON database file (`backend/data/tourflow-db.json`), created automatically
- **Auth:** passwords hashed with scrypt, random session tokens, roles checked on the server

---

## 1. First-time setup

Requirements: **Node.js 18 or newer** (`node -v`).

```bash
# in the project root (frontend)
npm install

# backend
cd backend
npm install
```

Create the backend settings file and choose your own admin login:

```bash
# Windows:   copy backend\.env.example backend\.env
# Mac/Linux: cp backend/.env.example backend/.env
```

Open `backend/.env` and set:

```
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=YourStrongPassword123
```

The admin account is created automatically the first time the backend starts.
`backend/.env` is in `.gitignore`. Never commit it.

## 2. Run (two terminals)

**Terminal 1 - backend**
```bash
cd backend
npm run dev
```
Expected output: `TourFlow backend running on http://localhost:5000`

**Terminal 2 - frontend** (project root)
```bash
npm run dev
```

Open **http://localhost:3000**

| Page | URL |
|---|---|
| Home | http://localhost:3000/ |
| Tourist login / register | /login, /register |
| Admin login | http://localhost:3000/admin/login |
| Admin dashboard | /admin |

## 3. Admin accounts

- Tourists can only register as tourists. The register API ignores any `role` sent to it.
- The first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`.
- To create another admin, or reset a password:
  ```bash
  cd backend
  npm run create-admin -- admin2@example.com "AnotherStrongPass1" "Admin Name"
  ```
- Admins log in at `/admin/login`. A tourist account is rejected there, and an admin
  account is rejected on the tourist login.

## 4. Ports and common errors

| Problem | Fix |
|---|---|
| `Port 5000 is already in use` | Another program uses port 5000 (on Mac, often AirPlay Receiver). Do not kill unknown programs. Set `PORT=5050` in `backend/.env` **and** `BACKEND_PORT=5050` in a root `.env` (copy `.env.example`). Restart both. |
| Website says "Cannot reach the TourFlow server" | The backend is not running, or the ports do not match (see above). |
| `Cannot find package 'express'` | Run `npm install` inside `backend/`. |
| `@tailwindcss/postcss` error | That plugin is for Tailwind **v4**. This project uses Tailwind **v3** with `postcss.config.js` using `tailwindcss: {}`. Delete `node_modules` and `package-lock.json` changes, keep this `package.json`, run `npm install`. Do not install Tailwind v4. |
| Git conflict markers (`<<<<<<<`) | This version contains none. If your local copy has them, replace your `src/` and `backend/` folders with the ones from this version. |

## 5. How it works

### Queue rules (enforced by the backend)
- A tourist must be logged in to book. Admins cannot book.
- 1 to 4 people per booking; 0, 5 or more, decimals and text are rejected with a message.
- Each destination has its own FIFO queue. Each booking gets the next ticket number of
  that destination's queue. The current position is the place among waiting bookings,
  ordered by ticket number.
- A double-click or network retry sends the same `requestId`, so the server returns the
  first booking instead of creating a second one.
- A tourist can have only one active booking per destination.
- Status flow: `WAITING → CHECKED_IN → CHECKED_OUT`, or `WAITING → CANCELLED`.
  Only admins can check in and check out. A tourist can only cancel their own waiting booking.
- Tourists only ever see their own bookings.
- Every change is saved to `backend/data/tourflow-db.json` with an atomic write. Node handles
  requests one at a time, and booking creation has no `await` inside it, so simultaneous
  requests cannot get duplicate positions. Bookings and logins survive a restart.

### QR queue pass
Each booking has a random pass code. The QR code on the pass contains
`TOURFLOW:<bookingId>:<passCode>`. Staff paste the booking ID, the pass code or the scanned
QR text into **Admin → Check-in / out**. The QR generator is built into the project
(`src/utils/qrcode.js`); no extra package is needed.

### Crowd and waiting time (estimates)
There are **no live sensors, cameras or official integrations**. The crowd level combines:
1. **Season estimate** from the dataset: peak/off season months and popularity score.
2. **TourFlow queue**: people waiting (High at 40+, Moderate at 15+).

Estimated wait = people ahead ÷ entry rate.

- **Entry rate:** measured from check-ins once there are 5 or more in the last hour.
  Otherwise it uses the planning rate set by the admin (default 2 people/min).
- **Last updated:** the last queue activity is shown, and data older than 2 hours is marked stale.

### AI Tourist Guide
Answers come **only from the tourism dataset**, on the server (`backend/services/guideService.js`),
by matching keywords: attractions, seasons, crowd, itinerary, budget, safety, permits, food,
festivals, transport, customs, language, stay, and who it is good for. Questions it cannot
match get an honest "not in the dataset" reply. No paid AI API or key is needed. An external
AI model could be added later behind the same `/api/guide/ask` endpoint.

## 6. API overview

| Method | URL | Who |
|---|---|---|
| POST | /api/auth/register | public (creates tourist) |
| POST | /api/auth/login | tourists |
| POST | /api/auth/admin/login | admins |
| GET | /api/auth/me · POST /api/auth/logout | logged in |
| GET | /api/destinations?search=&state=&category= | public |
| GET | /api/destinations/filters · /api/destinations/:id | public |
| POST | /api/queue `{ destinationId, numberOfPeople, requestId }` | tourist |
| GET | /api/queue/mine · /api/queue/:bookingId | owner / admin |
| DELETE | /api/queue/:bookingId | owner / admin |
| POST | /api/guide/ask `{ destinationId, question }` · GET /api/guide/questions | public |
| GET | /api/admin/stats · /api/admin/bookings · /api/admin/bookings/lookup/:code | admin |
| POST | /api/admin/bookings/:id/check-in · check-out · cancel | admin |
| GET | /api/admin/queue/:destinationId · /api/admin/crowd | admin |
| PATCH | /api/admin/destinations/:id/settings `{ queueOpen, entryRatePerMinute, notice }` | admin |

## 7. Project structure

```
backend/
  server.js            app setup, routes, port error message
  config/env.js        reads backend/.env (no dotenv package needed)
  db/store.js          JSON file database with atomic writes
  middleware/auth.js   requireAuth / requireRole (role read from the database)
  models/              User, Booking (rules + status transitions), Destination (dataset mapping)
  services/            auth, destination, queue, crowd, guide, stats
  controllers/ routes/ HTTP layer
  scripts/createAdmin.js
  data/india_tourism_dataset.json   (static, read-only)
src/
  services/api.js      all API calls
  context/             AuthContext (login state), QueueContext (bookings from server)
  components/          ProtectedRoute, QueueModal, QRPass, QRCode, ...
  pages/               Landing, Destinations, DestinationDetails, MyQueue, AIGuide,
                       Login, Register, Dashboard, AdminLogin, AdminDashboard
  utils/qrcode.js      QR code generator
```
