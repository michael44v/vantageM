import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Loader2, AlertCircle, X, CheckCircle } from "lucide-react";
import { accountService } from "../../services/api";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#EEF0F5] via-[#F7F8FA] to-[#EEF0F5] bg-[length:400%_100%] rounded-lg ${className}`}
      style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
    />
  );
}

const TYPE_LABELS = {
  standard_stp: "Standard STP",
  raw_ecn: "Raw ECN",
  pro_ecn: "Pro ECN",
};
const LEVERAGE_OPTIONS = [100, 200, 500];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#8897A9] hover:text-primary hover:bg-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="font-display font-bold text-2xl mb-6 text-primary">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-xl shadow-2xl animate-fade-in-up">
      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

function LeverageModal({ account, onClose, onSuccess }) {
  const [leverage, setLeverage] = useState(String(account.leverage));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await accountService.updateLeverage(account.id, leverage);
      onSuccess(`Leverage updated to 1:${leverage}`);
    } catch (err) {
      setError(err.message || "Failed to update leverage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change Leverage" onClose={onClose}>
      <p className="text-sm text-[#8897A9] mb-5">
        Account <span className="font-bold text-primary">#{account.account_number}</span>
      </p>
      <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">New Leverage</label>
      <select className="input-field mb-5" value={leverage} onChange={(e) => setLeverage(e.target.value)}>
        {LEVERAGE_OPTIONS.map((l) => <option key={l} value={l}>1:{l}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving…" : "Update"}
        </button>
      </div>
    </Modal>
  );
}

function CreateAccountModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ type: "standard_stp", isDemo: false, leverage: "500" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await accountService.createAccount(form);
      onSuccess(res.data);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Open New Account" onClose={onClose}>
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Account Type</label>
        <select className="input-field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Leverage</label>
        <select className="input-field" value={form.leverage} onChange={(e) => setForm((f) => ({ ...f, leverage: e.target.value }))}>
          {LEVERAGE_OPTIONS.map((l) => <option key={l} value={l}>1:{l}</option>)}
        </select>
      </div>
      <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-surface-border bg-surface/30">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isDemo: !f.isDemo }))}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isDemo ? "bg-accent" : "bg-[#DDE3EE]"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isDemo ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <div>
          <p className="text-sm font-bold text-primary">Demo Account</p>
          <p className="text-xs text-[#8897A9]">{form.isDemo ? "Practice with virtual funds" : "Live account — real funds"}</p>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 mb-4 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Creating…" : "Create Account"}
        </button>
      </div>
    </Modal>
  );
}

// Mobile account card (replaces table row on small screens)
function AccountCard({ acc, onChangeLeverage }) {
  const isLive = acc.is_demo === "0" || acc.is_demo === false || acc.is_demo === 0;
  return (
    <div className="bg-white border border-surface-border rounded-xl p-5 shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-primary text-sm">MT4 Account</div>
          <div className="text-xs text-[#8897A9]">#{acc.account_number}</div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${isLive ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
          {isLive ? "Live" : "Demo"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#8897A9]">Type</span>
          <div className="font-semibold text-primary mt-0.5">{TYPE_LABELS[acc.type] ?? acc.type}</div>
        </div>
        <div>
          <span className="text-[#8897A9]">Leverage</span>
          <div className="font-semibold text-primary mt-0.5">1:{acc.leverage}</div>
        </div>
        <div className="col-span-2">
          <span className="text-[#8897A9]">Balance</span>
          <div className="font-bold text-primary mt-0.5 text-base">
            {acc.currency} {parseFloat(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-1 border-t border-surface-border">
        <button onClick={() => onChangeLeverage(acc)} className="text-xs font-bold text-accent hover:underline">Change Leverage</button>
        <span className="text-[#DDE3EE]">|</span>
        <button className="text-xs font-bold text-primary hover:underline">History</button>
      </div>
    </div>
  );
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [leverageTarget, setLeverageTarget] = useState(null);

  const fetchAccounts = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await accountService.getAll();
      setAccounts(res.accounts ?? []);
    } catch (err) {
      setError(err.message || "Could not load accounts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleAccountCreated = (newAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    setShowCreate(false);
    setToast(`Account #${newAccount.account_number} created!`);
  };

  const handleLeverageSuccess = (msg) => {
    setLeverageTarget(null);
    setToast(msg);
    fetchAccounts(true);
  };

  const isLive = (acc) => acc.is_demo === "0" || acc.is_demo === false || acc.is_demo === 0;

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-display font-extrabold text-2xl text-primary">Trading Accounts</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAccounts(true)} disabled={refreshing || loading}
              className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
              <Plus className="w-4 h-4" /> Open New Account
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => fetchAccounts()} className="text-xs font-bold text-red-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white border border-surface-border rounded-xl p-5 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))
            : accounts.length === 0
            ? (
              <div className="bg-white border border-dashed border-surface-border rounded-xl p-10 flex flex-col items-center text-center gap-3">
                <p className="font-semibold text-primary">No trading accounts yet</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-5 py-2.5 mt-1">
                  <Plus className="w-4 h-4 inline mr-1.5" /> Open Account
                </button>
              </div>
            )
            : accounts.map((acc) => (
              <AccountCard key={acc.id} acc={acc} onChangeLeverage={setLeverageTarget} />
            ))
          }
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface/50 border-b border-surface-border">
                <tr>
                  {["Account Info", "Type", "Account Mode", "Leverage", "Balance", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9] whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                  : accounts.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-sm text-[#8897A9]">
                        No trading accounts yet.{" "}
                        <button onClick={() => setShowCreate(true)} className="font-bold text-accent hover:underline">
                          Open your first account →
                        </button>
                      </td>
                    </tr>
                  )
                  : accounts.map((acc) => {
                    const live = isLive(acc);
                    return (
                      <tr key={acc.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-primary">MT4 Account</div>
                          <div className="text-xs text-[#8897A9]">#{acc.account_number}</div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#4A5568] whitespace-nowrap">{TYPE_LABELS[acc.type] ?? acc.type}</td>
                        {/* ← NEW: Demo / Live column */}
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${live ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                            {live ? "Live" : "Demo"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#4A5568]">1:{acc.leverage}</td>
                        <td className="px-6 py-5 font-bold text-primary whitespace-nowrap">
                          {acc.currency} {parseFloat(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.status === "active" ? "bg-teal-100 text-teal-600" : "bg-orange-100 text-orange-500"}`}>
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <button onClick={() => setLeverageTarget(acc)} className="text-xs font-bold text-accent hover:underline">Change Leverage</button>
                          <span className="mx-2 text-[#DDE3EE]">|</span>
                          <button className="text-xs font-bold text-primary hover:underline">History</button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Count */}
        {!loading && accounts.length > 0 && (
          <p className="text-xs text-[#8897A9]">
            {accounts.filter(isLive).length} live · {accounts.filter((a) => !isLive(a)).length} demo account{accounts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onSuccess={handleAccountCreated} />}
      {leverageTarget && <LeverageModal account={leverageTarget} onClose={() => setLeverageTarget(null)} onSuccess={handleLeverageSuccess} />}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}