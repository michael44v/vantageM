import { useState, useEffect, useCallback } from "react";
import {
  Users, TrendingUp, Shield, Activity, Search,
  Loader2, AlertCircle, CheckCircle, X, RefreshCw,
  Copy, StopCircle, BarChart2, Zap
} from "lucide-react";
import { copyTradingService, accountService } from "../../services/api";

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in-up text-white ${type === "success" ? "bg-primary" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ── Copy Modal ────────────────────────────────────────────────────────────────
function CopyModal({ provider, accounts, onClose, onSuccess }) {
  const [selectedAcc, setSelectedAcc] = useState("");
  const [riskMultiplier, setRisk]     = useState("1.0");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const liveAccounts = accounts.filter(
    (a) => a.is_demo === "0" || a.is_demo === false || a.is_demo === 0
  );

  // Calculate preview: what % of copier balance will be risked per trade
  const selectedAccObj = liveAccounts.find((a) => String(a.id) === String(selectedAcc));
  const providerRoiPct = parseFloat(provider.roi ?? 0);

  const handleCopy = async () => {
    if (!selectedAcc) { setError("Select a trading account."); return; }
    setLoading(true); setError("");
    try {
      await copyTradingService.copyProvider({
        providerId:       provider.id,
        tradingAccountId: parseInt(selectedAcc, 10),
        riskMultiplier:   parseFloat(riskMultiplier),
      });
      onSuccess(provider.id, `Now copying ${provider.name}! Trades mirror automatically at ${riskMultiplier}× risk.`);
    } catch (err) {
      setError(err.message || "Failed to start copying.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#8897A9] hover:text-primary hover:bg-surface transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Provider header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-xl flex-shrink-0">
            {provider.name?.[0]}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-primary">{provider.name}</h2>
            <p className="text-xs text-[#8897A9]">{provider.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5 p-4 bg-surface rounded-xl border border-surface-border">
          {[
            { label: "ROI", value: `${parseFloat(provider.roi ?? 0).toFixed(1)}%`, color: "text-teal" },
            { label: "Win Rate", value: `${parseFloat(provider.win_rate ?? 0).toFixed(0)}%`, color: "text-primary" },
            { label: "Drawdown", value: `${parseFloat(provider.drawdown ?? 0).toFixed(0)}%`, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#8897A9] uppercase font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> How Risk % Copying Works
          </p>
          <p className="text-xs text-blue-600 leading-relaxed">
            When <strong>{provider.name}</strong> opens a trade risking X% of their account,
            the same X% of <em>your</em> account balance is automatically risked — scaled by your multiplier.
            Your lot sizes are calculated proportionally so you always risk the right amount.
          </p>
        </div>

        {/* Account select */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Trading Account (Live only)</label>
            {liveAccounts.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                You need a live trading account to copy trades.
              </p>
            ) : (
              <select value={selectedAcc} onChange={(e) => { setSelectedAcc(e.target.value); setError(""); }} className="input-field">
                <option value="">Select account…</option>
                {liveAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.account_number} — {a.type?.replace(/_/g," ")} (${parseFloat(a.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Risk multiplier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Risk Multiplier</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {["0.5","1.0","1.5","2.0"].map((v) => (
                <button key={v} onClick={() => setRisk(v)}
                  className={`py-2 rounded-lg border text-xs font-bold transition-colors ${riskMultiplier === v ? "border-accent bg-accent/10 text-accent" : "border-surface-border text-[#8897A9] hover:border-accent/40"}`}>
                  {v}×
                </button>
              ))}
            </div>
            <div className="text-[10px] text-[#8897A9] bg-surface rounded-lg px-3 py-2 border border-surface-border">
              {riskMultiplier === "0.5" && "You risk half the % the provider risks — more conservative."}
              {riskMultiplier === "1.0" && "You mirror the exact same risk % as the provider."}
              {riskMultiplier === "1.5" && "You risk 1.5× the provider's % — higher exposure."}
              {riskMultiplier === "2.0" && "You risk double the provider's % — aggressive. High risk."}
            </div>
          </div>

          {/* Live preview */}
          {selectedAccObj && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs space-y-1">
              <p className="font-bold text-emerald-700">Position Size Preview</p>
              <p className="text-emerald-600">
                Your account: <strong>${parseFloat(selectedAccObj.balance).toFixed(2)}</strong>
                &nbsp;·&nbsp;Risk mult: <strong>{riskMultiplier}×</strong>
              </p>
              <p className="text-emerald-600">
                If provider risks 2% → you risk:{" "}
                <strong>${(parseFloat(selectedAccObj.balance) * 0.02 * parseFloat(riskMultiplier)).toFixed(2)}</strong>
                &nbsp;({(2 * parseFloat(riskMultiplier)).toFixed(1)}% of your balance)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
          </div>
        )}

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

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, isCopying, copyRelationship, onCopy, onStop }) {
  const roi      = parseFloat(provider.roi ?? 0);
  const winRate  = parseFloat(provider.win_rate ?? 0);
  const drawdown = parseFloat(provider.drawdown ?? 0);
  const trades   = parseInt(provider.total_trades ?? 0);

  const riskLabel = drawdown < 10 ? "Low Risk" : drawdown < 25 ? "Moderate" : "Aggressive";
  const riskColor = drawdown < 10 ? "bg-emerald-100 text-emerald-600"
    : drawdown < 25 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-500";

  return (
    <div className={`bg-white border rounded-xl p-6 shadow-card hover:shadow-lg transition-all flex flex-col ${isCopying ? "border-accent ring-1 ring-accent/20" : "border-surface-border hover:border-accent/40"}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-lg flex-shrink-0">
          {provider.name?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-primary truncate text-sm">{provider.name}</div>
          <div className="text-[10px] text-[#8897A9] truncate">{provider.provider_name}</div>
          {provider.provider_country && (
            <div className="text-[9px] text-[#8897A9]">{provider.provider_country}</div>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${riskColor}`}>
          {riskLabel}
        </span>
      </div>

      {/* ROI */}
      <div className="flex justify-between items-end mb-3">
        <span className="text-xs text-[#8897A9]">ROI (All Time)</span>
        <span className={`text-2xl font-display font-bold ${roi >= 0 ? "text-teal" : "text-red-500"}`}>
          {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
        </span>
      </div>

      {/* Win rate bar */}
      <div className="w-full bg-surface rounded-full h-1.5 mb-3">
        <div className="bg-teal h-1.5 rounded-full" style={{ width: `${Math.min(winRate, 100)}%` }} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-surface-border mb-4 text-center">
        <div>
          <div className="text-[9px] text-[#8897A9] uppercase font-bold">Win Rate</div>
          <div className="text-sm font-bold text-primary">{winRate.toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-[9px] text-[#8897A9] uppercase font-bold">Drawdown</div>
          <div className="text-sm font-bold text-red-500">{drawdown.toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-[9px] text-[#8897A9] uppercase font-bold">Copiers</div>
          <div className="text-sm font-bold text-primary">{parseInt(provider.subscribers ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Trade count */}
      {trades > 0 && (
        <p className="text-[10px] text-[#8897A9] mb-3 flex items-center gap-1">
          <BarChart2 className="w-3 h-3" /> {trades} verified trade{trades !== 1 ? "s" : ""} on record
        </p>
      )}

      {/* Copy status / action */}
      {isCopying ? (
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between text-xs bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-accent font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Copying Active
            </div>
            {copyRelationship && (
              <span className="text-[10px] text-[#8897A9]">
                {copyRelationship.risk_multiplier}× risk
              </span>
            )}
          </div>
          {copyRelationship && (
            <div className="text-[10px] text-[#8897A9] px-1">
              Account #{copyRelationship.copy_account_number}
            </div>
          )}
          <button onClick={() => onStop(provider)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-400 rounded-xl transition-colors">
            <StopCircle className="w-3.5 h-3.5" /> Stop Copying
          </button>
        </div>
      ) : (
        <button onClick={() => onCopy(provider)}
          className="w-full btn-primary text-xs py-2.5 mt-auto flex items-center justify-center gap-2">
          <Copy className="w-3.5 h-3.5" /> Copy Signal
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CopyTradingPage() {
  const [providers, setProviders]       = useState([]);
  const [accounts, setAccounts]         = useState([]);
  const [myCopies, setMyCopies]         = useState([]); // active copy relationships
  const [loadingProviders, setLP]       = useState(true);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("ROI");
  const [copyingModal, setCopyingModal] = useState(null);
  const [toast, setToast]               = useState(null);
  const [error, setError]               = useState("");

  const fetchAll = useCallback(async () => {
    setLP(true); setError("");
    try {
      const [provRes, accRes, copiesRes] = await Promise.all([
        copyTradingService.getProviders(),
        accountService.getAll(),
        copyTradingService.getMyCopies(),
      ]);
      setProviders(Array.isArray(provRes.data)    ? provRes.data    : []);
      setAccounts(accRes.accounts                 ?? []);
      setMyCopies(Array.isArray(copiesRes.data)   ? copiesRes.data  : []);
    } catch (err) {
      setError(err.message || "Failed to load providers.");
    } finally {
      setLP(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build a Set of provider_ids that user is actively copying
  const activeCopyProviderIds = new Set(
    myCopies.filter((c) => c.status === "active").map((c) => parseInt(c.provider_id))
  );

  const getCopyRelationship = (providerId) =>
    myCopies.find((c) => parseInt(c.provider_id) === providerId && c.status === "active");

  const displayed = providers
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.provider_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "ROI")         return parseFloat(b.roi)        - parseFloat(a.roi);
      if (sortBy === "Win Rate")    return parseFloat(b.win_rate)   - parseFloat(a.win_rate);
      if (sortBy === "Subscribers") return parseInt(b.subscribers)  - parseInt(a.subscribers);
      if (sortBy === "Low Risk")    return parseFloat(a.drawdown)   - parseFloat(b.drawdown);
      return 0;
    });

  const handleCopySuccess = (providerId, msg) => {
    setCopyingModal(null);
    setToast({ message: msg, type: "success" });
    fetchAll();
  };

  const handleStop = async (provider) => {
    try {
      await copyTradingService.stopCopy(provider.id);
      setToast({ message: `Stopped copying ${provider.name}.`, type: "success" });
      fetchAll();
    } catch (err) {
      setToast({ message: err.message || "Failed to stop.", type: "error" });
    }
  };

  const STAT_CARDS = [
    { label: "Active Copiers",     val: providers.reduce((s, p) => s + parseInt(p.subscribers ?? 0), 0).toLocaleString(), icon: Users,     color: "text-accent" },
    { label: "Verified Providers", val: providers.length,                icon: Shield,    color: "text-blue-500" },
    { label: "You're Copying",     val: activeCopyProviderIds.size,      icon: Copy,      color: "text-teal" },
    { label: "Best ROI",
      val: providers.length
        ? Math.max(...providers.map((p) => parseFloat(p.roi ?? 0))).toFixed(1) + "%"
        : "—",
      icon: TrendingUp, color: "text-emerald-500"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-primary">Copy Trading Hub</h1>
          <p className="text-sm text-[#8897A9] mt-1">
            Mirror professionals automatically. Risk is proportional to your account size.
          </p>
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8897A9]">{s.label}</span>
            </div>
            <div className="font-display font-bold text-2xl text-primary">
              {loadingProviders ? <div className="h-7 w-16 bg-[#EEF0F5] rounded animate-pulse" /> : s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Active copies summary */}
      {myCopies.filter((c) => c.status === "active").length > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" /> Your Active Copy Relationships
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myCopies.filter((c) => c.status === "active").map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-surface-border text-xs">
                <div>
                  <div className="font-bold text-primary">{c.signal_name}</div>
                  <div className="text-[#8897A9]">via #{c.copy_account_number} · {c.risk_multiplier}× risk</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers…" className="input-field pl-12" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-surface-border rounded-xl p-1 flex-shrink-0 flex-wrap">
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

      {/* Provider grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingProviders
          ? Array.from({ length: 5 }).map((_, i) => (
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
              <p className="text-sm">Try adjusting your search.</p>
            </div>
          )
          : displayed.map((p) => {
            const pid = parseInt(p.id);
            return (
              <ProviderCard key={p.id} provider={p}
                isCopying={activeCopyProviderIds.has(pid)}
                copyRelationship={getCopyRelationship(pid)}
                onCopy={setCopyingModal}
                onStop={handleStop}
              />
            );
          })
        }
      </div>

      {/* Info banner */}
      <div className="bg-primary rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <div className="max-w-md relative z-10">
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Proportional Risk Copying</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Unlike fixed lot copying, our system calculates the exact percentage of capital the provider risked
            and applies that same percentage to your account — so a $500 and $50,000 account both copy safely.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto flex-wrap">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
            <div className="text-teal font-bold text-lg mb-1">% Based</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Risk Method</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
            <div className="text-accent font-bold text-lg mb-1">0.5–2×</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Multiplier</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
            <div className="text-white font-bold text-lg mb-1">Instant</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Execution</div>
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