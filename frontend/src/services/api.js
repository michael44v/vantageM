/**
 * Vantage Markets — Frontend API Service
 *
 * Base: https://vantagemarketts.com/backend/api.php
 * Auth: PHP returns a base64 token on login.
 *       Stored in localStorage, sent as Bearer on every request.
 *
 * KYC:  Files are uploaded to Cloudinary first (unsigned preset),
 *       then the secure_url is POSTed to ?action=upload_kyc via FormData.
 */

const BASE_URL = "https://vantagemarketts.com/backend/";

// ── Cloudinary config (from .env) ─────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME    = "dguvkirdr";
const CLOUDINARY_UPLOAD_PRESET = "ablemarkets"

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken   = ()      => localStorage.getItem("vm_token");
export const setToken   = (tok)   => localStorage.setItem("vm_token", tok);
export const clearToken = ()      => localStorage.removeItem("vm_token");

// ── Core request helper ───────────────────────────────────────────────────────
/**
 * @param {string} action        ?action= value
 * @param {object} opts
 * @param {string}  opts.method  GET | POST  (default GET)
 * @param {object}  opts.body    JSON body for POST
 * @param {object}  opts.params  Extra query-string params
 */
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
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || "Request failed.");
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
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
   * Maps camelCase → PHP snake_case.
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

// ── Trading Accounts ──────────────────────────────────────────────────────────
export const accountService = {
  /**
   * GET ?action=get_accounts
   * Returns:
   *   { success, data: { accounts: [...], kyc: {...}, balance: number } }
   *
   * Normalised return shape:
   *   { accounts, kyc, wallet_balance }
   */
  getAll: async () => {
    const res = await req("get_accounts");
    return {
      accounts:       Array.isArray(res.data?.accounts) ? res.data.accounts : [],
      kyc:            res.data?.kyc ?? {},
      wallet_balance: res.data?.balance ?? null,
    };
  },

  /**
   * POST ?action=create_account
   * Payload: { type, is_demo, leverage }
   * PHP enforces one account per type per mode (live vs demo).
   */
  createAccount: ({ type, isDemo, leverage }) =>
    req("create_account", {
      method: "POST",
      body: {
        type,
        is_demo:  isDemo ? 1 : 0,
        leverage: parseInt(leverage, 10),
      },
    }),

  /**
   * POST ?action=demo_topup
   * Payload: { account_id, amount }
   * Only works on is_demo = 1 accounts.
   */
  demoTopUp: (accountId, amount) =>
    req("demo_topup", {
      method: "POST",
      body: { account_id: accountId, amount },
    }),

  /**
   * POST ?action=internal_transfer
   * Payload: { account_id, amount, direction }
   * direction: "wallet_to_acc" | "acc_to_wallet"
   *
   * @param {string} from       "wallet" or account id (string/number)
   * @param {string} to         "wallet" or account id (string/number)
   * @param {number} amount
   * @param {Array}  accounts   Full account list to resolve id
   */
  internalTransfer: ({ from, to, amount, accounts }) => {
    const isFromWallet = from === "wallet";
    const accountId    = isFromWallet ? to : from;
    const account      = accounts.find((a) => String(a.id) === String(accountId));

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
   * Payload: { account_id, leverage }
   */
  updateLeverage: (accountId, leverage) =>
    req("update_leverage", {
      method: "POST",
      body: { account_id: accountId, leverage: parseInt(leverage, 10) },
    }),
};

// ── KYC ───────────────────────────────────────────────────────────────────────
export const kycService = {
  /**
   * GET ?action=get_kyc
   * Returns: { success, data: [{ id, document_type, file_url, status,
   *             rejection_reason, created_at }] }
   */
  getDocuments: () => req("get_kyc"),

  /**
   * Two-step upload:
   *   1. Upload file to Cloudinary (unsigned preset) → get secure_url
   *   2. POST ?action=upload_kyc via FormData with:
   *        file          — the original File object (PHP $_FILES fallback)
   *        document_type — "identity" | "address"
   *        file_url      — Cloudinary secure_url  ← PHP prefers this
   *        public_id     — Cloudinary public_id   (extra metadata)
   *
   * @param {File}   file
   * @param {string} docType   "identity" | "address"
   */
  upload: async (file, docType = "identity") => {
    // ── Step 1: Cloudinary upload ──────────────────────────────────────────
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary is not configured. " +
        "Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env"
      );
    }

    const cfForm = new FormData();
    cfForm.append("file",           file);
    cfForm.append("upload_preset",  CLOUDINARY_UPLOAD_PRESET);
    cfForm.append("folder",         "vantage_kyc");

    const cfRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: cfForm }
    );

    if (!cfRes.ok) {
      const err = await cfRes.json();
      throw new Error(err.error?.message || "Cloudinary upload failed.");
    }

    const { secure_url, public_id } = await cfRes.json();

    // ── Step 2: Backend registration ──────────────────────────────────────
    const backendForm = new FormData();
    backendForm.append("file",          file);          // satisfies PHP $_FILES check
    backendForm.append("document_type", docType);
    backendForm.append("file_url",      secure_url);
    backendForm.append("public_id",     public_id);

    const token = getToken();
    const backendRes = await fetch(`${BASE_URL}?action=upload_kyc`, {
      method:      "POST",
      credentials: "include",
      headers:     token ? { Authorization: `Bearer ${token}` } : {},
      body:        backendForm,
      // NOTE: Do NOT set Content-Type here — browser sets it automatically
      //       with the correct multipart boundary when using FormData.
    });

    const backendData = await backendRes.json();
    if (!backendRes.ok || backendData.success === false) {
      throw new Error(backendData.error || "KYC submission failed.");
    }
    return backendData;
  },
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  /**
   * POST ?action=deposit
   * Payload: { amount, currency }
   * PHP returns: { success, message, url }
   *
   * NOTE: The current PHP handle_deposit() is a stub that returns a mock URL.
   * When you wire up a real payment processor, the caller should do:
   *   const res = await paymentService.initiateDeposit({ amount, currency });
   *   if (res.url) window.location.href = res.url;
   */
  initiateDeposit: ({ amount, currency = "USD" }) =>
    req("deposit", {
      method: "POST",
      body: { amount: parseFloat(amount), currency },
    }),
};

// ── Trading ───────────────────────────────────────────────────────────────────
export const tradingService = {
  /**
   * GET ?action=get_user_accounts
   * Returns active accounts for the terminal account-selector screen.
   * { success, data: [{ id, account_number, type, is_demo,
   *                     balance, leverage, currency, status }] }
   */
  getUserAccounts: () => req("get_user_accounts"),

  /**
   * POST ?action=execute_trade
   * Payload (PHP):
   *   account_id, symbol, type (long|short), lots, price,
   *   stop_loss?, take_profit?
   *
   * PHP checks margin, inserts into `positions`, mirrors to copiers.
   * Returns: { success, message, data: <new position row> }
   */
  execute: ({ tradingAccountId, symbol, type, lots, price, stopLoss, takeProfit }) =>
    req("execute_trade", {
      method: "POST",
      body: {
        account_id:  tradingAccountId,
        symbol,
        type:        type === "buy" ? "long" : "short",
        lots:        parseFloat(lots),
        price:       parseFloat(price),
        stop_loss:   stopLoss   ? parseFloat(stopLoss)   : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
      },
    }),

  /**
   * GET ?action=get_positions&account_id={id}
   * PHP applies simulated price movement and calculates live P&L.
   * Returns: { success, data: [...positions] }
   */
  getPositions: (accountId) =>
    req("get_positions", { params: { account_id: accountId } }),

  /**
   * POST ?action=close_position
   * Payload: { position_id }
   * PHP calculates final P&L, marks position closed, credits/debits account.
   * Returns: { success, message, data: { position_id, close_price, pnl } }
   *
   * NOTE: The frontend also receives `credit` from res.data to update local
   * balance. PHP currently returns `pnl` — use that as the credit value.
   */
  closePosition: (positionId) =>
    req("close_position", {
      method: "POST",
      body: { position_id: positionId },
    }),

  /**
   * GET ?action=get_trade_history
   *     &account_id={id}&page={n}&per_page=20
   * Returns: { success, data: [...closed positions], meta: { page, last_page, total } }
   */
  getTradeHistory: (accountId, page = 1) =>
    req("get_trade_history", {
      params: { account_id: accountId, page, per_page: 20 },
    }),
};

// ── Copy Trading ──────────────────────────────────────────────────────────────
export const copyTradingService = {
  /**
   * GET ?action=get_signals
   * Returns active signal providers joined with the user name.
   * { success, data: [{ id, name, description, roi, win_rate,
   *                     drawdown, subscribers, provider_name }] }
   */
  getProviders: () => req("get_signals"),

  /**
   * POST ?action=copy_signal
   * Payload: { provider_id, trading_account_id, risk_multiplier }
   * PHP upserts copy_relationships row.
   * Returns: { success, message, data: { copy_id } }
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

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminService = {
  /**
   * GET ?action=admin_live_trades
   * Returns all open positions with trader_name + account_number.
   * PHP applies simulated price movement for live P&L.
   */
  getLiveTrades: () => req("admin_live_trades"),

  /**
   * GET ?action=admin_get_users&page=1&per_page=20
   * Paginated user list.
   * Returns: { success, data: [...users], meta: { page, last_page, total } }
   */
  getUsers: (page = 1, perPage = 20) =>
    req("admin_get_users", { params: { page, per_page: perPage } }),

  /**
   * GET ?action=admin_dashboard_stats
   * Returns: { success, data: { total_users, active_users, total_accounts,
   *             open_positions, total_deposits, pending_transactions, pending_kyc } }
   */
  getDashboardStats: () => req("admin_dashboard_stats"),

  /**
   * POST ?action=admin_approve_transaction
   * Payload: { transaction_id }
   * PHP marks transaction completed and credits wallet for deposits.
   */
  approveTransaction: (id) =>
    req("admin_approve_transaction", {
      method: "POST",
      body: { transaction_id: id },
    }),
};