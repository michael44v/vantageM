import { useState } from "react";
import {
  Users, TrendingUp, Shield, ArrowUpRight,
  BarChart2, Filter, Search, ChevronRight,
  Play, Pause, Settings, Activity
} from "lucide-react";

export default function CopyTradingPage() {
  const [filter, setFilter] = useState("ROI");

  const providers = [
    { id: 1, name: "GoldStrategy", roi: "154.2%", winRate: "78%", drawdown: "12%", subscribers: "1,240", type: "Conservative" },
    { id: 2, name: "AlphaForex", roi: "82.5%", winRate: "65%", drawdown: "8%", subscribers: "850", type: "Low Risk" },
    { id: 3, name: "CryptoElite", roi: "412.0%", winRate: "52%", drawdown: "35%", subscribers: "2,100", type: "Aggressive" },
    { id: 4, name: "StableYield", roi: "45.8%", winRate: "92%", drawdown: "4%", subscribers: "420", type: "Conservative" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="font-display font-extrabold text-2xl text-primary">Copy Trading Hub</h1>
           <p className="text-sm text-[#8897A9] mt-1">Mirror the trades of professional signal providers automatically.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-surface text-primary text-xs font-bold rounded-lg border border-surface-border flex items-center gap-2">
              <Activity className="w-4 h-4" /> Provider Dashboard
           </button>
           <button className="btn-primary text-xs py-2 px-4">Become a Provider</button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: "Active Copiers", val: "54.2k", icon: Users, color: "text-accent" },
           { label: "Total Profit Paid", val: "$12.8M", icon: TrendingUp, color: "text-teal" },
           { label: "Verified Providers", val: "1,240", icon: Shield, color: "text-blue-500" },
           { label: "Success Rate", val: "84%", icon: Activity, color: "text-emerald-500" },
         ].map(s => (
            <div key={s.label} className="bg-white border border-surface-border rounded-xl p-5 shadow-card">
               <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-surface ${s.color}`}>
                     <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8897A9]">{s.label}</span>
               </div>
               <div className="font-display font-bold text-2xl text-primary">{s.val}</div>
            </div>
         ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
            <input type="text" placeholder="Search providers by name or strategy..." className="input-field pl-12" />
         </div>
         <div className="flex items-center gap-2 bg-white border border-surface-border rounded-xl p-1">
            {['ROI', 'Risk', 'Subscribers'].map(f => (
               <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === f ? 'bg-primary text-white' : 'text-[#8897A9] hover:text-primary'}`}
               >
                  {f}
               </button>
            ))}
         </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {providers.map(p => (
            <div key={p.id} className="bg-white border border-surface-border rounded-xl p-6 shadow-card hover:border-accent/40 transition-all group">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-surface border border-surface-border flex items-center justify-center font-display font-bold text-primary group-hover:border-accent group-hover:bg-accent/5 transition-all">
                     {p.name[0]}
                  </div>
                  <div>
                     <div className="font-bold text-primary">{p.name}</div>
                     <div className="text-[10px] font-bold uppercase text-[#8897A9]">{p.type}</div>
                  </div>
               </div>

               <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-end">
                     <span className="text-xs text-[#8897A9]">ROI (All Time)</span>
                     <span className="text-lg font-display font-bold text-teal">{p.roi}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border">
                     <div>
                        <div className="text-[10px] text-[#8897A9] font-bold uppercase">Win Rate</div>
                        <div className="text-sm font-bold text-primary">{p.winRate}</div>
                     </div>
                     <div>
                        <div className="text-[10px] text-[#8897A9] font-bold uppercase">Drawdown</div>
                        <div className="text-sm font-bold text-red-500">{p.drawdown}</div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#8897A9]">
                     <Users className="w-3 h-3" /> {p.subscribers} Copiers
                  </div>
                  <button className="btn-primary text-[10px] px-4 py-2">COPY SIGNAL</button>
               </div>
            </div>
         ))}
      </div>

      {/* Benefits Banner */}
      <div className="bg-primary rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32" />
         <div className="max-w-md relative z-10">
            <h2 className="font-display font-extrabold text-2xl text-white mb-2">Automated Social Trading</h2>
            <p className="text-white/50 text-sm leading-relaxed">Let the experts do the work. Your account will automatically copy trades proportional to your equity, ensuring proper risk management.</p>
         </div>
         <div className="flex gap-4 relative z-10 w-full md:w-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
               <div className="text-teal font-bold text-lg mb-1">0.1s</div>
               <div className="text-[10px] text-white/40 font-bold uppercase">Execution Speed</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 md:w-32">
               <div className="text-accent font-bold text-lg mb-1">Fixed</div>
               <div className="text-[10px] text-white/40 font-bold uppercase">Service Fees</div>
            </div>
         </div>
      </div>
    </div>
  );
}
