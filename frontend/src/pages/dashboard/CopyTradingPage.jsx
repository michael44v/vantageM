import { useState, useEffect, useCallback } from "react";
import {
  Users, TrendingUp, Shield, Activity,
  Search, Loader2, AlertCircle, CheckCircle,
  X, ChevronDown, RefreshCw
} from "lucide-react";
import { copyTradingService, accountService } from "../../services/api";

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in-up text-white ${type === "success" ? "bg-primary" : "bg-red-600"}`}>
      {type === "success"
        ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ── Copy Modal ─────────────────────────────────────────────────────────────────
function CopyModal({ provider, accounts, onClose, onSuccess }) {
  const [selectedAcc, setSelectedAcc]     = useState("");
  const [riskMultiplier, setRisk]         = useState("1.0");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  // Only live accounts can copy
  const liveAccounts = accounts.filter(
    (a) => a.is_demo === "0" || a.is_demo === false || a.is_demo === 0
  );

  const handleCopy = async () => {
    if (!selectedAcc) { setError("Select a trading account."); return; }
    setLoading(true);
    setError("");
    try {
      await copyTradingService.copyProvider({
        providerId:        provider.id,
        tradingAccountId:  parseInt(selectedAcc, 10),
        riskMultiplier:    parseFloat(riskMultiplier),
      });
      onSuccess(`Now copying ${provider.name}! All new trades will mirror automatically.`);
    } catch (err) {
      setError(err.message || "Failed to start copying.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#8897A9] hover:text-primary hover:bg-surface transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Provider summary */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center font-display font-bold text-accent text-xl">
            {provider.name[0]}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-primary">{provider.name}</h2>
            <p className="text-xs text-[#8897A9]">{provider.type ?? provider.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-surface rounded-xl border border-surface-border">
          {[
            { label: "ROI", value: provider.roi + "%", color: "text-teal" },
            { label: "Win Rate", value: provider.win_rate + "%", color: "text-primary" },
            { label: "Drawdown", value: provider.drawdown + "%", color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#8897A9] uppercase font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Account select */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">
              Trading Account (Live only)
            </label>
            {liveAccounts.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                You need a live trading account to copy trades.
              </p>
            ) : (
              <select value={selectedAcc} onChange={(e) => { setSelectedAcc(e.target.value); setError(""); }}
                className="input-field">
                <option value="">Select account…</option>
                {liveAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.account_number} — {a.type?.replace("_", " ")} (${parseFloat(a.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">
              Risk Multiplier
            </label>
            <div className="flex gap-2 mb-2">
              {["0.5","1.0","1.5","2.0"].map((v) => (
                <button key={v} onClick={() => setRisk(v)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors ${riskMultiplier === v ? "border-accent bg-accent/10 text-accent" : "border-surface-border text-[#8897A9] hover:border-accent/40"}`}>
                  {v}×
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#8897A9]">
              {riskMultiplier === "0.5" && "Half the provider's lot size — lower risk/reward."}
              {riskMultiplier === "1.0" && "Exact same lot size as the provider."}
              {riskMultiplier === "1.5" && "1.5× the provider's lots — higher exposure."}
              {riskMultiplier === "2.0" && "Double lots — high risk, high reward."}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
          </div>
        )}

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Your account will automatically mirror every new trade this provider opens, proportional to your risk multiplier.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
          <button onClick={handleCopy} disabled={loading || liveAccounts.length === 0}
            className="flex-1 btn-primary flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Starting…" : "Start Copying"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Card ──────────────────────────────────────────────────────────────
function ProviderCard({ provider, isCopying, onCopy, onStop }) {
  const roi      = parseFloat(provider.roi ?? 0);
  const winRate  = parseFloat(provider.win_rate ?? 0);
  const drawdown = parseFloat(provider.drawdown ?? 0);

  const riskLabel =
    drawdown < 10 ? "Low Risk" :
    drawdown < 25 ? "Moderate" : "Aggressive";

  const riskColor =
    drawdown < 10 ? "bg-emerald-100 text-emerald-600" :
    drawdown < 25 ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-500";

  return (
    <div className={`bg-white border rounded-xl p-6 shadow-card hover:shadow-lg transition-all group flex flex-col ${isCopying ? "border-accent ring-1 ring-accent/30" : "border-surface-border hover:border-accent/40"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center font-display font-bold text-accent text-lg flex-shrink-0 group-hover:bg-accent/20 transition-colors">
          {provider.provider_name?.[0] ?? provider.name?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-primary truncate">{provider.name}</div>
          <div className="text-[10px] text-[#8897A9] truncate">{provider.provider_name}</div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${riskColor}`}>
          {riskLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-5 flex-1">
        <div className="flex justify-between items-end">
          <span className="text-xs text-[#8897A9]">ROI (All Time)</span>
          <span className={`text-xl font-display font-bold ${roi >= 0 ? "text-teal" : "text-red-500"}`}>
            {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-1.5">
          <div className="bg-teal h-1.5 rounded-full transition-all" style={{ width: `${Math.min(winRate, 100)}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border text-center">
          <div>
            <div className="text-[10px] text-[#8897A9] uppercase font-bold">Win Rate</div>
            <div className="text-sm font-bold text-primary">{winRate.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8897A9] uppercase font-bold">Drawdown</div>
            <div className="text-sm font-bold text-red-500">{drawdown.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8897A9] uppercase font-bold">Copiers</div>
            <div className="text-sm font-bold text-primary">{parseInt(provider.subscribers ?? 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Action */}
      {isCopying ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-center text-xs font-bold text-accent py-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Currently Copying
          </div>
          <button onClick={() => onStop(provider)}
            className="w-full btn-ghost text-xs py-2 text-red-500 border-red-200 hover:border-red-400 hover:bg-red-50">
            Stop Copying
          </button>
        </div>
      ) : (
        <button onClick={() => onCopy(provider)} className="w-full btn-primary text-xs py-2.5">
          Copy Signal
        </button>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CopyTradingPage() {
  const [providers, setProviders]     = useState([]);
  const [accounts, setAccounts]       = useState([]);
  const [loadingProviders, setLP]     = useState(true);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("ROI");
  const [copyingModal, setCopyingModal] = useState(null); // provider obj
  const [copyingIds, setCopyingIds]   = useState(new Set()); // provider ids being copied
  const [toast, setToast]             = useState(null);
  const [error, setError]             = useState("");

  const fetchAll = useCallback(async () => {
    setLP(true);
    setError("");
    try {
      const [provRes, accRes] = await Promise.all([
        copyTradingService.getProviders(),
        accountService.getAll(),
      ]);
      setProviders(Array.isArray(provRes.data) ? provRes.data : []);
      setAccounts(accRes.accounts ?? []);
    } catch (err) {
      setError(err.message || "Failed to load providers.");
    } finally {
      setLP(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Sort + filter
  const displayed = providers
    .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()) || p.provider_name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "ROI")         return parseFloat(b.roi) - parseFloat(a.roi);
      if (sortBy === "Win Rate")    return parseFloat(b.win_rate) - parseFloat(a.win_rate);
      if (sortBy === "Subscribers") return parseInt(b.subscribers) - parseInt(a.subscribers);
      if (sortBy === "Low Risk")    return parseFloat(a.drawdown) - parseFloat(b.drawdown);
      return 0;
    });

  const handleCopySuccess = (msg) => {
    if (copyingModal) setCopyingIds((s) => new Set([...s, copyingModal.id]));
    setCopyingModal(null);
    setToast({ message: msg, type: "success" });
    fetchAll(); // refresh subscriber counts
  };

  const handleStop = async (provider) => {
    // Optimistic remove
    setCopyingIds((s) => { const n = new Set(s); n.delete(provider.id); return n; });
    setToast({ message: `Stopped copying ${provider.name}.`, type: "success" });
    // Wire to a stop_copy endpoint when you add it to the backend
  };

  const STAT_CARDS = [
    { label: "Active Copiers",     val: providers.reduce((s, p) => s + parseInt(p.subscribers ?? 0), 0).toLocaleString(), icon: Users,     color: "text-accent" },
    { label: "Verified Providers", val: providers.length,                                                                    icon: Shield,    color: "text-blue-500" },
    { label: "Avg Win Rate",       val: providers.length ? (providers.reduce((s, p) => s + parseFloat(p.win_rate ?? 0), 0) / providers.length).toFixed(0) + "%" : "—", icon: Activity, color: "text-emerald-500" },
    { label: "Best ROI",           val: providers.length ? Math.max(...providers.map((p) => parseFloat(p.roi ?? 0))).toFixed(1) + "%" : "—", icon: TrendingUp, color: "text-teal" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-primary">Copy Trading Hub</h1>
          <p className="text-sm text-[#8897A9] mt-1">Mirror professional traders automatically on every new position.</p>
        </div>
        <button onClick={fetchAll} disabled={loadingProviders}
          className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent transition-colors disabled:opacity-40 self-start md:self-auto">
          {loadingProviders ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-white border border-surface-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg bg-surface ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8897A9] leading-tight">{s.label}</span>
            </div>
            <div className="font-display font-bold text-2xl text-primary">
              {loadingProviders ? <div className="h-7 w-16 bg-[#EEF0F5] rounded animate-pulse" /> : s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers…" className="input-field pl-12" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-surface-border rounded-xl p-1 flex-shrink-0">
          {["ROI","Win Rate","Subscribers","Low Risk"].map((f) => (
            <button key={f} onClick={() => setSortBy(f)}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${sortBy === f ? "bg-primary text-white" : "text-[#8897A9] hover:text-primary"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={fetchAll} className="text-xs font-bold text-red-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingProviders
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-surface-border rounded-xl p-6 space-y-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#EEF0F5] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[#EEF0F5] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#EEF0F5] rounded animate-pulse w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-[#EEF0F5] rounded-xl animate-pulse" />
              <div className="h-10 bg-[#EEF0F5] rounded-lg animate-pulse" />
            </div>
          ))
          : displayed.length === 0
          ? (
            <div className="col-span-full py-16 flex flex-col items-center text-center gap-3 text-[#8897A9]">
              <Shield className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-primary">No providers found</p>
              <p className="text-sm">Try adjusting your search or check back later.</p>
            </div>
          )
          : displayed.map((p) => (
            <ProviderCard key={p.id} provider={p}
              isCopying={copyingIds.has(p.id)}
              onCopy={setCopyingModal}
              onStop={handleStop}
            />
          ))
        }
      </div>

      {/* Banner */}
      <div className="bg-primary rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <div className="max-w-md relative z-10">
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Automated Social Trading</h2>
          <p className="text-white/50 text-sm leading-relaxed">Every trade the provider opens is instantly mirrored on your account proportional to your risk multiplier — no manual action needed.</p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
            <div className="text-teal font-bold text-lg mb-1">Instant</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Trade Mirror</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
            <div className="text-accent font-bold text-lg mb-1">0.5–2×</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Risk Control</div>
          </div>
        </div>
      </div>

      {copyingModal && (
        <CopyModal
          provider={copyingModal}
          accounts={accounts}
          onClose={() => setCopyingModal(null)}
          onSuccess={handleCopySuccess}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}