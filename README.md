<<<<<<< HEAD
# drivefleet
vehicle rental management system
=======
# DriveFleet — Vehicle Rental Management

A complete, dependency-free frontend for a premium car-rental platform: a public landing
page plus a six-page operations dashboard (fleet, customers, rentals, payments, login,
register). Built with **HTML5 + CSS3 + vanilla JavaScript (ES6)** only, wired to an
Express/MySQL-shaped API client that falls back to an in-browser mock backend, so the whole
experience runs today and the real Node backend can be dropped in later without touching a
single line of UI code.

---

## 1. Project presentation

**Goal.** Give a rental company one calm place to answer three questions: *which cars do I
have, who has them, and who still owes me money* — while letting a customer browse the fleet
and book a vehicle in under a minute.

**Concept & visual identity.**

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0f766e` (deep teal) | brand, links, primary buttons, prices |
| Accent | `#f59e0b` (amber) | call-to-action highlights |
| Success / Warning / Error | green / amber / red ladders | vehicle, rental and payment status badges |
| Surfaces | white → slate-50 → slate-100 | cards, sidebars, modal sheets |
| Headline font | Plus Jakarta Sans (400–800) | h1–h3, buttons, prices, numbers |
| Body font | Inter (400–700) | paragraphs, tables, forms |
| Radius / shadow | 4–24 px, soft 3-step elevation | cards, inputs, modals |

The layout respects the 60/30/10 rule: neutral surfaces dominate, teal carries the identity,
amber is reserved for accents. Motion is subtle and everywhere: hover lifts
(`hover:scale`/transform + `shadow`), 300 ms `ease-in-out` transitions, `backdrop-blur` sticky
navbar, scroll-reveal sections and animated KPI counters.

**Pages shipped**

| File | Purpose |
|------|---------|
| `public/index.html` | Landing page: hero, availability search, featured fleet, how-it-works, features, reviews, CTA |
| `public/pages/dashboard.html` | KPI strip, fleet status breakdown, recent rentals |
| `public/pages/vehicles.html` | Fleet catalogue with a full filter sidebar, pagination, details + booking modal with a live quote |
| `public/pages/customers.html` | Customer directory, detail modal with rental history, add-customer form |
| `public/pages/rentals.html` | Rental bookkeeping: filters, status transitions, delete, new-rental picker |
| `public/pages/payments.html` | Payment ledger with summary card, filters, mark-paid and record-payment modal |
| `public/pages/login.html` | Split-layout sign-in (demo accounts advertised on the page) |
| `public/pages/register.html` | Split-layout registration with password-strength meter and client-side validation |

---

## 2. Prerequisites

* **Any modern browser** (Chrome, Edge, Firefox, Safari) — no build step is required to run it.
* **Python 3** (preinstalled on macOS/Linux) *or* **Node.js 18+** — only to serve the static folder.
* **Node.js 18+** — to run the optional verification scripts (`node --check`, smoke tests).
* **MySQL 8** + **Node.js/npm** — needed later for the backend phase (section 8).

---

## 3. Quick start (frontend only)

```bash
# from the project root
python3 -m http.server 4200 --directory public
# or: npx live-server public --port=4200 --no-browser
```

Then open **http://localhost:4200/** and browse to the app pages from the navbar
(*Dashboard*, *Fleet*) or directly:

* http://localhost:4200/pages/dashboard.html
* http://localhost:4200/pages/vehicles.html
* http://localhost:4200/pages/customers.html
* http://localhost:4200/pages/rentals.html
* http://localhost:4200/pages/payments.html
* http://localhost:4200/pages/login.html
* http://localhost:4200/pages/register.html

> The API client calls `/api/*` on the same origin; when that 404s (no backend yet) every
> request transparently falls back to the mock backend, so the UI is fully interactive.

---

## 4. Project structure

```
project_six/
├── public/                      # everything the browser loads
│   ├── index.html               # landing page
│   ├── pages/
│   │   ├── dashboard.html       # KPIs, fleet status, recent rentals
│   │   ├── vehicles.html        # catalogue + filters + booking modal
│   │   ├── customers.html       # customer directory + detail modal
│   │   ├── rentals.html         # rental bookkeeping
│   │   ├── payments.html        # payment ledger
│   │   ├── login.html           # sign-in (split layout)
│   │   └── register.html        # registration (split layout)
│   ├── css/
│   │   └── style.css            # GENERATED bundle of scripts/css_parts/*.css
│   ├── js/
│   │   ├── data.js              # seed database (vehicles, customers, rentals, payments, branches, extras)
│   │   ├── mock-core.js         # MockLogic (filters/pricing/joins) + MockApi (CRUD, auth, reset)
│   │   ├── mock-api.js          # MockApiEx — REST-shaped adapter used by the fallback path
│   │   ├── api.js               # DriveFleetApi — real HTTP client with mock fallback
│   │   ├── components.js        # navbar, mobile menu, footer, sidebar, topbar
│   │   ├── ui.js                # toasts, formatters, badges, avatars
│   │   ├── main.js              # page router + feature modules + modal engine
│   │   └── app.js               # GENERATED bundle of the 7 sources above
│   └── assets/
│       └── hero-vehicle.svg     # hero illustration
├── scripts/
│   ├── build_frontend.py        # CSS parts + JS sources → public/css/style.css, public/js/app.js
│   ├── verify_frontend.py       # static checks: syntax balance, node --check, link/asset integrity
│   ├── smoke_test.js            # headless API-contract test of the data/mock/api stack
│   ├── dom_test.js              # jsdom rendering + interaction test of every page
│   └── css_parts/               # 14 modular stylesheets (tokens → components → utilities)
├── src/                         # reserved for the backend phase (config/ controllers/ routes/)
├── .gitignore                   # excludes .env, node_modules, OS junk
└── README.md
```

**Why `css_parts/`?** Editing a 55 KB stylesheet is painful; the source of truth is the 14
small parts (tokens, navbar, buttons, cards, forms, tables, app shell, landing blocks,
overlays, auth, responsive, animations, utilities). `build_frontend.py` concatenates them in
filename order, so the load order is explicit and reviewable.

---

## 5. Architecture — how the JavaScript fits together

```
data.js  ──►  mock-core.js  ──►  mock-api.js  ──►  api.js  ──►  components.js / ui.js / main.js
(seed DB)     (business logic)   (REST adapter)   (HTTP client)      (presentation)
```

1. **`data.js` → `window.MockData`** — the seed database. Field names match the future MySQL
   columns exactly (`price_per_day`, `pickup_date`, `licence_number`, …). Also exposes
   `window.DriveFleetData` for the UI layer and `MockData.seed()` which returns a deep clone
   used by the reset helper.
2. **`mock-core.js`** — two things:
   * `window.MockLogic` — pure domain logic: `filterVehicles`, `filterCustomers`,
     `filterRentals`, `filterPayments`, `sortVehicles`, `quote` (the pricing engine),
     `isAvailable` (date-overlap availability), `decorateRental`/`decoratePayment` (SQL-style
     joins) and `overview` (dashboard aggregates).
   * `window.MockApi` — the service facade the rest of the app talks to: `vehicles`,
     `customers`, `rentals`, `payments` namespaces with `list/get/create/update/remove`,
     `quote`, `stats.overview`, `auth.login/register/me`, and `reset()`.
3. **`mock-api.js` → `window.MockApiEx`** — reshapes `MockApi` into the exact envelopes the
   REST endpoints return (`{ data, total, page, pages, has_next, has_prev }`), so the fallback
   is indistinguishable from a real server response.
4. **`api.js` → `window.DriveFleetApi` (alias `window.api`)** — the HTTP client: `request()`
   with JSON headers, bearer token, 11 s abort timeout and error unwrapping; REST namespaces
   (`vehicles`, `customers`, `rentals`, `payments`, `auth`, `stats`); a `localStorage`-backed
   auth store (`getToken/setToken/getUser/setUser/isAuthenticated/clear`); and `withMock()`,
   which retries any failed request against `MockApiEx`. `api.resetDb()` restores the seed.
5. **`components.js` → `window.DriveFleetComponents`** — renders the shared chrome: marketing
   navbar + burger menu with `backdrop-blur`, footer, app sidebar and topbar. `data-root` on
   `<body>` makes every link resolve correctly from `/` and from `/pages/`.
6. **`ui.js` → `window.ui`** — toasts (auto-dismiss, 4 variants), currency/date formatters,
   status badges, initials/avatars.
7. **`main.js` → `window.DriveFleetInit`** — the router. `initPage()` reads `data-page` from
   `<body>`, renders the chrome, runs the matching feature (`home`, `dashboard`, `vehicles`,
   `customers`, `rentals`, `payments`, `login`, `register`), then wires scroll-reveal. It owns
   the modal engine (`openModal`/`closeModal`, exposed as `window.DriveFleetUI`) and a
   `registerReload()` registry so a mutation refreshes only the affected table.

### Pricing engine (single source of truth)

`MockLogic.quote()` mirrors what the backend will compute, so a quote shown in the browser is
bit-for-bit what the server returns:

```
base        = daily_rate × days
+ extras    = Σ(extra.price_per_day) × days
+ surcharge = 10% of base, luxury class only
− discount  = 5% (≥7 days) / 10% (≥14) / 15% (≥30), applied to base + extras + surcharge
subtotal    = pre-discount − discount
tax         = 20% of subtotal
deposit     = round(25% of base, to the nearest 10)
total       = subtotal + tax
```

### REST contract implemented by `api.js`

```
GET    /vehicles?type=&branch=&status=&transmission=&fuel=&min_price=&max_price=&seats=
       &search=&sort=&available_only=&pickup_date=&return_date=
GET|POST|PUT|DELETE  /vehicles[/:id]
GET    /customers?search=&status=&city=      GET|POST|PUT|DELETE  /customers[/:id]
GET    /rentals?search=&status=&payment_status=&customer_id=&vehicle_id=
GET|POST|PUT|DELETE  /rentals[/:id]
POST   /rentals/quote      → { days, base_amount, extras_amount, discount_rate,
                              discount_amount, subtotal, tax_amount, deposit, total_amount }
GET    /payments?search=&status=&method=&type=&rental_id=   POST|PUT|DELETE /payments[/:id]
POST   /auth/login | /auth/register   GET /auth/me
GET    /stats/overview     → { vehicles_total, vehicles_available, vehicles_rented,
                              rentals_active, revenue_total, outstanding_total,
                              fleet_utilisation, recent_rentals[] }
```

Every call is written as `withMock(path, options, fallbackFn)`: try the network, and on
network error (or any HTTP failure while `CONFIG.useMockFallback` is true) resolve from
`MockApiEx` instead. Point `window.DRIVEFLEET_API_BASE` at another origin if the backend is
hosted elsewhere.

### Rebuilding the bundles

```bash
python3 scripts/build_frontend.py
# [CSS] public/css/style.css — 14 parts, ~55 KB
# [JS]  public/js/app.js — 7 files, ~130 KB
```

Each page loads exactly one script (`../js/app.js`), so the load order inside the bundle is
the load order that matters: `data → mock-core → mock-api → api → components → ui → main`.

---

## 6. Testing & verification

Three independent layers, all runnable from the project root:

```bash
# 1) static integrity: brace/paren balance, node --check, link + asset resolution
python3 scripts/verify_frontend.py

# 2) API contract: runs the data→mock→api stack offline and asserts every endpoint shape
node scripts/smoke_test.js

# 3) real rendering: jsdom loads each page, runs app.js, drives the UI (optional dev dep)
npm install --no-save jsdom --prefix /tmp/domtest
NODE_PATH=/tmp/domtest/node_modules node scripts/dom_test.js
```

Last run in this repository: **63 static checks, 54 API checks and 66 DOM checks — all passing.**
The DOM suite covers the landing hero + counters + fleet grid, the dashboard KPIs and tables,
fleet filtering (12 → 4 SUVs), pagination, the booking modal with a live quote, the
customer/rental/payment tables, a rental status change and delete, ledger filtering, failed
and successful sign-in, registration validation and the password-strength meter.

---

## 7. Step-by-step test scenario

Start the static server (section 3) and follow along in the browser.

**A. Landing page — `http://localhost:4200/`**

1. The sticky navbar is translucent and blurs the content behind it; scrolling 12 px adds a
   soft shadow. Hover the nav links to see the colour transition.
2. The three hero counters animate from `0` to `248`, `12,480` and `99%`.
3. Under *Featured vehicles* the grid renders six cards (sorted by rating). Each card shows a
   status badge (Available / Rented / Reserved / Maintenance), the class badge, a car
   illustration, specs, a daily price and two buttons.
4. Set *Vehicle type = SUV*, *Pick-up = tomorrow*, *Return = +3 days*, *Max price = $120* and
   press **Search** → the browser navigates to
   `pages/vehicles.html?type=suv&pickup_date=…&return_date=…&max_price=120` and the filter
   sidebar arrives pre-filled with exactly those values.
5. Narrow the window below ~900 px and tap the burger icon: the panel slides in with a blurred
   backdrop (close it with the overlay or `Esc`).

**B. Fleet catalogue — `pages/vehicles.html`**

1. The sidebar shows the active page highlighted; the T(opbar) search and *Mock API* badge are
   rendered above it.
2. The results bar reads **12 vehicles** and shows 6 cards per page with Prev/1/2/Next.
3. Pick *Type = SUV* → **4 vehicles**; add *Fuel = Hybrid* → 2; set *Sort = Price: low to
   high* → the Panda-priced hatchback leads; press **Clear** to restore all 12.
4. Click **Details** on any card → a modal lists the plate, specs, mileage, branch, rating and
   the included features chips.
5. Click **Book now** → the booking modal opens with a customer selector, pre-filled dates and
   the four extras. Change the dates or tick *GPS navigation*: the **Price breakdown**
   recalculates instantly (days, base, extras, discount, subtotal, VAT 20 %, refundable
   deposit, total). Choose a customer and press **Confirm booking** → the modal closes, a
   green toast reports `Booking #2011 created for <customer>` and the grid refreshes.
6. Press **Add vehicle** to see the create form (brand, model, type, branch, price, plate,
   seats, fuel); saving prepends the new car to the fleet.

**C. Customers — `pages/customers.html`**

1. Eight customers are listed with avatar initials, email, phone, licence, city and status.
2. Type `amelia` in **Search** (or filter *Status = Active*) and press **Apply filters** → the
   table narrows and the counter updates.
3. Click **View** → the modal shows contact data, licence, membership date and the customer's
   **rental history** (each row: rental #, vehicle, dates, amount).
4. Press **Add customer**, fill the form and save → toast confirmation + refreshed table.

**D. Rentals — `pages/rentals.html`**

1. All 10 bookings appear with customer, vehicle, pickup/return dates, total + balance,
   payment badge and status badge.
2. *Activate* a reserved rental → its badge flips to **Active**, the connected vehicle becomes
   *Rented* and a toast confirms. *Complete* it → the vehicle returns to *Available*.
3. *Delete* removes the row and the counter drops to 9.
4. **New rental** lists only available vehicles; picking one opens the same booking modal.

**E. Payments — `pages/payments.html`**

1. The ledger shows 10 records and the summary card totals the collected and pending amounts.
2. Filter *Status = Completed* → 8 rows, summary recalculates.
3. *Mark paid* on a pending row flips it to Completed; *Delete* removes it.
4. **Record payment** lets you pick a rental, amount, method, type, status and date; saving
   updates the rental's `payment_status` to *completed* once the balance is covered.

**F. Authentication**

1. `pages/login.html` → the amber panel advertises the demo accounts.
   * Submit `admin@drivefleet.test` / `wrong` → inline error, **no** token in `localStorage`.
   * Submit `admin@drivefleet.test` / `admin123` → toast, token + user profile written to
     `localStorage` (`drivefleet.token`, `drivefleet.user`) and a redirect to the dashboard.
2. `pages/register.html` → typing `Str0ng!Pass` fills the 4-bar strength meter (level 4,
   "Strong password"). Mismatched passwords are rejected client-side; a valid submission stores
   a session and redirects.
3. Back on the dashboard the guest-mode banner is replaced by *"Signed in as …"*, the sidebar
   footer shows the user and the navbar CTA becomes *Sign out*.
4. Inspect the Network tab: `/api/...` requests return 404 and each one is satisfyingly
   replaced by a mock response — no red error state in the UI.

**G. Responsive check**

Resize to 1024 px (grids collapse to two columns, the filter sidebar stacks above the results),
768 px (single-column grids, burger menu, sidebar slides over the content) and 375 px (cards
and tables scroll horizontally inside `.table-wrapper`, no horizontal page scroll).

---

## 8. Next phase — Node/Express + MySQL backend

The frontend is already shaped around the endpoints in section 5, so the backend only has to
satisfy that contract. Planned steps (a separate work session):

**8.1 Database**

```sql
CREATE DATABASE IF NOT EXISTS drivefleet
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drivefleet;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- bcrypt hash
  role ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL, city VARCHAR(80) NOT NULL,
  address VARCHAR(190), phone VARCHAR(40)
) ENGINE=InnoDB;

CREATE TABLE vehicles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(60) NOT NULL, model VARCHAR(90) NOT NULL, year SMALLINT NOT NULL,
  type ENUM('sedan','suv','hatchback','pickup','van','luxury') NOT NULL,
  plate VARCHAR(20) NOT NULL UNIQUE, seats TINYINT NOT NULL,
  transmission ENUM('Automatic','Manual') NOT NULL,
  fuel ENUM('Petrol','Diesel','Hybrid','Electric') NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL, mileage INT UNSIGNED DEFAULT 0,
  status ENUM('available','rented','maintenance','reserved') NOT NULL DEFAULT 'available',
  branch_id INT UNSIGNED, rating DECIMAL(2,1) DEFAULT 4.5,
  image VARCHAR(160), features JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  first_name VARCHAR(60) NOT NULL, last_name VARCHAR(60) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE, phone VARCHAR(40), licence_number VARCHAR(60),
  city VARCHAR(80), country VARCHAR(80) DEFAULT 'Portugal',
  status ENUM('active','new','blocked') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE rentals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL, vehicle_id INT UNSIGNED NOT NULL,
  pickup_date DATE NOT NULL, return_date DATE NOT NULL,
  status ENUM('pending','reserved','active','completed','cancelled','overdue') NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending','completed','refunded','failed') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pickup_branch VARCHAR(120), notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rental_id INT UNSIGNED NOT NULL, amount DECIMAL(10,2) NOT NULL,
  method ENUM('card','cash','bank_transfer','paypal') NOT NULL DEFAULT 'card',
  type ENUM('deposit','rental','refund','penalty') NOT NULL DEFAULT 'rental',
  status ENUM('pending','completed','refunded','failed') NOT NULL DEFAULT 'pending',
  reference VARCHAR(40) NOT NULL UNIQUE, paid_at DATE,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**8.2 Environment file** (`.env`, never committed)

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=drivefleet
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=2h
```

**8.3 Commands and layout**

```bash
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken dotenv cors nodemon --save
npm start            # nodemon src/server.js
```

```
src/
├── config/database.js        # mysql2 connection pool + [MySQL] log line
├── controllers/authController.js   vehiclesController.js  customersController.js
│                              rentalsController.js  paymentsController.js  statsController.js
├── routes/*.js               # one router per resource, mounted under /api
├── middleware/auth.js        # JWT verification + role guard
├── middleware/validate.js    # body/query validation
└── server.js                 # express app: static public/, /api routes, error handler
```

**8.4 Non-negotiable backend rules**

* Every query uses **prepared statements** (`db.execute('… WHERE id = ?', [id])`) — never string
  concatenation.
* Passwords are hashed with **bcryptjs** (`bcrypt.hash(password, 10)`) before insert and
  compared with `bcrypt.compare`.
* Sessions are stateless **JWT** tokens (`jsonwebtoken`), sent as `Authorization: Bearer …`
  (already what `api.js` does) or stored in an httpOnly cookie.
* Every controller wraps its work in `try/catch`, logs a clear `[Controller]` line and returns
  `{ message }` with the right status code, which the frontend displays as a toast.
* `express.static('public')` serves this same frontend, so no code changes are needed when the
  API comes online — the mock fallback simply stops being used.

---

## 9. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Pages render unstyled | `public/css/style.css` missing → run `python3 scripts/build_frontend.py` |
| `app.js` 404 or stale behaviour | The bundle is generated: rebuild after editing any `public/js/*.js` source |
| Console warning `[MockApi] not available` | The sources were loaded out of order; load `data.js → mock-core.js → mock-api.js → api.js → components.js → ui.js → main.js` |
| `Failed to fetch` in the console | Normal without a backend — `withMock()` answers instead |
| Toast says "Invalid credentials" with correct demo login | Check for a stale `drivefleet.token` in `localStorage` and clear site data |
| Changed seed data but the UI still shows old numbers | Call `DriveFleetApi.resetDb()` in the console, or press **Reset mock data** on the dashboard |
>>>>>>> da1e1ba (initialiaze project)
