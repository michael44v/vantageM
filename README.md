# Vantage Markets — Full-Stack Trading Broker Platform

A production-ready, full-stack web application for a global online CFD and forex trading broker. Built with React + Vite + Tailwind CSS on the frontend and PHP (OOP) + MySQL on the backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Design System](#4-design-system)
5. [Frontend — Setup and Development](#5-frontend--setup-and-development)
6. [Backend — Setup and Configuration](#6-backend--setup-and-configuration)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Authentication](#9-authentication)
10. [Admin Panel](#10-admin-panel)
11. [Public Pages](#11-public-pages)
12. [Demo Credentials](#12-demo-credentials)
13. [Environment Variables](#13-environment-variables)
14. [Deployment Guide](#14-deployment-guide)
15. [Security Considerations](#15-security-considerations)

---

## 1. Project Overview

Vantage Markets is a globally focused CFD and forex brokerage platform that allows traders to buy and sell financial instruments across currencies, gold, indices, equities, ETFs, and energy markets.

### Key Features

**Public site**
- Animated hero section with live price ticker
- Spreads comparison table (Vantage Markets vs market average)
- Six instrument categories with tabbed switcher (Forex, Indices, Gold, Energy, ETFs, Shares)
- Three account type comparison (Standard, Raw ECN, Pro ECN)
- Platform showcase for MT4, MT5, TradingView, and Vantage App
- Copy trading leaderboard
- Interactive commission calculator for partner programme
- Promotions and bonus pages
- About, regulation, and company timeline

**Authentication**
- Two-step registration with account type selection
- JWT-secured login
- Role-based routing (admin vs trader)

**Admin Panel**
- Dashboard with bar and area charts (Recharts)
- User management — search, filter, view, suspend, activate, delete
- Transaction management — approve or reject pending withdrawals/deposits
- Markets overview with editable spread configuration
- Platform settings and feature toggle panel

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component library |
| Vite | 6 | Build tool and dev server |
| Tailwind CSS | 3 | Utility-first styling |
| React Router DOM | 6 | Client-side routing |
| Recharts | Latest | Dashboard charts |
| Axios | Latest | HTTP client for API calls |
| Lucide React | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.1+ | Server-side language |
| MySQL | 8.0+ | Relational database |
| PDO | Built-in | Database abstraction |
| HS256 JWT | Custom | Stateless authentication |

### Fonts

| Font | Weights | Usage |
|---|---|---|
| Syne | 400, 600, 700, 800 | Headings, numbers, display text |
| DM Sans | 300, 400, 500, 600, 700 | Body copy, labels, buttons |

---

## 3. Project Structure

```
vantagemarkets/
├── frontend/                          # React + Vite + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # Fixed nav with auth state
│   │   │   │   ├── Footer.jsx         # Full site footer with risk warning
│   │   │   │   ├── Ticker.jsx         # Scrolling live price ribbon
│   │   │   │   └── PublicLayout.jsx   # Wraps all public pages
│   │   │   ├── ui/
│   │   │   │   └── index.jsx          # Button, Badge, Input, Table, etc.
│   │   │   └── ProtectedRoute.jsx     # RequireAuth / RequireAdmin guards
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global auth state (login/logout)
│   │   ├── data/
│   │   │   └── mockData.js            # Static data for all components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── TradingPage.jsx
│   │   │   ├── PlatformsPage.jsx
│   │   │   ├── PromotionsPage.jsx
│   │   │   ├── PartnersPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx    # Collapsible sidebar shell
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminTransactions.jsx
│   │   │       └── AdminMarketsAndSettings.jsx
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + all API methods
│   │   ├── App.jsx                    # Route definitions
│   │   ├── main.jsx                   # React DOM entry point
│   │   └── index.css                  # Tailwind directives + keyframes
│   ├── tailwind.config.js             # Brand tokens and custom theme
│   ├── vite.config.js
│   └── package.json
│
└── backend/                           # PHP OOP REST API
    ├── api/
    │   ├── auth/
    │   │   └── AuthController.php     # Login, register, logout
    │   ├── admin/
    │   │   ├── DashboardController.php
    │   │   ├── UsersController.php
    │   │   └── TransactionsController.php
    │   └── leads/
    │       └── LeadsController.php
    ├── config/
    │   └── Database.php               # Singleton PDO connection
    ├── middleware/
    │   └── AuthMiddleware.php         # JWT generation and validation
    ├── models/
    │   ├── User.php                   # Full user CRUD + aggregates
    │   ├── Transaction.php            # Transaction CRUD + summary
    │   └── Lead.php                   # Lead capture model
    ├── utils/
    │   └── Response.php               # Standardised JSON response helper
    ├── index.php                      # Manual router (entry point)
    ├── .htaccess                      # Apache URL rewriting
    ├── .env.example                   # Environment variable template
    └── database.sql                   # Full schema + seed data
```

---

## 4. Design System

### Color Palette

All colours are defined as Tailwind extended theme tokens in `tailwind.config.js`.

| Token | Hex | Usage |
|---|---|---|
| `primary.DEFAULT` | `#111111` | Main brand navy — nav, footer, hero, headings |
| `primary.light` | `#222222` | Hover states on dark backgrounds |
| `accent.DEFAULT` | `#FFC800` | Primary CTA, active links, highlights |
| `accent.light` | `#FFD733` | Hover states for accent elements |
| `teal.DEFAULT` | `#00B4A6` | Secondary accent, positive indicators, check marks |
| `teal.light` | `#00d4c4` | Teal hover states |
| `gold.DEFAULT` | `#F5A623` | Star ratings, awards, partner highlights |
| `surface.DEFAULT` | `#F4F6FA` | Alternate section backgrounds |
| `surface.mid` | `#EEF1F8` | Input backgrounds, tab fills |
| `surface.border` | `#DDE3EE` | Card borders, table dividers |

### Semantic Text Colours

| Usage | Colour |
|---|---|
| Primary text / headings | `#111111` |
| Body / description text | `#4A5568` |
| Muted labels / captions | `#8897A9` |
| Positive change | `#10B981` (Tailwind `emerald-500`) |
| Negative change | `#EF4444` (Tailwind `red-500`) |
| Warning | `#F59E0B` (Tailwind `amber-500`) |

### On-Dark Surfaces

When placed over `primary` dark backgrounds:

| Role | Value |
|---|---|
| Primary heading | `text-white` |
| Body copy | `text-white/60` |
| Muted labels | `text-white/40` |
| Dividers | `border-white/10` |
| Glass card fill | `bg-white/10 backdrop-blur-md` |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 4px 24px rgba(11,30,61,0.10)` | Default card shadow |
| `shadow-lg` | `0 12px 48px rgba(11,30,61,0.16)` | Hover / elevated cards |
| `shadow-xl` | `0 24px 64px rgba(11,30,61,0.20)` | Modals, floating elements |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-card` / `rounded-[12px]` | 12px | Buttons, inputs, small cards |
| `rounded-xl` / `rounded-[20px]` | 20px | Section cards, panels |
| `rounded-full` | 9999px | Badges, pills, toggles |

### Spacing

- Container max-width: `1200px`
- Container horizontal padding: `px-10` (40px)
- Standard section padding: `py-20` (80px top and bottom)
- Large section padding: `py-24` (96px)

### Animations

| Name | Keyframe | Usage |
|---|---|---|
| `fade-in-up` | `opacity 0→1, translateY 24px→0` | Page and card entrance |
| `fade-in` | `opacity 0→1` | Modals, overlays |
| `pulse2` | `opacity 1→0.4→1` | Live status dots |
| `ticker` | `translateX 0→-50%` | Price ribbon |
| `grow-bar` | `scaleY 0→1` | Chart bar entrance |
| `spin` | `rotate 0→360deg` | Loading spinners |

### Component Classes (Tailwind Layer)

Defined in `src/index.css` under `@layer components`:

```css
.btn-primary   /* Orange filled CTA button */
.btn-ghost     /* Outlined ghost button */
.btn-teal      /* Teal filled button */
.card          /* White bordered card with shadow */
.card-hover    /* Hover lift effect */
.section-tag   /* Uppercase accent label above headings */
.input-field   /* Styled text input */
.nav-link      /* Navigation anchor */
.glass-card    /* Dark frosted-glass card */
```

---

## 5. Frontend — Setup and Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd frontend
npm install
```

### Development server

```bash
npm run dev
# Starts at http://localhost:3000
# API calls are proxied to http://localhost:8000
```

### Production build

```bash
npm run build
# Output in frontend/dist/
```

### Environment variable

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 6. Backend — Setup and Configuration

### Prerequisites

- PHP 8.1+ with extensions: `pdo`, `pdo_mysql`, `json`, `mbstring`
- MySQL 8.0+
- Apache with `mod_rewrite` enabled (or Nginx with equivalent config)

### Installation

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### Database setup

```bash
mysql -u root -p < database.sql
```

### Development server (PHP built-in)

```bash
cd backend
php -S localhost:8000
```

### Nginx configuration (production)

```nginx
server {
    listen 80;
    server_name api.vantagemarkets.com;
    root /var/www/vantagemarkets/backend;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(env|htaccess|sql) {
        deny all;
    }
}
```

---

## 7. Database Schema

### Table: `users`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Auto-increment |
| `name` | VARCHAR(120) | Full name |
| `email` | VARCHAR(180) UNIQUE | Lowercased on insert |
| `password_hash` | VARCHAR(255) | bcrypt, cost 12 |
| `phone` | VARCHAR(30) | Optional |
| `country` | VARCHAR(80) | Optional |
| `account_type` | ENUM | standard, raw_ecn, pro_ecn, demo |
| `balance` | DECIMAL(18,2) | Account balance in USD |
| `role` | ENUM | trader, admin |
| `status` | ENUM | active, pending, suspended, deleted |
| `email_verified_at` | TIMESTAMP | Null until verified |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto-updated |

### Table: `transactions`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Auto-increment |
| `user_id` | BIGINT UNSIGNED FK | References `users.id` |
| `reference` | VARCHAR(30) UNIQUE | e.g. TXN-A1B2C3D4 |
| `type` | ENUM | deposit, withdrawal |
| `amount` | DECIMAL(18,2) | In `currency` |
| `currency` | CHAR(3) | Default USD |
| `method` | VARCHAR(60) | Bank Wire, Credit Card, etc. |
| `status` | ENUM | pending, processing, completed, rejected |
| `created_at` | TIMESTAMP | Auto |

### Table: `leads`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Auto-increment |
| `name` | VARCHAR(120) | Optional |
| `email` | VARCHAR(180) | Required |
| `source` | VARCHAR(60) | homepage, register, etc. |
| `message` | TEXT | Optional enquiry body |
| `created_at` | TIMESTAMP | Auto |

### Table: `password_resets`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | |
| `user_id` | BIGINT UNSIGNED FK | |
| `token_hash` | VARCHAR(255) | Hashed reset token |
| `expires_at` | TIMESTAMP | 1 hour from creation |
| `used_at` | TIMESTAMP | Null until redeemed |

---

## 8. API Reference

Base URL: `http://localhost:8000/api`

All responses follow this envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Authenticate and receive JWT |
| POST | `/auth/register` | None | Create new trader account |
| POST | `/auth/logout` | Bearer | Invalidate session (client-side) |

**POST /auth/login — Request body**

```json
{
  "email": "trader@vantagemarkets.com",
  "password": "trader123"
}
```

**POST /auth/login — Success response**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 2,
      "name": "Demo Trader",
      "email": "trader@vantagemarkets.com",
      "role": "trader",
      "account_type": "raw_ecn"
    }
  }
}
```

**POST /auth/register — Request body**

```json
{
  "first_name": "James",
  "last_name": "Okonkwo",
  "email": "james@example.com",
  "password": "securePass123",
  "confirm_password": "securePass123",
  "phone": "+234800000000",
  "country": "Nigeria",
  "account_type": "standard"
}
```

### Admin Endpoints (all require `Authorization: Bearer <token>` with admin role)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard/stats` | Aggregated platform statistics |
| GET | `/admin/users` | Paginated user list |
| GET | `/admin/users/{id}` | Single user details |
| PUT | `/admin/users/{id}` | Update user fields |
| PATCH | `/admin/users/{id}/status` | Change user status |
| DELETE | `/admin/users/{id}` | Soft-delete user |
| GET | `/admin/transactions` | Paginated transaction list |
| PATCH | `/admin/transactions/{id}/approve` | Approve pending transaction |
| PATCH | `/admin/transactions/{id}/reject` | Reject pending transaction |

**Query parameters for paginated endpoints**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Records per page |
| `search` | string | — | Full-text search |
| `status` | string | — | Filter by status |
| `type` | string | — | Filter by type (transactions) |

### Leads Endpoint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/leads` | None | Submit newsletter or enquiry |

---

## 9. Authentication

The backend uses stateless HS256 JWT authentication implemented without external libraries.

### Token lifecycle

1. Client sends credentials to `POST /api/auth/login`.
2. Server validates credentials, generates a signed JWT (24-hour expiry).
3. Client stores the token in `localStorage` (key: `vantagemarkets_user`).
4. Axios interceptor attaches the token as `Authorization: Bearer <token>` on every request.
5. If the server returns `401`, the interceptor clears localStorage and redirects to `/login`.

### JWT payload structure

```json
{
  "sub": 1,
  "email": "admin@vantagemarkets.com",
  "role": "admin",
  "name": "Admin User",
  "iat": 1712000000,
  "exp": 1712086400
}
```

### Route guards (frontend)

| Component | Behaviour |
|---|---|
| `RequireAuth` | Redirects unauthenticated users to `/login` |
| `RequireAdmin` | Redirects non-admin users to `/` |
| `RedirectIfAuth` | Redirects already-authenticated users away from `/login` and `/register` |

---

## 10. Admin Panel

Access the admin panel at `/admin` after logging in with admin credentials.

### Sections

| Section | Path | Description |
|---|---|---|
| Dashboard | `/admin` | Platform stats, charts, recent activity |
| Users | `/admin/users` | Search, filter, manage all trader accounts |
| Transactions | `/admin/transactions` | Approve or reject pending payments |
| Markets | `/admin/markets` | Live prices and editable spread configuration |
| Settings | `/admin/settings` | Platform config and feature toggles |

### Sidebar

The admin sidebar is collapsible. Click the toggle icon in the top bar to expand or collapse it. Collapsed state shows icons only.

---

## 11. Public Pages

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Hero, spreads table, stats, trust ratings, CTA |
| `/trading` | `TradingPage` | Instrument tabs, account comparison, fees |
| `/platforms` | `PlatformsPage` | MT4/MT5/TradingView/App, feature comparison, copy trading |
| `/promotions` | `PromotionsPage` | All active bonuses and offers |
| `/partners` | `PartnersPage` | IB and CPA programme with commission calculator |
| `/about` | `AboutPage` | Mission, values, regulation, timeline, awards |
| `/login` | `LoginPage` | Split-panel authentication |
| `/register` | `RegisterPage` | Two-step account creation |

---

## 12. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@vantagemarkets.com | admin123 |
| Trader | trader@vantagemarkets.com | trader123 |

These credentials are seeded by `database.sql`. Change them immediately in production.

---

## 13. Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API base URL |

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `vantagemarkets` | Database name |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | — | Database password |
| `JWT_SECRET` | — | HS256 signing secret (min 32 chars) |
| `APP_ENV` | `development` | Set to `production` in live environment |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |

---

## 14. Deployment Guide

### Frontend (static hosting — Vercel, Netlify, S3)

```bash
cd frontend
npm run build
# Upload dist/ to your static host
```

Set the environment variable `VITE_API_URL` to your production API URL in your hosting dashboard before building.

### Backend (VPS / shared hosting)

1. Upload the `backend/` directory to your server's document root (or a subdirectory).
2. Copy `.env.example` to `.env` and fill in production values.
3. Import `database.sql` into your MySQL instance.
4. Ensure `mod_rewrite` is enabled and `AllowOverride All` is set for the backend directory.
5. Confirm PHP 8.1+ is active with PDO and pdo_mysql extensions loaded.
6. Set the `JWT_SECRET` to a long random string (`openssl rand -hex 64`).

### Docker (optional)

A `docker-compose.yml` can be added to orchestrate PHP-FPM, Nginx, and MySQL containers. This is left to the deployer's preference.

---

## 15. Security Considerations

| Area | Measure Applied |
|---|---|
| SQL injection | All queries use PDO prepared statements with bound parameters |
| Password storage | bcrypt with cost factor 12 via `password_hash()` |
| JWT signing | HS256 with `hash_equals()` for timing-safe comparison |
| CORS | Strict origin allowlist, configurable via `FRONTEND_URL` |
| Sensitive files | `.htaccess` denies access to `.env`, `.sql`, `.log` files |
| Input validation | Server-side validation on all write endpoints |
| User enumeration | Generic error message returned for failed login attempts |
| Role enforcement | Admin middleware checks JWT role on every protected request |
| Token expiry | JWTs expire after 24 hours |

**Recommended before going live**

- Enable HTTPS on both the frontend and backend domains.
- Replace the demo seeded passwords with strong, unique credentials.
- Generate a cryptographically random `JWT_SECRET` (`openssl rand -hex 64`).
- Add rate limiting to `/auth/login` (e.g. via Nginx `limit_req` or a middleware layer).
- Implement email verification using a transactional email provider (Mailgun, SendGrid).
- Add a token blacklist (Redis) if immediate JWT revocation is required on logout.

---

## 16. Mock Integrations

To facilitate rapid development and demonstration, certain third-party services are mocked in this version:

### KYC Document Storage (Cloudinary Mock)
Located in `backend/api/kyc/KYCController.php`. In a production environment, the `uploadToCloudinary` method should be updated with your Cloudinary Cloud Name and API Key. The current implementation simulates a successful secure URL return.

### Crypto Payments (Coinbase Commerce Mock)
Located in `backend/api/payments/PaymentController.php`. The `createCoinbaseCharge` method simulates the creation of a cryptocurrency charge. Replace the mock logic with the Coinbase Commerce SDK and provide your `COINBASE_API_KEY` in the `.env` file.

### Real-Time Market Data (Finnhub/TradingView)
The frontend uses mock data for charts and tickers in `frontend/src/data/mockData.js`. For live production data:
- Integrate the **Finnhub.io WebSocket API** for the price ticker.
- Use the **TradingView Lightweight Charts** library or the full **Technical Analysis Charts** embed for the Web Terminal.

---

## Licence

This project is provided for commercial use as a broker platform template. All regulatory disclaimers, risk warnings, and legal copy must be reviewed and approved by a qualified compliance officer before going live.
