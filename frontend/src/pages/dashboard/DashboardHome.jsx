import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Wallet, ShieldCheck, ArrowRight,
  Activity, Plus, RefreshCw, AlertCircle,
  BarChart2, Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { accountService } from "../../services/api"; // adjust path if needed
import { useAuth } from "../../context/AuthContext";   // for user name / KYC status

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#EEF0F5] via-[#F7F8FA] to-[#EEF0F5] bg-[length:400%_100%] rounded-lg ${className}`}
      style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
    />
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────
// ─── Account Card ─────────────────────────────────────────────────────────────
function AccountCard({ acc }) {
  // MySQL returns "0"/"1" strings — must compare explicitly
  const isLive = acc.is_demo === "0" || acc.is_demo === 0 || acc.is_demo === false;

  return (
    <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card hover:shadow-lg transition-all group"
      style={{ borderTop: `3px solid ${isLive ? "#10b981" : "#3b82f6"}` }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isLive ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
        }`}>
          {/* Pulsing dot */}
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? "bg-emerald-500 animate-pulse" : "bg-blue-400"}`} />
          {isLive ? "Live Account" : "Demo Account"}
        </span>
        <span className="text-xs font-medium text-[#8897A9]">#{acc.account_number}</span>
      </div>

      {/* Type */}
      <div className="text-xs text-[#8897A9] mb-1 capitalize">
        {acc.type?.replace(/_/g, " ")}
      </div>

      {/* Balance */}
      <div className="font-display font-bold text-2xl text-primary mb-1">
        {acc.currency ?? "USD"}{" "}
        {parseFloat(acc.balance ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      {/* Leverage + status */}
      <div className="text-xs text-[#8897A9] mb-5">
        Leverage 1:{acc.leverage ?? "—"}&nbsp;·&nbsp;
        <span className={acc.status === "active" ? "text-emerald-500" : "text-orange-400"}>
          {acc.status ?? "—"}
        </span>
      </div>

      {/* ── Action buttons — clearly differentiated by account type ── */}
      {isLive ? (
        /* LIVE — two actions: trade + transfer */
        <div className="space-y-2">
          <Link to="/trading-terminal"
            className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" /> Trade Now
          </Link>
          <Link to="/dashboard/transfer"
            className="w-full btn-ghost text-sm py-2.5 flex items-center justify-center gap-2 border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
            <ArrowRight className="w-4 h-4" /> Transfer Funds
          </Link>
        </div>
      ) : (
        /* DEMO — two actions: trade + top up */
        <div className="space-y-2">
          <Link to="/trading-terminal"
            className="w-full btn-ghost text-sm py-2.5 flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Activity className="w-4 h-4" /> Practice Trade
          </Link>
          <Link to="/dashboard/transfer"
            className="w-full text-sm py-2.5 flex items-center justify-center gap-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Plus className="w-4 h-4" /> Top Up Demo
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Account Card Skeleton ─────────────────────────────────────────────────────
function AccountCardSkeleton() {
  return (
    <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-full rounded-lg mt-2" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user } = useAuth();

  const [accounts, setAccounts]     = useState([]);
  const [walletBal, setWalletBal]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [kyc, setKyc] = useState({});

  // ── Derived wallet total from accounts flagged as wallet, or a separate field
  // The backend get_accounts response may include a wallet_balance at top level.
const fetchData = useCallback(async (silent = false) => {
  silent ? setRefreshing(true) : setLoading(true);
  setError("");
  try {
    const { accounts, kyc, wallet_balance } = await accountService.getAll();
    setAccounts(accounts);
    setWalletBal(wallet_balance);

    // Normalise: API may return [] (no docs yet) or { identity:{}, address:{} }
    if (Array.isArray(kyc)) {
      // Empty — no documents uploaded yet
      setKyc({});
    } else {
      setKyc(kyc);
    }
  } catch (err) {
    setError(err.message || "Failed to load account data.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayName = user?.name?.split(" ")[0] ?? "Trader";

  // ── KYC badge based on user object (extend if you add kyc_status to /me)
  const kycStatus = user?.kyc_status ?? "pending";
  const kycColors =
    kycStatus === "approved"
      ? { bg: "bg-emerald-100", text: "text-emerald-600", label: "Approved ✓" }
      : kycStatus === "submitted"
      ? { bg: "bg-blue-100",    text: "text-blue-600",    label: "Under Review" }
      : { bg: "bg-amber-100",   text: "text-amber-600",   label: "Pending" };

  return (
    <>
      {/* Shimmer keyframe injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>

      <div className="space-y-8 animate-fade-in">

        {/* ── Top: Welcome + Wallet ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Welcome banner */}
          <div className="lg:col-span-2 bg-primary rounded-xl p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-teal/5 rounded-full blur-[60px] pointer-events-none" />
            <h1 className="font-display font-extrabold text-3xl text-white mb-2 relative z-10">
              Welcome back, {displayName}!
            </h1>
            <p className="text-white/50 mb-6 relative z-10 text-sm leading-relaxed max-w-md">
              Access global markets and manage your trading portfolio with
              vāntãgeCFD.
            </p>
            <div className="flex gap-3 relative z-10 flex-wrap">
              <Link
                to="/trading-terminal"
                className="btn-primary text-sm px-6 py-3"
              >
                Trade Now
              </Link>
              <Link
                to="/dashboard/funds"
                className="btn-ghost border-white/20 text-white hover:border-accent text-sm px-6 py-3"
              >
                Deposit Funds
              </Link>
            </div>
          </div>

          {/* Wallet card */}
          <div className="bg-white border border-surface-border rounded-xl p-8 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-4">
                <Wallet className="w-4 h-4 text-accent" />
                Wallet Balance
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-10 w-36 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </>
              ) : walletBal !== null ? (
                <>
                  <div className="font-display font-extrabold text-4xl text-primary">
                    $
                    {parseFloat(walletBal).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-teal font-semibold mt-1">
                    Available for transfer
                  </div>
                </>
              ) : (
                <>
                  <div className="font-display font-extrabold text-4xl text-primary">
                    $0.00
                  </div>
                  <div className="text-xs text-[#8897A9] mt-1">
                    No wallet data returned
                  </div>
                </>
              )}
            </div>
            <Link
              to="/dashboard/transfer"
              className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all mt-6"
            >
              Move Funds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchData()}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* ── Trading Accounts ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-primary">
              Your Trading Accounts
            </h2>
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing || loading}
                className="w-8 h-8 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                aria-label="Refresh accounts"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
              <Link
                to="/dashboard/accounts"
                className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Open New Account
              </Link>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton placeholders
              Array.from({ length: 2 }).map((_, i) => (
                <AccountCardSkeleton key={i} />
              ))
            ) : accounts.length > 0 ? (
              accounts.map((acc) => <AccountCard key={acc.id} acc={acc} />)
            ) : (
              // Empty state
              <div className="md:col-span-2 lg:col-span-3 bg-white border border-dashed border-surface-border rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-accent" />
                </div>
                <p className="font-semibold text-primary">No trading accounts yet</p>
                <p className="text-sm text-[#8897A9] max-w-xs">
                  Open your first trading account to start accessing global
                  markets.
                </p>
                <Link
                  to="/dashboard/accounts"
                  className="mt-2 btn-primary text-sm px-6 py-2.5"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Open Account
                </Link>
              </div>
            )}
          </div>

          {/* Account count summary */}
          {!loading && accounts.length > 0 && (
            <p className="text-xs text-[#8897A9]">
              {accounts.filter((a) => !a.is_demo).length} live ·{" "}
              {accounts.filter((a) => a.is_demo).length} demo account
              {accounts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* ── Status Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KYC */}
          <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-primary">KYC Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${kycColors.bg} ${kycColors.text}`}
                >
                  {kycColors.label}
                </span>
              </div>
              {kycStatus !== "approved" ? (
                <>
                  <p className="text-xs text-[#8897A9] mt-0.5">
                    Upload your ID and Proof of Address to unlock full access.
                  </p>
                  <Link
                    to="/dashboard/kyc"
                    className="text-xs font-bold text-accent mt-2 block hover:underline"
                  >
                    Upload Documents →
                  </Link>
                </>
              ) : (
                <p className="text-xs text-[#8897A9] mt-0.5">
                  Your identity has been verified. Full trading access is
                  enabled.
                </p>
              )}
            </div>
          </div>

          {/* Leverage */}
          <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-primary">Account Leverage</div>
              {loading ? (
                <Skeleton className="h-3 w-40 mt-1.5" />
              ) : accounts.length > 0 ? (
                <p className="text-xs text-[#8897A9] mt-0.5">
                  Max leverage across your accounts:{" "}
                  <span className="font-semibold text-primary">
                    1:
                    {Math.max(...accounts.map((a) => parseInt(a.leverage) || 0))}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-[#8897A9] mt-0.5">
                  No accounts found.
                </p>
              )}
              <Link
                to="/dashboard/accounts"
                className="text-xs font-bold text-teal mt-2 block hover:underline"
              >
                Manage Leverage →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}