import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLiveTrades, executeTrade } from "../store/slices/tradingSlice";
import TradeModal from "../components/terminal/TradeModal";
import {
  TrendingUp, TrendingDown, Clock, Search,
  ChevronRight, ArrowLeft, LayoutDashboard, Settings,
  Zap, Shield, Globe, Info, Maximize2, RefreshCcw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function TerminalPage() {
  const dispatch = useDispatch();
  const { liveTrades, loading } = useSelector((state) => state.trading);
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [orderType, setOrderType] = useState("market");
  const [lots, setLots] = useState("0.01");
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Simulation: find account details
  const accounts = [
    { id: 1, number: "8800123", type: "Raw ECN", balance: "5000.00", leverage: 500, status: "Live" },
    { id: 2, number: "9900456", type: "Standard STP", balance: "10000.00", leverage: 500, status: "Demo" },
  ];

  const currentAccount = accounts.find(a => a.number === selectedAccount);

  const symbols = [
    { name: "EUR/USD", price: "1.08542", change: "+0.12%", up: true },
    { name: "GBP/USD", price: "1.26431", change: "-0.05%", up: false },
    { name: "USD/JPY", price: "151.423", change: "+0.42%", up: true },
    { name: "XAU/USD", price: "2345.10", change: "+1.20%", up: true },
    { name: "BTC/USD", price: "68432.50", change: "-1.10%", up: false },
    { name: "ETH/USD", price: "3421.15", change: "-0.85%", up: false },
  ];

  // Filter trades for the selected account
  const positions = liveTrades.filter(t => t.account_number === selectedAccount);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchLiveTrades());
    }
  }, [selectedAccount, dispatch]);

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl text-center animate-fade-in-up">
           <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
              <TrendingUp className="w-8 h-8" />
           </div>
           <h1 className="font-display font-extrabold text-2xl text-primary mb-2">Access Web Terminal</h1>
           <p className="text-[#8897A9] text-sm mb-8">Please select a trading account to enter the Vantage Markets Web Terminal.</p>

           <div className="space-y-3">
              {accounts.map(acc => (
                <button
                  key={acc.number}
                  onClick={() => setSelectedAccount(acc.number)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div>
                    <div className="font-bold text-primary">#{acc.number}</div>
                    <div className="text-[10px] uppercase font-bold text-[#8897A9]">{acc.type} • {acc.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">${acc.balance}</div>
                    <div className="text-[10px] text-accent font-bold">SELECT</div>
                  </div>
                </button>
              ))}
              <Link to="/dashboard/accounts" className="block text-xs font-bold text-accent pt-4">Open New Account</Link>
           </div>

           <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-center gap-4">
              <Link to="/dashboard" className="text-xs font-bold text-[#8897A9] hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Dashboard
              </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden font-sans text-white">
      {/* Terminal Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-primary flex-shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-sm hidden md:block">Vantage WebTerminal</span>
          </Link>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Account</span>
                <span className="text-xs font-bold">#{selectedAccount} (Raw ECN)</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Balance</span>
                <span className="text-xs font-bold text-accent">$5,000.00</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-white/60 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="p-2 text-white/60 hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
          <button onClick={() => setSelectedAccount("")} className="btn-ghost border-white/10 text-white text-[10px] py-1.5 px-3">Exit</button>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Market Watch (Left) */}
        <aside className="w-72 border-r border-white/10 flex flex-col flex-shrink-0 bg-primary-dark">
           <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                <input type="text" placeholder="Search Symbol..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-accent" />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                 <thead className="bg-white/5 sticky top-0">
                    <tr>
                       <th className="px-3 py-2 text-white/40 font-bold">Symbol</th>
                       <th className="px-3 py-2 text-white/40 font-bold text-right">Bid</th>
                       <th className="px-3 py-2 text-white/40 font-bold text-right">Ask</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {symbols.map(s => (
                       <tr key={s.name} onClick={() => setActiveSymbol(s.name)} className={`cursor-pointer hover:bg-white/5 ${activeSymbol === s.name ? 'bg-accent/10' : ''}`}>
                          <td className="px-3 py-3 font-bold">{s.name}</td>
                          <td className={`px-3 py-3 text-right font-mono ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.price}</td>
                          <td className={`px-3 py-3 text-right font-mono ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.price}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </aside>

        {/* Center: Chart & Trade History */}
        <div className="flex-1 flex flex-col overflow-hidden">
           {/* TradingView Placeholder */}
           <div className="flex-1 bg-[#131722] relative border-b border-white/10">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                 <Globe className="w-16 h-16 mb-4 opacity-50" />
                 <div className="font-display font-bold text-xl uppercase tracking-[0.2em]">{activeSymbol} Interactive Chart</div>
                 <div className="text-xs mt-2">Powered by Vantage Markets Institutional Liquidity</div>
              </div>
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 flex items-center gap-4">
                 <div className="text-sm font-bold">{activeSymbol}</div>
                 <div className="text-sm font-mono text-emerald-400">1.08542</div>
                 <div className="text-[10px] text-emerald-400 font-bold">+0.12%</div>
              </div>
           </div>

           {/* Bottom: Positions / History */}
           <div className="h-64 bg-primary-dark flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 border-b border-white/10 h-10 flex-shrink-0">
                 <div className="flex items-center gap-6 h-full">
                    <button className="text-xs font-bold text-accent border-b-2 border-accent h-full">Open Positions ({positions.length})</button>
                    <button className="text-xs font-bold text-white/40 hover:text-white transition-colors h-full">Pending Orders (0)</button>
                    <button className="text-xs font-bold text-white/40 hover:text-white transition-colors h-full">Trade History</button>
                 </div>
                 <button
                    onClick={() => dispatch(fetchLiveTrades())}
                    className="text-white/40 hover:text-white transition-all p-1"
                    title="Refresh Data"
                    disabled={loading}
                 >
                    <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <table className="w-full text-left text-[11px]">
                    <thead className="bg-white/5 sticky top-0">
                       <tr>
                          <th className="px-4 py-2 text-white/40 font-bold">Ticket</th>
                          <th className="px-4 py-2 text-white/40 font-bold">Symbol</th>
                          <th className="px-4 py-2 text-white/40 font-bold">Type</th>
                          <th className="px-4 py-2 text-white/40 font-bold">Lots</th>
                          <th className="px-4 py-2 text-white/40 font-bold">Entry</th>
                          <th className="px-4 py-2 text-white/40 font-bold">Current</th>
                          <th className="px-4 py-2 text-white/40 font-bold text-right">Profit</th>
                          <th className="px-4 py-2"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {positions.map(p => (
                          <tr key={p.id} className="hover:bg-white/5">
                             <td className="px-4 py-3 text-white/60">{p.id}</td>
                             <td className="px-4 py-3 font-bold">{p.symbol}</td>
                             <td className="px-4 py-3"><span className="text-emerald-400">{p.type}</span></td>
                             <td className="px-4 py-3">{p.lots}</td>
                             <td className="px-4 py-3 font-mono">{p.entry_price}</td>
                             <td className="px-4 py-3 font-mono">{p.current_price}</td>
                             <td className={`px-4 py-3 text-right font-bold font-mono ${parseFloat(p.pnl) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {parseFloat(p.pnl) >= 0 ? '+' : ''}{parseFloat(p.pnl).toFixed(2)} USD
                             </td>
                             <td className="px-4 py-3 text-right">
                                <button className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-all">Close</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right: Order Panel */}
        <aside className="w-80 border-l border-white/10 flex flex-col flex-shrink-0 bg-primary-dark overflow-y-auto">
           <div className="p-6 space-y-6">
              <div>
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Execute Trade</h3>
                 <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                       onClick={() => setOrderType("market")}
                       className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${orderType === 'market' ? 'bg-accent text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                       MARKET
                    </button>
                    <button
                       onClick={() => setOrderType("limit")}
                       className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${orderType === 'limit' ? 'bg-accent text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                       LIMIT
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Order Volume (Lots)</label>
                    <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => setLots("0.01")} className="bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-bold hover:border-accent">0.01</button>
                       <button onClick={() => setLots("0.10")} className="bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-bold hover:border-accent">0.10</button>
                       <button onClick={() => setLots("1.00")} className="bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-bold hover:border-accent">1.00</button>
                    </div>
                    <input
                       type="text"
                       value={lots}
                       onChange={(e) => setLots(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold mt-2 focus:outline-none focus:border-accent"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Stop Loss</label>
                       <input type="text" placeholder="Optional" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Take Profit</label>
                       <input type="text" placeholder="Optional" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-accent" />
                    </div>
                 </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                 <button
                    onClick={() => setShowTradeModal(true)}
                    className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 transition-all rounded-xl p-4 group"
                 >
                    <TrendingDown className="w-6 h-6 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs font-bold">SELL</span>
                    <span className="text-[10px] opacity-60">1.08538</span>
                 </button>
                 <button
                    onClick={() => setShowTradeModal(true)}
                    className="flex flex-col items-center justify-center bg-emerald-500 hover:bg-emerald-600 transition-all rounded-xl p-4 group"
                 >
                    <TrendingUp className="w-6 h-6 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs font-bold">BUY</span>
                    <span className="text-[10px] opacity-60">1.08542</span>
                 </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">Required Margin:</span>
                    <span className="font-bold">$21.71 USD</span>
                 </div>
                 <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">Spread:</span>
                    <span className="font-bold text-accent">0.4 pips</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      {showTradeModal && (
        <TradeModal
          symbol={activeSymbol}
          price={symbols.find(s => s.name === activeSymbol)?.price || "1.08542"}
          account={currentAccount}
          onClose={() => setShowTradeModal(false)}
          onExecute={onTradeExecute}
        />
      )}
    </div>
  );
}
