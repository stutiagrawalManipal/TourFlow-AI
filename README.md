# TourFlow AI

Tourist destination explorer, crowd estimates and a digital FIFO queue for 100 destinations
across India (from the project's tourism dataset), with a tourist portal and a separate admin portal.

- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3 + React Router
- **Backend:** Node.js (18.17+) + Express 4
- **Database:** PostgreSQL 14+ (driver: `pg`)
- **Auth:** scrypt password hashing, server-side sessions in an HttpOnly cookie, roles checked on every request

---

## 1. Database setup (one time)

Pick **one** option.

**A. Docker** (easiest if Docker Desktop is installed)
```bash
docker compose up -d          # in the project root, uses docker-compose.yml
```
`DATABASE_URL=postgres://tourflow:tourflow@localhost:5432/tourflow`

**B. Install PostgreSQL** (Windows/Mac installer from postgresql.org, or `apt install postgresql`).
Then create a user and database (in `psql` or pgAdmin):
```sql
CREATE USER tourflow WITH PASSWORD 'choose-a-password';
CREATE DATABASE tourflow OWNER tourflow;
```
`DATABASE_URL=postgres://tourflow:choose-a-password@localhost:5432/tourflow`

**C. Hosted** (Neon, Supabase, Render ...): copy their connection string and set `DATABASE_SSL=true`.

## 2. Install and configure

```bash
npm install                  # project root (frontend)
cd backend
npm install                  # backend (adds the pg driver)
```

Copy `backend/.env.example` to `backend/.env` and set at least:
```
DATABASE_URL=...             # from step 1
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=YourStrongPass123
WIKIMEDIA_CONTACT=you@example.com
```
`backend/.env` is in `.gitignore`. Never commit it.

The tables are created automatically when the backend starts, and the 100 destinations are
loaded from `backend/data/india_tourism_dataset.json`. You can also run `npm run db:migrate`.

### Upgrading from the JSON version (keeps your users and bookings)
```bash
cd backend
npm run db:import-json       # reads data/tourflow-db.json
```
Users keep their passwords; bookings keep their IDs, queue numbers and QR pass codes.
Running it twice is safe. Afterwards `data/tourflow-db.json` is only a backup.

### Destination photos (run once, needs internet)
```bash
cd backend
npm run images:fetch         # add -- --dry-run to preview, -- --force to replace
```
For each destination this takes the main photo of a matching English Wikipedia article
(`backend/data/wikipedia_titles.json`) **only if** it is a Wikimedia Commons file under a free licence
(CC0, public domain, CC BY, CC BY-SA - no NC/ND). Author, licence and source link are saved and shown
next to the photo, as the licences require. Destinations it cannot match are listed so you can add a photo
in **Admin → Destinations**. Destinations without a photo show a named placeholder.

## 3. Run (two terminals)

```bash
# Terminal 1
cd backend
npm run dev                  # http://localhost:5000

# Terminal 2 (project root)
npm run dev                  # http://localhost:3000
```

| Page | URL |
|---|---|
| Home | http://localhost:3000/ |
| Tourist login / register / account | /login, /register, /account |
| Admin login | http://localhost:3000/admin/login |
| Admin dashboard | /admin |

## 4. Admin accounts

- Registration always creates a **tourist**; any `role` sent by a browser is ignored.
- The first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when the backend starts.
- Add another admin or reset a password: `npm run create-admin -- admin2@example.com "AnotherPass123" "Name"`
- Tourists are refused at `/admin/login`, and admins at the tourist login.

## 5. How the queue works

**Booking rules (enforced by the server and by database constraints)**
- Logged-in tourists only. 1 to 4 people per booking (`CHECK` constraint in the database too).
- The queue must be open, and the group must fit in the destination's queue capacity (set by admins).
- One active booking per tourist per destination. A double-click or retry sends the same request id
  and gets the same booking back instead of a second one.

**FIFO and concurrency**
- Each destination has a ticket counter. Booking runs in one PostgreSQL transaction that locks that
  destination's row (`SELECT … FOR UPDATE`): check rules, take the next ticket number, insert the booking,
  and write the audit entry. If any step fails, nothing is saved.
- `UNIQUE (destination_id, ticket_number)` makes a duplicate queue number impossible, even with several
  backend servers running.
- Queue position is always calculated from the stored data (waiting bookings with a lower ticket number).
  It is never stored or edited by hand.
- At the gate, **only the booking at the front can be checked in or marked no-show**. Letting anyone else
  in first is an **override** that needs a written reason and is recorded in the audit log.
  Staff cancellations also need a reason.
- Status flow: `WAITING → CHECKED_IN → CHECKED_OUT (completed)`, `WAITING → NO_SHOW`,
  `WAITING → CANCELLED`.

**Audit log**: admin actions, overrides, admin logins (and failed attempts), password changes and imports.
The database rejects any `UPDATE` or `DELETE` on it.

**QR pass**: contains `TOURFLOW:<bookingId>:<passCode>`. In **Admin → Check-in / out**, paste the scanned
text, the booking ID or the pass code. A QR lookup only succeeds when the pass code matches.

## 6. Crowd and waiting time (estimates)

There are **no live sensors, cameras or official integrations**. The crowd level combines the dataset's
peak/off season and popularity with the number of people waiting in TourFlow. Estimated wait = people ahead ÷ entry rate.

The entry rate is measured from check-ins once there are 5 or more in the last hour; otherwise the
admin's planning rate is used. Every screen shows the data source and the last queue activity, and data
older than 2 hours is marked stale.

## 7. Destination information

Dataset facts are shown as they are. Information the dataset does not have is shown as
**"Not available yet"** and can be added in **Admin → Destinations**:
- historical background, significance, visitor guidelines, accessibility, visit duration, guide information
- extra FAQs (FAQs built from dataset fields are added automatically)
- photographs with alt text, credit and licence

**Opening hours and entry fees are shown to tourists only after an admin marks them verified with an
official source link**; until then the page says "Not verified yet". Drafts stay hidden.

## 8. Security summary

- Passwords hashed with scrypt + salt; failed-login lockout per email; rate limits on login, registration,
  booking and the guide.
- Session token in an `HttpOnly; SameSite=Lax` cookie (`Secure` in production); only its SHA-256 hash is
  stored. Changing your password logs out your other devices.
- CSRF: all changing requests must send `X-Requested-With: TourFlow` (other sites cannot add it).
- Security headers on every response; strict Content-Security-Policy for the built site.
- Every query is parameterised. Admin routes check the role stored in the database, never a value sent by the browser.

## 9. Production

```bash
npm run build                          # project root -> dist/
cd backend
NODE_ENV=production TRUST_PROXY=1 npm start
```
With `NODE_ENV=production` the backend also serves `dist/` on the same port, so the site and API share one
origin and cookies are `Secure` (serve over HTTPS). Use a strong `ADMIN_PASSWORD` and a private `DATABASE_URL`.

## 10. Ports and common errors

| Problem | Fix |
|---|---|
| `DATABASE_URL is not set` / `Could not connect to the database` | Start PostgreSQL (step 1) and check `backend/.env`. |
| `Port 5000 is already in use` | Set `PORT=5050` in `backend/.env` **and** `BACKEND_PORT=5050` in a root `.env` (copy `.env.example`). Do not kill unknown programs. |
| Website says "Cannot reach the TourFlow server" | The backend is not running, or the ports do not match. |
| `Cannot find package 'pg'` | Run `npm install` inside `backend/`. |
| `Request blocked (missing X-Requested-With header)` | Call the API through `src/services/api.js` (it adds the header). |

## 11. Known limitations

- Crowd levels and waiting times are estimates; walk-in visitors are not counted.
- No camera QR scanner in the admin portal (staff paste or type the code).
- Photos depend on `npm run images:fetch` or manual entry; some destinations may have none.
- Rate limits and login lockout are kept in memory (per server process). Use Redis if you run several servers.
- No password reset by email.
