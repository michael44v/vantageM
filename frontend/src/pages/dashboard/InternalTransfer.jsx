import { useState, useEffect, useCallback } from "react";
import { ArrowRightLeft, ArrowRight, AlertCircle, Loader2, CheckCircle, RefreshCw, Gamepad2, Plus } from "lucide-react";
import { accountService } from "../../services/api";

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in-up text-white ${type === "success" ? "bg-primary" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-[#EEF0F5] rounded-lg ${className}`} />;
}

const DEMO_PRESETS = [500, 1000, 5000, 10000];

export default function InternalTransfer() {
  const [accounts, setAccounts]       = useState([]);
  const [walletBal, setWalletBal]     = useState(null);
  const [loadingAccs, setLoadingAccs] = useState(true);
  const [from, setFrom]               = useState("wallet");
  const [to, setTo]                   = useState("");
  const [amount, setAmount]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [fieldErr, setFieldErr]       = useState({});
  const [toast, setToast]             = useState(null);

  // Demo top-up state
  const [demoAcc, setDemoAcc]         = useState("");
  const [demoAmount, setDemoAmount]   = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoErr, setDemoErr]         = useState("");

  const fetchData = useCallback(async () => {
    setLoadingAccs(true);
    try {
      const res = await accountService.getAll();
      setAccounts(res.accounts ?? []);
      setWalletBal(res.wallet_balance ?? null);
    } catch (_) {}
    finally { setLoadingAccs(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Separate live vs demo accounts
  const isDemo = (a) => a.is_demo === "1" || a.is_demo === true || a.is_demo === 1;
  const liveAccounts = accounts.filter((a) => !isDemo(a));
  const demoAccounts = accounts.filter(isDemo);

  // Auto-select first demo account
  useEffect(() => {
    if (demoAccounts.length > 0 && !demoAcc) setDemoAcc(String(demoAccounts[0].id));
  }, [demoAccounts]);

  const sourceBalance = () => {
    if (from === "wallet") return walletBal;
    const acc = liveAccounts.find((a) => String(a.id) === String(from));
    return acc ? parseFloat(acc.balance) : null;
  };

  // ── Live transfer options (NO demo accounts) ────────────────────────────────
  const fromOptions = [
    { id: "wallet", label: `Main Wallet${walletBal !== null ? ` — $${parseFloat(walletBal).toFixed(2)}` : ""}` },
    ...liveAccounts.map((a) => ({
      id:    String(a.id),
      label: `MT4 #${a.account_number} — Live — $${parseFloat(a.balance).toFixed(2)}`,
    })),
  ];

  const toOptions = [
    ...(from !== "wallet"
      ? [{ id: "wallet", label: `Main Wallet${walletBal !== null ? ` — $${parseFloat(walletBal).toFixed(2)}` : ""}` }]
      : []),
    ...liveAccounts
      .filter((a) => String(a.id) !== String(from))
      .map((a) => ({
        id:    String(a.id),
        label: `MT4 #${a.account_number} — Live — $${parseFloat(a.balance).toFixed(2)}`,
      })),
  ];

  useEffect(() => { if (to === from) setTo(""); }, [from]);

  // ── Live transfer validation ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    const val = parseFloat(amount);
    if (!to)                   errs.to     = "Select a destination.";
    if (!amount || isNaN(val)) errs.amount = "Enter an amount.";
    else if (val <= 0)         errs.amount = "Amount must be greater than zero.";
    else {
      const bal = sourceBalance();
      if (bal !== null && val > bal) errs.amount = `Insufficient balance ($${bal.toFixed(2)}).`;
    }
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const handleTransfer = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await accountService.internalTransfer({ from, to, amount: parseFloat(amount), accounts });
      setToast({ message: `$${parseFloat(amount).toLocaleString()} transferred successfully!`, type: "success" });
      setAmount(""); setTo(""); setFieldErr({});
      fetchData();
    } catch (err) {
      setToast({ message: err.message || "Transfer failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Demo top-up ─────────────────────────────────────────────────────────────
  const handleDemoTopUp = async () => {
    const val = parseFloat(demoAmount);
    if (!demoAcc)           { setDemoErr("Select a demo account."); return; }
    if (!demoAmount || isNaN(val) || val <= 0) { setDemoErr("Enter a valid amount."); return; }
    if (val > 1000000)      { setDemoErr("Maximum demo top-up is $1,000,000."); return; }
    setDemoErr("");
    setDemoLoading(true);
    try {
      // Directly credit demo account balance via internal_transfer from wallet
      // Since demo funds are virtual, we call a dedicated endpoint or simulate:
      // Option A (if you add handle_demo_topup to PHP):
      // await req("demo_topup", { method: "POST", body: { account_id: demoAcc, amount: val } });

      // Option B (simulate — replace with real endpoint):
    await accountService.demoTopUp(parseInt(demoAcc, 10), val);
      setToast({ message: `Demo account topped up with $${val.toLocaleString()}!`, type: "success" });

      setDemoAmount("");
      fetchData();
    } catch (err) {
      setToast({ message: err.message || "Top-up failed.", type: "error" });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-primary">Internal Transfer</h1>
          <p className="text-sm text-[#8897A9] mt-1">Move funds between your wallet and live trading accounts.</p>
        </div>
        <button onClick={fetchData} disabled={loadingAccs}
          className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent transition-colors disabled:opacity-40">
          {loadingAccs ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Live Transfer Card ──────────────────────────────────────────────── */}
      <div className="bg-white border border-surface-border rounded-xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRightLeft className="w-4 h-4 text-accent" />
          <h2 className="font-display font-bold text-lg text-primary">Live Account Transfer</h2>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">From</label>
            {loadingAccs ? <Skeleton className="h-11 w-full" /> : (
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="input-field">
                {fromOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            )}
          </div>

          <div className="hidden sm:flex absolute left-1/2 top-[52px] -translate-x-1/2 w-8 h-8 bg-surface border border-surface-border rounded-full items-center justify-center z-10">
            <ArrowRightLeft className="w-4 h-4 text-[#8897A9]" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">To</label>
            {loadingAccs ? <Skeleton className="h-11 w-full" /> : (
              <select value={to}
                onChange={(e) => { setTo(e.target.value); setFieldErr((p) => ({ ...p, to: undefined })); }}
                className={`input-field ${fieldErr.to ? "border-red-400" : ""}`}>
                <option value="">Select Destination</option>
                {toOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            )}
            {fieldErr.to && <p className="text-xs text-red-500">{fieldErr.to}</p>}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
            <input type="number" value={amount}
              onChange={(e) => { setAmount(e.target.value); setFieldErr((p) => ({ ...p, amount: undefined })); }}
              placeholder="0.00"
              className={`input-field pl-8 text-lg font-bold ${fieldErr.amount ? "border-red-400" : ""}`} />
          </div>
          {fieldErr.amount
            ? <p className="text-xs text-red-500">{fieldErr.amount}</p>
            : sourceBalance() !== null && (
              <p className="text-xs text-[#8897A9]">
                Available: <span className="font-bold text-primary">${parseFloat(sourceBalance()).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                <button onClick={() => setAmount(String(sourceBalance()))} className="ml-2 text-accent font-bold hover:underline">Max</button>
              </p>
            )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Transfers are instant and irreversible. Ensure no open positions require margin in the source account.
          </p>
        </div>

        <button onClick={handleTransfer} disabled={loading || loadingAccs}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Transferring…</>
            : <>Transfer Funds <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>

      {/* ── Demo Top-Up Card ────────────────────────────────────────────────── */}
      {(loadingAccs || demoAccounts.length > 0) && (
        <div className="bg-white border border-surface-border rounded-xl p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-blue-500" />
              <h2 className="font-display font-bold text-lg text-primary">Demo Account Top-Up</h2>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase rounded-full flex-shrink-0">
              Virtual Funds
            </span>
          </div>
          <p className="text-xs text-[#8897A9] -mt-2">
            Add any amount of virtual funds to practice trading without risk.
          </p>

          {/* Demo account selector */}
          {loadingAccs ? (
            <Skeleton className="h-11 w-full" />
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">Demo Account</label>
              <select value={demoAcc} onChange={(e) => { setDemoAcc(e.target.value); setDemoErr(""); }}
                className="input-field">
                {demoAccounts.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    MT4 #{a.account_number} — ${parseFloat(a.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preset chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">Amount</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {DEMO_PRESETS.map((v) => (
                <button key={v} onClick={() => { setDemoAmount(String(v)); setDemoErr(""); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${parseFloat(demoAmount) === v ? "border-blue-400 bg-blue-50 text-blue-600" : "border-surface-border text-[#8897A9] hover:border-blue-300"}`}>
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
              <input type="number" value={demoAmount}
                onChange={(e) => { setDemoAmount(e.target.value); setDemoErr(""); }}
                placeholder="Enter custom amount…"
                className={`input-field pl-8 font-bold ${demoErr ? "border-red-400" : ""}`} />
            </div>
            {demoErr && <p className="text-xs text-red-500">{demoErr}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Demo funds are virtual and have no real-world value. Use them freely to test strategies.
            </p>
          </div>

          <button onClick={handleDemoTopUp} disabled={demoLoading || loadingAccs}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
            {demoLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding Funds…</>
              : <><Plus className="w-4 h-4" /> Add Virtual Funds</>}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}