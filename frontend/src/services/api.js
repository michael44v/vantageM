/**
 * vāntãgeCFD — Frontend API Service
 *
 * Base: https://vantagemarketts.com/backend/api.php
 * Auth: PHP returns a base64 token on login.
 *       Stored in localStorage, sent as Bearer on every request.
 *
 * KYC:  Files are uploaded to Cloudinary first (unsigned preset),
 *       then the secure_url is POSTed to ?action=upload_kyc via FormData.
 */

const BASE_URL = "/api/index.php";

// ── Cloudinary config (from .env) ─────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME    = "dguvkirdr";
const CLOUDINARY_UPLOAD_PRESET = "ablemarkets";

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


// ── Mail base URL (separate PHP file) ─────────────────────────────────────────
const MAIL_URL = "https://vantagemarketts.com/backend/mails.php";

// ── Mail request helper (separate from main req() since different base URL) ───
async function mailReq(action, body = {}) {
  const url = new URL(MAIL_URL);
  url.searchParams.set("action", action);

  try {
    const res  = await fetch(url.toString(), {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Mail request failed:", err);
    return { success: false, error: err.message };
  }
}

// ── Mail service ──────────────────────────────────────────────────────────────
export const mailService = {
  /**
   * Sends the registration confirmation / welcome email.
   * Called fire-and-forget after authService.register() succeeds.
   */
  registerConfirm: ({ firstName, lastName, email, verifyToken }) =>
    mailReq("send_mail", {
      first_name: firstName,
      last_name: lastName,
      email,
      verify_token: verifyToken,
    }),

  sendCustomMail: ({ email, subject, message }) =>
    mailReq("send_mail", { email, subject, message }),
};



async function req(action, { method = "GET", body = null, params = {} } = {}) {
  const url = new URL(BASE_URL, window.location.origin);
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

  // Add to authService:
verifyEmailToken: async (token) => {
  const res = await req("verify_email_token", {
    method: "POST",
    body: { token },
  });
  if (res.token) setToken(res.token);
  return res;
},

resendVerification: (userId) =>
  req("resend_verification", {
    method: "POST",
    body: { user_id: userId },
  }),

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

  requestPasswordReset: (email) =>
    req("forgot_password", { method: "POST", body: { email } }),

  resetPassword: ({ email, token, password }) =>
    req("reset_password", {
      method: "POST",
      body: { email, token, password },
    }),
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
  const isToWallet   = to   === "wallet";

  // If transferring wallet → account, resolve the destination account
  // If transferring account → wallet, resolve the source account
  const accountId = isFromWallet ? to : from;

  // "wallet" on either side is valid — only resolve if it's an account id
  let account = null;
  if (accountId !== "wallet") {
    account = accounts.find((a) => String(a.id) === String(accountId));
    if (!account) {
      throw new Error(
        `Could not resolve account (id: ${accountId}). ` +
        `Available: ${accounts.map((a) => a.id).join(", ")}`
      );
    }
  }

  return req("internal_transfer", {
    method: "POST",
    body: {
      account_id: account?.id ?? accountId,
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
  getDocuments: () => req("get_kyc"),

  /**
   * Two-step: Cloudinary upload happens in the component.
   * This method ONLY registers the URL in the backend.
   */
  registerDocument: ({ docType, fileUrl, publicId }) =>
    req("upload_kyc_url", {
      method: "POST",
      body: {
        document_type: docType,
        file_url:      fileUrl,
        public_id:     publicId,
      },
    }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  /**
   * POST ?action=submit_deposit
   * Saves deposit request with Cloudinary receipt URL to DB.
   */

  // Add to paymentService:
getTransactions: ({ type = "all", status = "", page = 1 } = {}) =>
  req("get_transactions", {
    params: { type, status, page, per_page: 15 },
  }),

  submitDeposit: ({ amount, currency = "USD", method, cryptoSymbol, txRef, receiptUrl }) =>
    req("submit_deposit", {
      method: "POST",
      body: {
        amount,
        currency,
        method,
        crypto_symbol: cryptoSymbol || undefined,
        tx_ref:        txRef,
        receipt_url:   receiptUrl,
      },
    }),

  /**
   * POST ?action=submit_withdrawal
   */
  submitWithdrawal: ({ amount, method, bankName, accountName, accountNumber, cryptoSymbol, cryptoAddress }) =>
    req("submit_withdrawal", {
      method: "POST",
      body: {
        amount,
        method,
        bank_name:       bankName       || undefined,
        account_name:    accountName    || undefined,
        account_number:  accountNumber  || undefined,
        crypto_symbol:   cryptoSymbol   || undefined,
        crypto_address:  cryptoAddress  || undefined,
      },
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
// Add to copyTradingService:
export const copyTradingService = {
  getProviders: () => req("get_signals"),

  copyProvider: ({ providerId, tradingAccountId, riskMultiplier = 1.0 }) =>
    req("copy_signal", {
      method: "POST",
      body: {
        provider_id:        providerId,
        trading_account_id: tradingAccountId,
        risk_multiplier:    parseFloat(riskMultiplier),
      },
    }),

  // NEW
  getMyCopies: () => req("get_my_copies"),

  stopCopy: (providerId) =>
    req("stop_copy", {
      method: "POST",
      body: { provider_id: providerId },
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

   getDeposits: (status = "", page = 1) =>
    req("admin_get_deposits", { params: { status, page, per_page: 20 } }),

  approveDeposit: (depositId) =>
    req("admin_approve_deposit", { method: "POST", body: { deposit_id: depositId } }),

  rejectDeposit: (depositId, adminNote = "") =>
    req("admin_reject_deposit", { method: "POST", body: { deposit_id: depositId, admin_note: adminNote } }),


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

  rejectTransaction: (id, reason) =>
    req("admin_reject_transaction", {
      method: "POST",
      body: { id, rejection_reason: reason },
    }),

  updateUser: (user) => req("admin_update_user", { method: "POST", body: user }),
  deleteUser: (id) => req("admin_delete_user", { method: "POST", body: { id } }),

  getSignals: () => req("admin_get_signals"),
  upsertSignal: (signal) => req("admin_upsert_signal", { method: "POST", body: signal }),
  deleteSignal: (id) => req("admin_delete_signal", { method: "POST", body: { id } }),

  getKYCRequests: () => req("admin_get_kyc"),
  approveKYC: (id) => req("admin_approve_kyc", { method: "POST", body: { id } }),
  rejectKYC: (id, reason) => req("admin_reject_kyc", { method: "POST", body: { id, rejection_reason: reason } }),

  getAllTransactions: (params = {}) => req("admin_get_all_transactions", { params }),

  getMarketData: () => req("get_market_data"),

  getSettings: () => req("admin_get_settings"),
  updateSettings: (settings) => req("admin_update_settings", { method: "POST", body: settings }),
};

export const siteService = {
  getSettings: () => req("get_site_settings"),
};