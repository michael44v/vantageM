# Vantage Markets - Modern Trading Platform

A simplified, robust full-stack trading application built with React, Redux Toolkit, and a single-file PHP backend.

---

## 🚀 Key Features

- **Rebranded Experience:** Global Vantage Markets identity with Gold/Black/White 'Apple-style' UI.
- **Simplified Backend:** Single-file procedural API (`backend/api.php`) using MySQLi for high performance and low complexity.
- **Redux State Management:** Centralized frontend state handling using Redux Toolkit for seamless data synchronization.
- **Admin Live Monitoring:** Dedicated dashboard for administrators to view real-time open positions and live PnL calculations across all users.
- **Advanced Execution:** Integrated Trade Modal with lot sizing, dynamic leverage adjustment, and margin requirement verification.
- **Interactive Terminal:** Dark-mode web terminal with account selection, market watch, and position management.
- **Automatic Refresh:** Data polling and manual refresh buttons integrated into key trading views.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Redux Toolkit, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** PHP 8.1+ (Procedural), MySQLi.
- **Database:** MySQL 8.0.

---

## 📂 Project Structure

```text
vantage-app/
├── backend/
│   └── api.php          # Unified API entry point (Routing + Logic)
├── frontend/
│   ├── src/
│   │   ├── store/       # Redux Toolkit setup
│   │   ├── services/    # API calling layer
│   │   ├── pages/       # Portal, Terminal, and Admin views
│   │   └── components/  # Shared UI components
│   └── tailwind.config.js
└── README.md
```

---

## 📡 API Endpoints

All requests go to `backend/api.php?action=<action_name>`.

| Action | Method | Description |
| :--- | :--- | :--- |
| `login` | POST | Authenticate user |
| `register` | POST | Create new account |
| `get_accounts` | GET | Fetch user's trading accounts |
| `get_positions` | GET | Fetch open trades for an account |
| `admin_live_trades` | GET | (Admin) View all global open trades |
| `execute_trade` | POST | Place a new Buy/Sell order |
| `update_leverage` | POST | Change account leverage settings |
| `internal_transfer` | POST | Move funds between wallet and account |

---

## 🔑 Database Configuration

The backend is pre-configured to connect to:
- **Host:** `localhost`
- **Database:** `jvrzjzbc_vantage_db`
- **User:** `jvrzjzbc_root`

---

## 💻 Setup Instructions

1. **Backend:**
   - Place `backend/api.php` on your PHP server.
   - Import `database.sql` into your MySQL instance.

2. **Frontend:**
   - `cd frontend`
   - `npm install`
   - `npm run dev`

---

## 🔒 Security & Performance

- **Procedural Routing:** Fast, low-overhead execution without heavy MVC overhead.
- **Escaped Inputs:** Utilizes `real_escape_string` for database protection.
- **JWT Simulation:** Simple token-based logic for demo/prototype flexibility.
