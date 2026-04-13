# vāntãgeCFD — API Documentation (MySQLi Backend)

This document specifies the REST API endpoints for the vāntãgeCFD platform. The backend is implemented using PHP with the **MySQLi** extension.

**Base URL:** `https://vantageCFD.com/api/`
**Content-Type:** `application/json`
**Authentication:** Bearer JWT (required for protected routes)

---

## 1. Response Envelope

All responses follow this standard JSON format:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

## 2. Authentication

### POST `/auth/register`
Create a new trader account.

**Payload:**
```json
{
  "first_name": "James",
  "last_name": "Okonkwo",
  "email": "james@example.com",
  "password": "securePass123",
  "confirm_password": "securePass123",
  "phone": "+234800000000",
  "country": "Nigeria",
  "account_type": "standard_stp"
}
```

### POST `/auth/login`
Authenticate and receive a JWT.

**Payload:**
```json
{
  "email": "trader@vantageCFD.com",
  "password": "trader123"
}
```

---

## 3. Trading Accounts & Wallet

### GET `/accounts`
List all trading accounts (Live & Demo) for the authenticated user.

### POST `/accounts`
Open a new trading account.

**Payload:**
```json
{
  "type": "raw_ecn",
  "is_demo": false,
  "leverage": 500
}
```

### POST `/payments/transfer`
Transfer funds between the main wallet and a trading account.

**Payload:**
```json
{
  "from": "wallet",
  "to": "8800123",
  "amount": 500.00
}
```

---

## 4. KYC & Profile

### POST `/kyc/upload`
Upload a document for identity or address verification.
Requires `multipart/form-data`.

### GET `/kyc`
List the status of submitted KYC documents.

---

## 5. Payments & Trading

### POST `/payments/deposit`
Initiate a cryptocurrency deposit via Coinbase Commerce.

### POST `/trading/execute`
Place a trade on the Web Terminal.

**Payload:**
```json
{
  "trading_account_id": 12,
  "symbol": "EUR/USD",
  "type": "buy",
  "order_type": "market",
  "lots": 0.10
}
```

### GET `/trading/positions`
Get open positions for a specific account.

---

## 6. Admin Panel (Admin Only)

### GET `/admin/users`
List all users (paginated).

### GET `/admin/dashboard/stats`
Platform-wide statistics for the admin dashboard.

### PATCH `/admin/transactions/{id}/approve`
Approve a pending deposit or withdrawal.

---

## 7. Copy Trading

### GET `/signals`
Get a list of all active signal providers.

### POST `/signals/copy`
Follow/Copy a provider.
