import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Search,
  ArrowLeft, Settings, Maximize2, RefreshCcw,
  Globe, Loader2, AlertCircle, CheckCircle, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tradingService } from "../services/api";

// ── Live price simulation (replace with real WS feed when available) ──────────
const BASE_PRICES = {
  "EUR/USD": 1.08542, "GBP/USD": 1.26431, "USD/JPY": 151.423,
  "XAU/USD": 2345.10, "BTC/USD": 68432.50, "ETH/USD": 3421.15,
  "USD/CAD": 1.36120, "AUD/USD": 0.65340, "USD/CHF": 0.90210,
};

function useLivePrices() {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(Object.entries(BASE_PRICES).map(([k, v]) => [k, { bid: v, ask: +(v + 0.0002).toFixed(5), prev: v }]))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([sym, p]) => {
            const move = (Math.random() - 0.5) * 0.0008;
            const bid  = +(p.bid + move).toFixed(5);
            const ask  = +(bid + 0.00020).toFixed(5);
            return [sym, { bid, ask, prev: p.bid }];
          })
        )
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return prices;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-fade-in-up ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  );
}

// ── Confirm Trade Modal ───────────────────────────────────────────────────────
function ConfirmModal({ side, symbol, lots, price, account, stopLoss, takeProfit, onConfirm, onClose, loading }) {
  if (!account) return null;
  const margin = ((parseFloat(lots) || 0) * 100000 * price) / (parseInt(account.leverage) || 500);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-7 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-white text-lg">Confirm {side.toUpperCase()}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3 mb-6 text-sm">
          {[
            ["Symbol",   symbol],
            ["Side",     <span className={side === "buy" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{side.toUpperCase()}</span>],
            ["Lots",     lots],
            ["Price",    side === "buy" ? price.toFixed(5) : price.toFixed(5)],
            ["Account",  `#${account.account_number}`],
            ["Margin",   `$${margin.toFixed(2)}`],
            ...(stopLoss   ? [["Stop Loss",   stopLoss]]   : []),
            ...(takeProfit ? [["Take Profit", takeProfit]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm font-bold transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors ${side === "buy" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Executing…" : `Place ${side.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Terminal ─────────────────────────────────────────────────────────────
export default function TerminalPage() {
  const { user } = useAuth();
  const prices   = useLivePrices();

  // Account selector state
  const [accounts, setAccounts]         = useState([]);
  const [loadingAccounts, setLoadingAcc] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null); // full account obj

  // Terminal state
  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [orderType, setOrderType]       = useState("market");
  const [lots, setLots]                 = useState("0.01");
  const [stopLoss, setStopLoss]         = useState("");
  const [takeProfit, setTakeProfit]     = useState("");
  const [activeTab, setActiveTab]       = useState("positions");

  // Positions
  const [positions, setPositions]       = useState([]);
  const [loadingPos, setLoadingPos]     = useState(false);
  const pollRef                         = useRef(null);

  // Trade confirm modal
  const [confirmSide, setConfirmSide]   = useState(null); // "buy" | "sell"
  const [tradeLoading, setTradeLoading] = useState(false);
  const [closingId, setClosingId]       = useState(null);
  const [toast, setToast]               = useState(null);
  const [searchQ, setSearchQ]           = useState("");

  // ── Fetch accounts on mount ────────────────────────────────────────────────
  useEffect(() => {
    tradingService.getUserAccounts()
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoadingAcc(false));
  }, []);

  // ── Fetch + poll positions ─────────────────────────────────────────────────
  const fetchPositions = useCallback(async (silent = false) => {
    if (!selectedAccount) return;
    if (!silent) setLoadingPos(true);
    try {
      const res = await tradingService.getPositions(selectedAccount.id);
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
    finally { setLoadingPos(false); }
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchPositions();
    pollRef.current = setInterval(() => fetchPositions(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchPositions, selectedAccount]);

  // ── Execute trade ──────────────────────────────────────────────────────────
  const handleTrade = async () => {
    if (!selectedAccount || !confirmSide) return;
    setTradeLoading(true);
    const px = confirmSide === "buy" ? prices[activeSymbol]?.ask : prices[activeSymbol]?.bid;
    try {
      await tradingService.execute({
        tradingAccountId: selectedAccount.id,
        symbol:           activeSymbol,
        type:             confirmSide,
        lots:             parseFloat(lots),
        price:            px ?? parseFloat(BASE_PRICES[activeSymbol]),
        stopLoss:         stopLoss   || undefined,
        takeProfit:       takeProfit || undefined,
      });
      setToast({ message: `${confirmSide.toUpperCase()} ${lots} lots ${activeSymbol} executed!`, type: "success" });
      setConfirmSide(null);
      fetchPositions(true);
      // Update local balance
      const margin = (parseFloat(lots) * 100000 * px) / selectedAccount.leverage;
      setSelectedAccount((a) => ({ ...a, balance: (parseFloat(a.balance) - margin).toFixed(2) }));
    } catch (err) {
      setToast({ message: err.message || "Trade failed.", type: "error" });
    } finally {
      setTradeLoading(false);
    }
  };

  // ── Close position ─────────────────────────────────────────────────────────
  const handleClose = async (positionId) => {
    setClosingId(positionId);
    const pos = positions.find(p => p.id === positionId);
    try {
      const res = await tradingService.closePosition(positionId);
      const { pnl } = res.data;

      // Calculate margin to return: (Lots * 100,000 * EntryPrice) / Leverage
      const margin = (parseFloat(pos.lots) * 100000 * parseFloat(pos.entry_price)) / selectedAccount.leverage;

      setPositions((prev) => prev.filter((p) => p.id !== positionId));
      setToast({
        message: `Position closed. P&L: ${pnl >= 0 ? "+" : ""}$${parseFloat(pnl).toFixed(2)}`,
        type: pnl >= 0 ? "success" : "error",
      });
      setSelectedAccount((a) => ({
        ...a,
        balance: (parseFloat(a.balance) + margin + parseFloat(pnl)).toFixed(2)
      }));
    } catch (err) {
      setToast({ message: err.message || "Failed to close.", type: "error" });
    } finally {
      setClosingId(null);
    }
  };

  const curPrice   = prices[activeSymbol];
  const isUp       = curPrice ? curPrice.bid >= curPrice.prev : true;
  const filteredSymbols = Object.entries(prices).filter(([name]) =>
    name.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Account selector screen ────────────────────────────────────────────────
  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary mb-2">Select Trading Account</h1>
          <p className="text-[#8897A9] text-sm mb-8">Choose an account to enter the Vantage Web Terminal.</p>

          {loadingAccounts ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : accounts.length === 0 ? (
            <div className="text-sm text-[#8897A9] py-6">
              No active accounts found.{" "}
              <Link to="/dashboard/accounts" className="text-accent font-bold hover:underline">Open one →</Link>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              {accounts.map((acc) => {
                const isDemo = acc.is_demo === "1" || acc.is_demo === 1 || acc.is_demo === true;
                return (
                  <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border hover:border-accent hover:bg-accent/5 transition-all">
                    <div>
                      <div className="font-bold text-primary">#{acc.account_number}</div>
                      <div className="text-[10px] uppercase font-bold text-[#8897A9]">
                        {acc.type?.replace(/_/g, " ")} ·{" "}
                        <span className={isDemo ? "text-blue-500" : "text-emerald-500"}>
                          {isDemo ? "Demo" : "Live"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ${parseFloat(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-accent font-bold">SELECT →</div>
                    </div>
                  </button>
                );
              })}
              <Link to="/dashboard/accounts" className="block text-xs font-bold text-accent pt-2 text-center hover:underline">
                + Open New Account
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-surface-border">
            <Link to="/dashboard" className="text-xs font-bold text-[#8897A9] hover:text-primary flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDemo = selectedAccount.is_demo === "1" || selectedAccount.is_demo === 1;

  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden font-sans text-white">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-primary flex-shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-sm hidden md:block">Vantage Terminal</span>
          </Link>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-5 text-xs">
            <div>
              <div className="text-white/40 text-[10px] font-bold uppercase">Account</div>
              <div className="font-bold">#{selectedAccount.account_number}</div>
            </div>
            <div>
              <div className="text-white/40 text-[10px] font-bold uppercase">Balance</div>
              <div className="font-bold text-accent">
                ${parseFloat(selectedAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-[10px] font-bold uppercase">Leverage</div>
              <div className="font-bold">1:{selectedAccount.leverage}</div>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full uppercase">Demo</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchPositions(true)} className="p-2 text-white/40 hover:text-white transition-colors" title="Refresh">
            <RefreshCcw className={`w-4 h-4 ${loadingPos ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setSelectedAccount(null)}
            className="border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs py-1.5 px-3 rounded-lg transition-colors">
            Exit
          </button>
        </div>
      </header>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Market Watch */}
        <aside className="w-64 border-r border-white/10 flex flex-col flex-shrink-0 bg-[#0e1525]">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto text-[11px]">
            <div className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Market Watch</div>
            {filteredSymbols.map(([name, p]) => {
              const up = p.bid >= p.prev;
              const active = activeSymbol === name;
              return (
                <button key={name} onClick={() => setActiveSymbol(name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors ${active ? "bg-accent/10 border-l-2 border-l-accent" : ""}`}>
                  <span className="font-bold">{name}</span>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>{p.bid.toFixed(5)}</div>
                    <div className={`text-[9px] ${up ? "text-emerald-400/60" : "text-red-400/60"}`}>
                      {up ? "▲" : "▼"} {Math.abs(p.bid - p.prev).toFixed(5)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart placeholder */}
          <div className="flex-1 bg-[#131722] relative border-b border-white/10 flex items-center justify-center">
            <div className="text-white/10 text-center">
              <Globe className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <div className="font-display font-bold text-lg tracking-widest">{activeSymbol}</div>
              <div className="text-xs mt-1 opacity-50">Connect TradingView widget here</div>
            </div>
            {/* Live price overlay */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-5">
              <span className="font-bold text-sm">{activeSymbol}</span>
              <span className={`font-mono font-bold text-base ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {curPrice?.bid.toFixed(5)}
              </span>
              <span className={`text-xs font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "▲" : "▼"} {curPrice ? Math.abs(curPrice.bid - curPrice.prev).toFixed(5) : "—"}
              </span>
            </div>
          </div>

          {/* Positions panel */}
          <div className="h-56 bg-[#0e1525] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 border-b border-white/10 h-10 flex-shrink-0">
              <div className="flex items-center gap-5 h-full text-xs">
                {[["positions", `Open (${positions.length})`], ["history", "History"]].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`font-bold h-full border-b-2 transition-colors ${activeTab === key ? "text-accent border-accent" : "text-white/40 border-transparent hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => fetchPositions(true)} className="text-white/30 hover:text-white p-1">
                <RefreshCcw className={`w-3 h-3 ${loadingPos ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === "positions" && (
                <table className="w-full text-left text-[11px] min-w-[600px]">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      {["#", "Symbol", "Type", "Lots", "Entry", "Current", "P&L", ""].map((h) => (
                        <th key={h} className={`px-4 py-2 text-white/30 font-bold ${h === "" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingPos && positions.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-6 text-center text-white/30">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading positions…
                      </td></tr>
                    ) : positions.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-6 text-center text-white/30">No open positions.</td></tr>
                    ) : positions.map((p) => {
                      const pnl = parseFloat(p.pnl ?? 0);
                      return (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white/40">{p.id}</td>
                          <td className="px-4 py-3 font-bold">{p.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={p.type === "long" ? "text-emerald-400" : "text-red-400"}>
                              {p.type === "long" ? "BUY" : "SELL"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{p.lots}</td>
                          <td className="px-4 py-3 font-mono">{parseFloat(p.entry_price).toFixed(5)}</td>
                          <td className="px-4 py-3 font-mono">{parseFloat(p.current_price).toFixed(5)}</td>
                          <td className={`px-4 py-3 font-mono font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleClose(p.id)} disabled={closingId === p.id}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/30 text-red-400 font-bold transition-colors disabled:opacity-40 flex items-center gap-1 ml-auto">
                              {closingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {activeTab === "history" && (
                <div className="px-4 py-6 text-center text-white/30 text-xs">
                  Trade history coming soon.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <aside className="w-72 border-l border-white/10 flex flex-col flex-shrink-0 bg-[#0e1525] overflow-y-auto">
          <div className="p-5 space-y-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Execute Order</div>
              <div className="flex bg-white/5 rounded-xl p-1">
                {["market","limit"].map((t) => (
                  <button key={t} onClick={() => setOrderType(t)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${orderType === t ? "bg-accent text-primary" : "text-white/50 hover:text-white"}`}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Symbol display */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <span className="font-bold text-sm">{activeSymbol}</span>
              <div className="text-right">
                <div className={`font-mono text-sm font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {curPrice?.bid.toFixed(5) ?? "—"}
                </div>
                <div className="text-[10px] text-white/30">ASK {curPrice?.ask.toFixed(5) ?? "—"}</div>
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30">Volume (Lots)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {["0.01","0.10","0.50","1.00"].map((v) => (
                  <button key={v} onClick={() => setLots(v)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${lots === v ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/5 text-white/60 hover:border-accent/50"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <input type="number" value={lots} onChange={(e) => setLots(e.target.value)} step="0.01" min="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-accent" />
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Stop Loss</label>
                <input type="text" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Take Profit</label>
                <input type="text" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-400" />
              </div>
            </div>

            {/* Margin info */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/40">Required Margin</span>
                <span className="font-bold">
                  ${(((parseFloat(lots) || 0) * 100000 * (curPrice?.ask ?? 1)) / (parseInt(selectedAccount.leverage) || 500)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Spread</span>
                <span className="font-bold text-accent">
                  {curPrice ? ((curPrice.ask - curPrice.bid) * 10000).toFixed(1) : "—"} pips
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Account Balance</span>
                <span className="font-bold">${parseFloat(selectedAccount.balance).toFixed(2)}</span>
              </div>
            </div>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmSide("sell")}
                className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 active:scale-95 transition-all rounded-xl py-4 group">
                <TrendingDown className="w-5 h-5 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold">SELL</span>
                <span className="text-[10px] opacity-60">{curPrice?.bid.toFixed(5) ?? "—"}</span>
              </button>
              <button onClick={() => setConfirmSide("buy")}
                className="flex flex-col items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-xl py-4 group">
                <TrendingUp className="w-5 h-5 mb-1 group-hover:translate-y-[-2px] transition-transform" />
                <span className="text-xs font-bold">BUY</span>
                <span className="text-[10px] opacity-60">{curPrice?.ask.toFixed(5) ?? "—"}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirm modal */}
      {confirmSide && (
        <ConfirmModal
          side={confirmSide}
          symbol={activeSymbol}
          lots={lots}
          price={confirmSide === "buy" ? (curPrice?.ask ?? 1) : (curPrice?.bid ?? 1)}
          account={selectedAccount}
          stopLoss={stopLoss || null}
          takeProfit={takeProfit || null}
          onConfirm={handleTrade}
          onClose={() => setConfirmSide(null)}
          loading={tradeLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
