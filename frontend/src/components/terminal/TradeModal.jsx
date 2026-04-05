import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Info, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TradeModal({ symbol, price, onClose, onExecute, account }) {
  const [lots, setLots] = useState(0.01);
  const [leverage, setLeverage] = useState(account?.leverage || 500);
  const [side, setSide] = useState("long"); // long or short
  const [loading, setLoading] = useState(false);

  // Constants for calculation
  const contractSize = 100000;
  const requiredMargin = (lots * contractSize * price) / leverage;
  const isAffordable = (account?.balance || 0) >= requiredMargin;

  const handleExecute = async () => {
    if (!isAffordable) return;
    setLoading(true);
    await onExecute({ symbol, price, lots, leverage, type: side });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1a1d23] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-primary">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <TrendingUp className="w-6 h-6" />
             </div>
             <div>
                <h2 className="font-display font-extrabold text-white text-lg">{symbol}</h2>
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Market Execution</div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
           {/* Current Price */}
           <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 border border-white/5">
              <span className="text-sm text-white/60 font-medium">Live Market Price</span>
              <span className="text-xl font-mono font-bold text-accent">{price}</span>
           </div>

           {/* Side Selection */}
           <div className="grid grid-cols-2 gap-4">
              <button
                 onClick={() => setSide("long")}
                 className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${side === 'long' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                 <TrendingUp className="w-4 h-4" /> BUY
              </button>
              <button
                 onClick={() => setSide("short")}
                 className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${side === 'short' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                 <TrendingDown className="w-4 h-4" /> SELL
              </button>
           </div>

           {/* Inputs */}
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] uppercase font-bold text-white/40 mb-2 tracking-widest">Trade Volume (Lots)</label>
                 <div className="relative">
                    <input
                       type="number"
                       step="0.01"
                       min="0.01"
                       value={lots}
                       onChange={(e) => setLots(parseFloat(e.target.value))}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-accent transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">
                       {(lots * contractSize).toLocaleString()} UNITS
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] uppercase font-bold text-white/40 mb-2 tracking-widest">Dynamic Leverage</label>
                 <select
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-accent appearance-none"
                 >
                    {[100, 200, 300, 400, 500].map(v => (
                       <option key={v} value={v} className="bg-[#1a1d23]">1:{v}</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* Calculations */}
           <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-white/40">Account Balance:</span>
                 <span className="text-white font-bold">${parseFloat(account?.balance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-white/40">Required Margin:</span>
                 <span className={`font-bold ${isAffordable ? 'text-teal' : 'text-red-500'}`}>${requiredMargin.toFixed(2)}</span>
              </div>

              {!isAffordable && (
                 <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-[11px] text-red-400 leading-tight">Insufficient funds. Transfer funds to your trading account to execute this trade.</span>
                 </div>
              )}
           </div>

           {/* Execute */}
           <button
              onClick={handleExecute}
              disabled={!isAffordable || loading}
              className={`w-full py-5 rounded-2xl font-display font-extrabold text-lg transition-all flex items-center justify-center gap-3 ${isAffordable ? 'bg-accent text-primary hover:bg-accent-light shadow-xl shadow-accent/20' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
           >
              {loading ? (
                 <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              ) : (
                 <>
                    {side === 'long' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    EXECUTE {side === 'long' ? 'BUY' : 'SELL'}
                 </>
              )}
           </button>

           <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-tighter">
              <ShieldCheck className="w-3 h-3" /> Secure STP Execution Protocol
           </div>
        </div>
      </div>
    </div>
  );
}
