import { TrendingUp, Wallet, ShieldCheck, ArrowRight, Activity, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const accounts = [
    { number: "8800123", type: "Raw ECN", balance: "5,000.00", status: "Live" },
    { number: "9900456", type: "Standard STP", balance: "10,000.00", status: "Demo" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary rounded-xl p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <h1 className="font-display font-extrabold text-3xl text-white mb-2 relative z-10">Welcome back, Trader!</h1>
          <p className="text-white/50 mb-6 relative z-10">Access global markets and manage your trading portfolio with Vantage Markets.</p>
          <div className="flex gap-3 relative z-10">
            <Link to="/trading-terminal" className="btn-primary text-sm px-6 py-3">Trade Now</Link>
            <Link to="/dashboard/funds" className="btn-ghost border-white/20 text-white hover:border-accent text-sm px-6 py-3">Deposit Funds</Link>
          </div>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-8 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-4">
              <Wallet className="w-4 h-4 text-accent" />
              Wallet Balance
            </div>
            <div className="font-display font-extrabold text-4xl text-primary">$1,000.00</div>
            <div className="text-xs text-teal font-semibold mt-1">Available for transfer</div>
          </div>
          <Link to="/dashboard/transfer" className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all mt-6">
            Move Funds <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Trading Accounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-primary">Your Trading Accounts</h2>
          <Link to="/dashboard/accounts" className="text-sm font-bold text-accent flex items-center gap-1">
            <Plus className="w-4 h-4" /> Open New Account
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc.number} className="bg-white border border-surface-border rounded-xl p-6 shadow-card hover:border-accent/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.status === 'Live' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {acc.status} Account
                </span>
                <span className="text-xs font-medium text-[#8897A9]">#{acc.number}</span>
              </div>
              <div className="text-xs text-[#8897A9] mb-1">{acc.type}</div>
              <div className="font-display font-bold text-2xl text-primary mb-6">${acc.balance}</div>
              <Link to="/trading-terminal" className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" /> Trade
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions / Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card flex items-center gap-5">
           <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
             <div className="font-bold text-primary">KYC Status: Pending</div>
             <div className="text-xs text-[#8897A9]">Please upload your ID and Proof of Address.</div>
             <Link to="/dashboard/kyc" className="text-xs font-bold text-accent mt-2 block">Upload Documents</Link>
           </div>
        </div>
        <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card flex items-center gap-5">
           <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal">
            <Activity className="w-6 h-6" />
           </div>
           <div>
             <div className="font-bold text-primary">Account Leverage</div>
             <div className="text-xs text-[#8897A9]">Your current maximum leverage is set to 1:500.</div>
             <button className="text-xs font-bold text-teal mt-2 block">Request Change</button>
           </div>
        </div>
      </div>
    </div>
  );
}
