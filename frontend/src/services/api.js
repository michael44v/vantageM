/**
 * Vantage Markets — Frontend API Service
 *
 * Mirrors the PHP backend's ?action= routing exactly.
 * Base: https://vantagemarketts.com/backend/api
 *
 * Auth: PHP returns a base64 token on login.
 * We store it in localStorage and send as Bearer on every request.
 *
 * KYC files: uploaded to Cloudinary first, then the secure_url is sent
 * to the backend via the upload_kyc action (FormData).
 */

const BASE_URL = "https://vantagemarketts.com/backend/";

// ── Replace with your Cloudinary project details ──────────────────────────────
const CLOUDINARY_CLOUD_NAME    = "YOUR_CLOUD_NAME";    // e.g. "dxyz123"
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // unsigned preset name
// ─────────────────────────────────────────────────────────────────────────────

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getToken   = ()    => localStorage.getItem("vm_token");
export const setToken   = (tok) => localStorage.setItem("vm_token", tok);
export const clearToken = ()    => localStorage.removeItem("vm_token");

// ─── Core Request ─────────────────────────────────────────────────────────────
async function req(action, { method = "GET", body = null, params = {} } = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || "Request failed.");
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  /**
   * POST ?action=login
   * PHP returns: { success, token, user: { id, name, role, email } }
   */
  login: async ({ email, password }) => {
    const res = await req("login", { method: "POST", body: { email, password } });
    if (res.token) setToken(res.token);
    return res; // caller reads res.user.role for redirect
  },

  /**
   * POST ?action=register
   * Maps camelCase form → PHP snake_case fields.
   * accountType: "standard" → "standard_stp", "raw" → "raw_ecn", "demo" → "demo"
   */
  register: (form) => {
    const typeMap = { standard: "standard_stp", raw: "raw_ecn", demo: "demo" };
    return req("register", {
      method: "POST",
      body: {
        first_name:       form.firstName,
        last_name:        form.lastName,
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirmPassword,
        phone:            form.phone || "",
        country:          form.country,
        account_type:     typeMap[form.accountType] ?? "standard_stp",
      },
    });
  },

  logout: () => clearToken(),
};

// ─── Trading Accounts ─────────────────────────────────────────────────────────
export const accountService = {
  /**
   * GET ?action=get_accounts
   * Returns { success, data: [{ id, account_number, type, is_demo,
   *   balance, leverage, currency, status }] }
   */
  getAll: () => req("get_accounts"),

  /**
   * POST ?action=create_account
   * Payload: { type, is_demo, leverage }
   */
  create: (payload) => req("create_account", { method: "POST", body: payload }),

  /**
   * POST ?action=internal_transfer
   * PHP payload: { account_id, amount, direction }
   *
   * @param {string} from     - "wallet" or an account_number
   * @param {string} to       - "wallet" or an account_number
   * @param {number} amount
   * @param {Array}  accounts - full accounts list to resolve account_number → id
   */
  internalTransfer: ({ from, to, amount, accounts }) => {
    const isFromWallet  = from === "wallet";
    const accountNumber = isFromWallet ? to : from;
    const account       = accounts.find((a) => a.account_number === accountNumber);
    if (!account) throw new Error("Could not resolve account for transfer.");

    return req("internal_transfer", {
      method: "POST",
      body: {
        account_id: account.id,
        amount:     parseFloat(amount),
        direction:  isFromWallet ? "wallet_to_acc" : "acc_to_wallet",
      },
    });
  },

  /**
   * POST ?action=update_leverage
   * PHP payload: { account_id, leverage }
   */
  updateLeverage: (accountId, leverage) =>
    req("update_leverage", {
      method: "POST",
      body: { account_id: accountId, leverage: parseInt(leverage, 10) },
    }),
};

// ─── KYC ─────────────────────────────────────────────────────────────────────
export const kycService = {
  /**
   * Two-step upload:
   *   1. Push file to Cloudinary (unsigned) → get secure_url
   *   2. POST ?action=upload_kyc with FormData (file_url + document_type)
   *      PHP currently checks $_FILES['file']; sending FormData keeps
   *      compatibility and also includes the Cloudinary URL for future use.
   *
   * @param {File}   file
   * @param {string} docType  "identity" | "address"
   */
  upload: async (file, docType = "identity") => {
    // Step 1 — Cloudinary
    const cfForm = new FormData();
    cfForm.append("file", file);
    cfForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    cfForm.append("folder", "vantage_kyc");

    const cfRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: cfForm }
    );
    if (!cfRes.ok) {
      const err = await cfRes.json();
      throw new Error(err.error?.message || "Cloudinary upload failed.");
    }
    const { secure_url, public_id } = await cfRes.json();

    // Step 2 — Backend (FormData so $_FILES['file'] check is satisfied,
    // plus we pass the CDN url and type as extra fields)
    const backendForm = new FormData();
    backendForm.append("file", file);
    backendForm.append("document_type", docType);
    backendForm.append("file_url", secure_url);
    backendForm.append("public_id", public_id);

    const token = getToken();
    const backendRes = await fetch(`${BASE_URL}?action=upload_kyc`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: backendForm,
    });
    const backendData = await backendRes.json();
    if (!backendRes.ok || backendData.success === false) {
      throw new Error(backendData.error || "KYC submission failed.");
    }
    return backendData;
  },
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentService = {
  /**
   * POST ?action=deposit
   * PHP returns: { success, message, url }  ← Coinbase hosted_url
   * Caller: window.location.href = res.url
   */
  initiateDeposit: ({ amount, currency = "USD" }) =>
    req("deposit", {
      method: "POST",
      body: { amount: parseFloat(amount), currency },
    }),
};

// ─── Trading ──────────────────────────────────────────────────────────────────
export const tradingService = {
  /**
   * POST ?action=execute_trade
   * PHP expects: { account_id, symbol, type ("long"|"short"), lots, price }
   * UI sends "buy"/"sell" so we map here to match the DB positions enum.
   */
  execute: ({ tradingAccountId, symbol, type, lots, price }) =>
    req("execute_trade", {
      method: "POST",
      body: {
        account_id: tradingAccountId,
        symbol,
        type:  type === "buy" ? "long" : "short",
        lots:  parseFloat(lots),
        price: parseFloat(price),
      },
    }),

  /**
   * GET ?action=get_positions&account_id={id}
   */
  getPositions: (accountId) =>
    req("get_positions", { params: { account_id: accountId } }),
};

// ─── Copy Trading ─────────────────────────────────────────────────────────────
// DB tables exist (signals, copy_relationships).
// PHP actions get_signals / copy_signal need to be added to api.php.
export const copyTradingService = {
  /** GET ?action=get_signals */
  getProviders: () => req("get_signals"),

  /**
   * POST ?action=copy_signal
   * Payload → copy_relationships row:
   *   copier_id (from auth), provider_id, trading_account_id, risk_multiplier
   */
  copyProvider: ({ providerId, tradingAccountId, riskMultiplier = 1.0 }) =>
    req("copy_signal", {
      method: "POST",
      body: {
        provider_id:        providerId,
        trading_account_id: tradingAccountId,
        risk_multiplier:    parseFloat(riskMultiplier),
      },
    }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminService = {
  /**
   * GET ?action=admin_live_trades
   * Returns all open positions with trader_name + account_number.
   * PHP applies simulated price movement for live P&L.
   */
  getLiveTrades: () => req("admin_live_trades"),

  /** GET ?action=admin_get_users&page=1&per_page=20  (PHP handler needed) */
  getUsers: (page = 1, perPage = 20) =>
    req("admin_get_users", { params: { page, per_page: perPage } }),

  /** GET ?action=admin_dashboard_stats  (PHP handler needed) */
  getDashboardStats: () => req("admin_dashboard_stats"),

  /** POST ?action=admin_approve_transaction  (PHP handler needed) */
  approveTransaction: (id) =>
    req("admin_approve_transaction", {
      method: "POST",
      body: { transaction_id: id },
    }),
};
