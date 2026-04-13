import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Search, ArrowLeft,
  RefreshCcw, Loader2, AlertCircle, CheckCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tradingService } from "../services/api";
import { Copy, Zap } from "lucide-react"; 

// ── Simulated live prices ─────────────────────────────────────────────────────
const BASE_PRICES = {
  "EUR/USD": 1.08542, "GBP/USD": 1.26431, "USD/JPY": 151.423,
  "XAU/USD": 2345.10, "BTC/USD": 68432.50, "ETH/USD": 3421.15,
  "USD/CAD": 1.36120, "AUD/USD": 0.65340, "USD/CHF": 0.90210,
};

// Map our symbols to TradingView symbols
const TV_SYMBOL_MAP = {
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "USD/JPY": "FX:USDJPY",
  "XAU/USD": "TVC:GOLD",
  "BTC/USD": "BINANCE:BTCUSDT",
  "ETH/USD": "BINANCE:ETHUSDT",
  "USD/CAD": "FX:USDCAD",
  "AUD/USD": "FX:AUDUSD",
  "USD/CHF": "FX:USDCHF",
};

// ── Live price hook ───────────────────────────────────────────────────────────
function useLivePrices() {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(
      Object.entries(BASE_PRICES).map(([k, v]) => [
        k,
        { bid: v, ask: +(v + 0.0002).toFixed(5), prev: v },
      ])
    )
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([sym, p]) => {
            const move = (Math.random() - 0.5) * 0.0008;
            const bid  = +(p.bid + move).toFixed(5);
            const ask  = +(bid + 0.0002).toFixed(5);
            return [sym, { bid, ask, prev: p.bid }];
          })
        )
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return prices;
}

// ── TradingView Chart ─────────────────────────────────────────────────────────
const TradingViewChart = memo(function TradingViewChart({ symbol }) {
  const containerRef = useRef(null);
  const tvSymbol     = TV_SYMBOL_MAP[symbol] ?? "FX:EURUSD";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Tear down any previous widget
    el.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className    = "tradingview-widget-container";
    wrapper.style.cssText = "width:100%;height:100%;";

    const inner = document.createElement("div");
    inner.className      = "tradingview-widget-container__widget";
    inner.style.cssText  = "width:100%;height:100%;";

    const script = document.createElement("script");
    script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type  = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:            true,
      symbol:              tvSymbol,
      interval:            "15",
      timezone:            "Etc/UTC",
      theme:               "dark",
      style:               "1",
      locale:              "en",
      allow_symbol_change: false,
      enable_publishing:   false,
      hide_side_toolbar:   true,
      hide_top_toolbar:    false,
      hide_legend:         false,
      save_image:          true,
      calendar:            false,
      hide_volume:         false,
      withdateranges:      false,
      backgroundColor:     "#0d111c",
      gridColor:           "rgba(255,255,255,0.04)",
    });

    wrapper.appendChild(inner);
    wrapper.appendChild(script);
    el.appendChild(wrapper);

    return () => { el.innerHTML = ""; };
  }, [tvSymbol]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium max-w-xs
        ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
      style={{ animation: "fadeInUp 0.2s ease" }}
    >
      {type === "success"
        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="break-words">{message}</span>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  side, symbol, lots, price, account,
  stopLoss, takeProfit, onConfirm, onClose, loading,
}) {
  if (!account) return null;

  const parsedLots     = parseFloat(lots)                        || 0;
  const parsedPrice    = parseFloat(price)                       || 0;
  const parsedLeverage = parseInt(account.leverage, 10)          || 500;
  const margin         = (parsedLots * 100000 * parsedPrice) / parsedLeverage;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">Confirm {side.toUpperCase()}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 mb-5 text-sm">
          {[
            ["Symbol",      symbol],
            ["Direction",   (
              <span className={side === "buy" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {side.toUpperCase()}
              </span>
            )],
            ["Lots",        lots],
            ["Price",       parsedPrice.toFixed(5)],
            ["Margin",      `$${margin.toFixed(2)}`],
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
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50
              ${side === "buy" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Executing…" : `Place ${side.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trade History Panel ───────────────────────────────────────────────────────
function TradeHistory({ accountId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await tradingService.getTradeHistory(accountId, p);
      setHistory(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta ?? null);
      setPage(p);
    } catch (_) {}
    finally { setLoading(false); }
  }, [accountId]);

  useEffect(() => { load(1); }, [load]);

  const totalPnl = history.reduce((s, t) => s + parseFloat(t.pnl ?? 0), 0);

  if (loading && history.length === 0) return (
    <div className="flex items-center justify-center py-8 text-white/30">
      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading history…
    </div>
  );

  if (!loading && history.length === 0) return (
    <div className="py-8 text-center text-white/30 text-xs">No closed trades yet.</div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/3 border-b border-white/5 text-[11px]">
        <span className="text-white/40">{meta?.total ?? history.length} trades total</span>
        <span className={`font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          Page P&L: {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-[11px] min-w-[640px]">
          <thead className="bg-white/5 sticky top-0">
            <tr>
             {["#","Symbol","Type","Lots","Entry","Current","P&L","Source",""].map((h) => (
  <th key={h} className={`px-3 py-2 text-white/25 font-bold text-[11px] ${h === "" ? "text-right" : ""}`}>{h}</th>
))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((t) => {
              const pnl = parseFloat(t.pnl ?? 0);
              return (
                <tr key={t.id} className="hover:bg-white/5">
                  <td className="px-3 py-2.5 text-white/30">{t.id}</td>
                  <td className="px-3 py-2.5 font-bold">{t.symbol}</td>
                  <td className="px-3 py-2.5">
                    <span className={t.type === "long" ? "text-emerald-400" : "text-red-400"}>
                      {t.type === "long" ? "BUY" : "SELL"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{t.lots}</td>
                  <td className="px-3 py-2.5 font-mono">{parseFloat(t.entry_price).toFixed(5)}</td>
                  <td className="px-3 py-2.5 font-mono">{parseFloat(t.close_price).toFixed(5)}</td>
                  <td className={`px-3 py-2.5 font-mono font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-white/40 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-white/40 whitespace-nowrap">
                    {t.closed_at ? new Date(t.closed_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-white/10 text-xs">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors font-bold"
          >
            ← Prev
          </button>
          <span className="text-white/40">Page {page} of {meta.last_page}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= meta.last_page || loading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors font-bold"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Terminal ─────────────────────────────────────────────────────────────
export default function TerminalPage() {
  const prices = useLivePrices();

  const [accounts, setAccounts]               = useState([]);
  const [loadingAccounts, setLoadingAcc]       = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [orderType, setOrderType]       = useState("market");
  const [lots, setLots]                 = useState("0.01");
  const [stopLoss, setStopLoss]         = useState("");
  const [takeProfit, setTakeProfit]     = useState("");
  const [activeTab, setActiveTab]       = useState("positions");

  const [positions, setPositions]   = useState([]);
  const [loadingPos, setLoadingPos] = useState(false);
  const pollRef                     = useRef(null);

  const [confirmSide, setConfirmSide]   = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [closingId, setClosingId]       = useState(null);
  const [toast, setToast]               = useState(null);
  const [searchQ, setSearchQ]           = useState("");

  // Mobile panel state
  const [mobilePanel, setMobilePanel] = useState("chart"); // "chart" | "order" | "watch"

  // ── Fetch accounts ──────────────────────────────────────────────────────────
  useEffect(() => {
    tradingService.getUserAccounts()
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoadingAcc(false));
  }, []);

  // ── Fetch + poll positions ──────────────────────────────────────────────────
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

  // ── Execute trade ───────────────────────────────────────────────────────────
  const handleTrade = async () => {
    if (!selectedAccount || !confirmSide) return;
    setTradeLoading(true);

    const px = confirmSide === "buy"
      ? prices[activeSymbol]?.ask
      : prices[activeSymbol]?.bid;

    try {
      await tradingService.execute({
        tradingAccountId: selectedAccount.id,
        symbol:           activeSymbol,
        type:             confirmSide,
        lots:             parseFloat(lots),
        price:            px ?? BASE_PRICES[activeSymbol],
        stopLoss:         stopLoss   || undefined,
        takeProfit:       takeProfit || undefined,
      });

      setToast({
        message: `${confirmSide.toUpperCase()} ${lots} lots ${activeSymbol} placed!`,
        type: "success",
      });
      setConfirmSide(null);
      fetchPositions(true);

      const parsedLots     = parseFloat(lots)                         || 0;
      const parsedPrice    = parseFloat(px ?? BASE_PRICES[activeSymbol]) || 0;
      const parsedLeverage = parseInt(selectedAccount.leverage, 10)   || 500;
      const margin         = (parsedLots * 100000 * parsedPrice) / parsedLeverage;

      setSelectedAccount((a) => ({
        ...a,
        balance: (parseFloat(a.balance) - margin).toFixed(2),
      }));
    } catch (err) {
      setToast({ message: err.message || "Trade failed.", type: "error" });
    } finally {
      setTradeLoading(false);
    }
  };

  // ── Close position ──────────────────────────────────────────────────────────
  const handleClose = async (positionId) => {
    setClosingId(String(positionId));
    try {
      const res    = await tradingService.closePosition(positionId);
      const pnl    = parseFloat(res.data?.pnl)    || 0;
      const credit = parseFloat(res.data?.credit) || 0;

      setPositions((prev) =>
        prev.filter((p) => String(p.id) !== String(positionId))
      );
      setToast({
        message: `Closed. P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
        type: pnl >= 0 ? "success" : "error",
      });
      setSelectedAccount((a) => ({
        ...a,
        balance: (parseFloat(a.balance) + credit).toFixed(2),
      }));
    } catch (err) {
      setToast({ message: err.message || "Failed to close.", type: "error" });
    } finally {
      setClosingId(null);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const curPrice = prices[activeSymbol];
  const isUp     = curPrice ? curPrice.bid >= curPrice.prev : true;

  const filteredSymbols = Object.entries(prices).filter(([n]) =>
    n.toLowerCase().includes(searchQ.toLowerCase())
  );

  const margin = (() => {
    const parsedLots     = parseFloat(lots)                        || 0;
    const parsedPrice    = parseFloat(curPrice?.ask)               || 0;
    const parsedLeverage = parseInt(selectedAccount?.leverage, 10) || 500;
    if (!parsedPrice) return 0;
    return (parsedLots * 100000 * parsedPrice) / parsedLeverage;
  })();

  // ── Account selector screen ─────────────────────────────────────────────────
  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary mb-2">
            Select Trading Account
          </h1>
          <p className="text-[#8897A9] text-sm mb-8">
            Choose an account to enter the terminal.
          </p>

          {loadingAccounts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-sm text-[#8897A9] py-6">
              No active accounts.{" "}
              <Link to="/dashboard/accounts" className="text-accent font-bold">
                Open one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              {accounts.map((acc) => {
                const demo = acc.is_demo === "1" || acc.is_demo === 1;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    <div>
                      <div className="font-bold text-primary">
                        #{acc.account_number}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-[#8897A9]">
                        {acc.type?.replace(/_/g, " ")} ·{" "}
                        <span className={demo ? "text-blue-500" : "text-emerald-500"}>
                          {demo ? "Demo" : "Live"}
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
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-surface-border">
            <Link
              to="/dashboard"
              className="text-xs text-[#8897A9] hover:text-primary flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDemo = selectedAccount.is_demo === "1" || selectedAccount.is_demo === 1;

  // ── Terminal ────────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-[#0d111c] text-white text-xs"
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="border-b border-white/10 flex items-center justify-between px-3 flex-shrink-0 bg-[#0d111c] gap-2"
        style={{ height: 48 }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:block">vāntãgeCFD</span>
          </Link>
          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 text-[11px] min-w-0">
            <div className="hidden sm:block">
              <div className="text-white/30 text-[9px] uppercase font-bold">Account</div>
              <div className="font-bold">#{selectedAccount.account_number}</div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] uppercase font-bold">Balance</div>
              <div className="font-bold text-accent">
                ${parseFloat(selectedAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-white/30 text-[9px] uppercase font-bold">Leverage</div>
              <div className="font-bold">1:{selectedAccount.leverage}</div>
            </div>
            {isDemo && (
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-bold rounded uppercase">
                Demo
              </span>
            )}
          </div>
        </div>

        {/* Center — mobile tab switcher */}
        <div className="flex items-center gap-1 md:hidden">
          {[["chart", "Chart"], ["order", "Order"], ["watch", "Watch"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMobilePanel(k)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors
                ${mobilePanel === k ? "bg-accent text-primary" : "text-white/40 hover:text-white"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => fetchPositions(true)}
            className="p-1.5 text-white/40 hover:text-white transition-colors rounded"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loadingPos ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setSelectedAccount(null)}
            className="border border-white/10 text-white/50 hover:text-white text-[10px] py-1 px-2.5 rounded-lg transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── Market Watch sidebar ──────────────────────────────────────────── */}
        <aside
          className={`border-r border-white/10 flex-col bg-[#0b0f1a] flex-shrink-0
            ${mobilePanel === "watch" ? "flex w-full md:w-56" : "hidden md:flex md:w-56"}`}
          style={{ display: mobilePanel === "watch" ? "flex" : undefined, overflow: "hidden" }}
        >
          <div className="p-2.5 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[11px] focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="px-2 py-1 text-[9px] font-bold text-white/20 uppercase tracking-widest flex-shrink-0">
            Markets
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredSymbols.map(([name, p]) => {
              const up = p.bid >= p.prev;
              return (
                <button
                  key={name}
                  onClick={() => {
                    setActiveSymbol(name);
                    if (mobilePanel === "watch") setMobilePanel("chart");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-colors
                    ${activeSymbol === name ? "bg-accent/10 border-l-2 border-l-accent" : ""}`}
                >
                  <span className="font-bold text-[11px]">{name}</span>
                  <div className="text-right">
                    <div className={`font-mono text-[11px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                      {p.bid.toFixed(5)}
                    </div>
                    <div className={`text-[9px] ${up ? "text-emerald-400/50" : "text-red-400/50"}`}>
                      {up ? "▲" : "▼"} {Math.abs(p.bid - p.prev).toFixed(5)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Center: Chart + Positions ─────────────────────────────────────── */}
        <div
          className={mobilePanel === "order" || mobilePanel === "watch" ? "hidden md:flex" : "flex"}
          style={{ flex: 1, flexDirection: "column", overflow: "hidden", minHeight: 0, minWidth: 0 }}
        >
          {/* Chart area */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
            <TradingViewChart symbol={activeSymbol} />

            {/* Price overlay */}
            <div
              className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 flex items-center gap-4"
              style={{ pointerEvents: "none" }}
            >
              <span className="font-bold text-sm">{activeSymbol}</span>
              <span className={`font-mono font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {curPrice?.bid.toFixed(5)}
              </span>
              <span className={`text-[10px] font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "▲" : "▼"}{" "}
                {curPrice ? Math.abs(curPrice.bid - curPrice.prev).toFixed(5) : ""}
              </span>
            </div>
          </div>

          {/* Positions / History panel */}
          <div
            className="bg-[#0b0f1a] border-t border-white/10 flex-shrink-0 flex flex-col"
            style={{ height: 200 }}
          >
            {/* Tabs row */}
            <div className="flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0" style={{ height: 36 }}>
              <div className="flex items-center gap-4 h-full">
                {[["positions", `Positions (${positions.length})`], ["history", "History"]].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`font-bold h-full border-b-2 text-[11px] transition-colors
                      ${activeTab === key ? "text-accent border-accent" : "text-white/30 border-transparent hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchPositions(true)}
                className="text-white/20 hover:text-white p-1"
              >
                <RefreshCcw className={`w-3 h-3 ${loadingPos ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: "auto" }}>
              {activeTab === "positions" && (
                <table className="w-full text-left text-[11px]" style={{ minWidth: 560 }}>
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      {["#", "Symbol", "Type", "Lots", "Entry", "Current", "P&L", ""].map((h) => (
                        <th
                          key={h}
                          className={`px-3 py-2 text-white/25 font-bold ${h === "" ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingPos && positions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-5 text-center text-white/30">
                          <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-2" />
                          Loading…
                        </td>
                      </tr>
                    ) : positions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-5 text-center text-white/30">
                          No open positions.
                        </td>
                      </tr>
                    ) : // Replace the <tbody> rows in the positions table:
positions.map((p) => {
  const pnl      = parseFloat(p.pnl ?? 0);
  const isCopy   = p.execution_type === "copy";
  return (
    <tr key={p.id} className="hover:bg-white/5">
      <td className="px-3 py-2.5 text-white/30">{p.id}</td>
      <td className="px-3 py-2.5 font-bold">{p.symbol}</td>
      <td className="px-3 py-2.5">
        <span className={p.type === "long" ? "text-emerald-400" : "text-red-400"}>
          {p.type === "long" ? "BUY" : "SELL"}
        </span>
      </td>
      <td className="px-3 py-2.5">{p.lots}</td>
      <td className="px-3 py-2.5 font-mono">{parseFloat(p.entry_price).toFixed(5)}</td>
      <td className="px-3 py-2.5 font-mono">{parseFloat(p.current_price).toFixed(5)}</td>
      <td className={`px-3 py-2.5 font-mono font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
      </td>

      {/* ── Execution type badge ── */}
      <td className="px-3 py-2.5">
        {isCopy ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[9px] font-bold uppercase">
            <Copy className="w-2.5 h-2.5" />
            Copy
            {p.copied_from_name && (
              <span className="text-blue-300/70 normal-case font-normal ml-0.5">
                · {p.copied_from_name}
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase">
            <Zap className="w-2.5 h-2.5" />
            Manual
          </span>
        )}
      </td>

      <td className="px-3 py-2.5 text-right">
        <button onClick={() => handleClose(p.id)} disabled={closingId === String(p.id)}
          className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 font-bold transition-colors disabled:opacity-40 flex items-center gap-1 ml-auto text-[11px]">
          {closingId === String(p.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Close
        </button>
      </td>
    </tr>
  );
})
                    }
                  </tbody>
                </table>
              )}

              {activeTab === "history" && selectedAccount && (
                <TradeHistory accountId={selectedAccount.id} />
              )}
            </div>
          </div>
        </div>

        {/* ── Order Panel ───────────────────────────────────────────────────── */}
        <aside
          className={`border-l border-white/10 bg-[#0b0f1a] flex-shrink-0
            ${mobilePanel === "order" ? "flex w-full" : "hidden md:flex md:w-64"}`}
          style={{ flexDirection: "column", overflowY: "auto" }}
        >
          <div className="p-4 space-y-4">

            {/* Order type */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Order Type
              </div>
              <div className="flex bg-white/5 rounded-xl p-1">
                {["market", "limit"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all
                      ${orderType === t ? "bg-accent text-primary" : "text-white/40 hover:text-white"}`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Active symbol */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
              <span className="font-bold">{activeSymbol}</span>
              <div className="text-right">
                <div className={`font-mono font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {curPrice?.bid.toFixed(5)}
                </div>
                <div className="text-[9px] text-white/30">ASK {curPrice?.ask.toFixed(5)}</div>
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Volume (Lots)
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {["0.01", "0.10", "0.50", "1.00"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setLots(v)}
                    className={`py-1.5 rounded text-[10px] font-bold border transition-colors
                      ${lots === v
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-accent/50"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={lots}
                onChange={(e) => setLots(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-accent"
              />
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
                  Stop Loss
                </div>
                <input
                  type="text"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
                  Take Profit
                </div>
                <input
                  type="text"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/30">Margin</span>
                <span className="font-bold">${margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Spread</span>
                <span className="font-bold text-accent">
                  {curPrice ? ((curPrice.ask - curPrice.bid) * 10000).toFixed(1) : "—"} pips
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Balance</span>
                <span className="font-bold">
                  ${parseFloat(selectedAccount.balance).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buy / Sell buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmSide("sell")}
                className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 active:scale-95 transition-all rounded-xl py-4"
              >
                <TrendingDown className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">SELL</span>
                <span className="text-[10px] opacity-60">{curPrice?.bid.toFixed(5)}</span>
              </button>
              <button
                onClick={() => setConfirmSide("buy")}
                className="flex flex-col items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-xl py-4"
              >
                <TrendingUp className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">BUY</span>
                <span className="text-[10px] opacity-60">{curPrice?.ask.toFixed(5)}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Confirm modal ───────────────────────────────────────────────────── */}
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}