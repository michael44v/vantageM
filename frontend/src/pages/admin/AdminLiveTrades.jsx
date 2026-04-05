import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLiveTrades } from "../../store/slices/tradingSlice";
import { TrendingUp, RefreshCcw, Activity, User, Globe } from "lucide-react";

export default function AdminLiveTrades() {
  const dispatch = useDispatch();
  const { liveTrades: trades, loading } = useSelector((state) => state.trading);

  useEffect(() => {
    dispatch(fetchLiveTrades());
    const interval = setInterval(() => dispatch(fetchLiveTrades()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const onRefresh = () => dispatch(fetchLiveTrades());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Live Trades</h1>
          <p className="text-sm text-[#4A5568]">Monitoring all open positions across the platform</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 btn-ghost px-4 py-2 text-xs font-bold"
          disabled={loading}
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Positions", value: trades.length, icon: Activity, color: "text-accent" },
          { label: "Total Exposure", value: (trades.reduce((acc, t) => acc + (t.lots * 100000), 0)).toLocaleString() + " USD", icon: Globe, color: "text-teal" },
          { label: "Net PnL", value: (trades.reduce((acc, t) => acc + parseFloat(t.pnl), 0)).toFixed(2) + " USD", icon: TrendingUp, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-surface-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8897A9]">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-display font-extrabold text-primary">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E0E0E0]">
            <tr>
              {["Trader", "Symbol", "Side", "Size", "Entry", "Current", "PnL"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#666666]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {trades.map((t) => (
              <tr key={t.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                      {t.trader_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111] text-sm">{t.trader_name}</div>
                      <div className="text-[10px] text-[#8897A9] uppercase font-bold">Acc: {t.account_number}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-primary">{t.symbol}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${t.type === 'long' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-5 text-[#333333] font-medium">{t.lots} Lots</td>
                <td className="px-6 py-5 font-mono text-xs">{parseFloat(t.entry_price).toFixed(5)}</td>
                <td className="px-6 py-5 font-mono text-xs text-primary">{parseFloat(t.current_price).toFixed(5)}</td>
                <td className={`px-6 py-5 font-bold font-mono text-sm ${parseFloat(t.pnl) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {parseFloat(t.pnl) >= 0 ? "+" : ""}{parseFloat(t.pnl).toFixed(2)} USD
                </td>
              </tr>
            ))}
            {trades.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-[#8897A9]">
                   No live trades currently open.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
