# vāntãgeCFD - Institutional Grade Trading Experience

vāntãgeCFD is a comprehensive, full-stack trading platform designed for both retail traders and professional signal providers. Built with a React/Redux frontend and a high-performance procedural PHP backend.

## 🚀 Advanced Platform Features

### 💻 Trading Terminal
- **Live Markets:** Real-time simulated price feeds for Forex, Metals, and Crypto.
- **Precision Execution:** Instant order execution with dynamic margin calculation and leverage management.
- **Technical Analysis:** Integrated TradingView charting for professional-grade market analysis.

### 👥 Copy Trading Ecosystem
- **Signal Marketplace:** Discovery portal for elite traders with verified ROI and performance metrics.
- **Mirror Trading:** Fully automated position synchronization with customizable risk multipliers.
- **Provider Tools:** Advanced dashboard for signal providers to manage their strategy and subscribers.

### 🛡️ Secure Financial Portal
- **KYC Compliance:** Multi-stage document verification flow (Identity & Address).
- **Multi-Asset Wallet:** Support for Bank Wire and Crypto (BTC/ETH/USDT) deposits.
- **Internal Transfers:** Instant movements between master wallet and MT4/MT5 trading accounts.

### 📧 Enterprise Communication
- **Mandatory Verification:** Secure email verification flow required for account activation.
- **Smart Notifications:** Real-time trade alerts and account status updates via vāntãgeCFD Mail Gateway.
- **Password Recovery:** Robust token-based forgotten password recovery system.

## 🛠️ Technology Stack

- **Frontend:** React 18 (Vite), Redux Toolkit, Tailwind CSS, Lucide Icons.
- **Backend:** PHP 8.1+ (Procedural Gateway API), MySQL 8.0.
- **Mailing:** PHPMailer via vāntãgeCFD Secure SMTP.
- **Infrastructure:** Docker Compose (Apache/MySQL/Node).

## 📂 Project Architecture

```text
/
├── backend/
│   ├── index.php        # Unified API Gateway (Routing & Logic)
│   ├── mails.php        # Dedicated Mail Service (PHPMailer)
│   └── database.sql     # Complete Schema & Initial Configuration
├── frontend/
│   ├── src/
│   │   ├── services/    # Centralized API Interface
│   │   ├── store/       # Redux Global State Management
│   │   ├── pages/       # Portal, Terminal, and Admin Interface
│   │   └── components/  # Reusable UI Design System
│   └── tailwind.config.js
└── docker-compose.yml
```

## ⚡ Setup & Installation

1. **Environment Config:**
   - Rename `backend/.env.example` to `backend/.env` and configure DB credentials.
   - Configure SMTP credentials in `backend/mails.php`.

2. **Docker Quickstart:**
   - Run `docker-compose up -d` to spin up the entire stack.

3. **Manual Frontend Setup:**
   - `cd frontend && npm install && npm run dev`.

---
© 2026 vāntãgeCFD. All rights reserved.
