import { useState } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";

export default function AccountManagement() {
  const [showNew, setShowNew] = useState(false);
  const accounts = [
    { id: 1, number: "8800123", type: "Raw ECN", balance: "5,000.00", leverage: "1:500", currency: "USD", status: "Live" },
    { id: 2, number: "9900456", type: "Standard STP", balance: "10,000.00", leverage: "1:500", currency: "USD", status: "Demo" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-2xl text-primary">Trading Accounts</h1>
        <button
          onClick={() => setShowNew(true)}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <Plus className="w-4 h-4" /> Open New Account
        </button>
      </div>

      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface/50 border-b border-surface-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9]">Account Info</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9]">Type</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9]">Leverage</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9]">Balance</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9]">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-surface/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-primary">MT4 Account</div>
                  <div className="text-xs text-[#8897A9]">#{acc.number}</div>
                </td>
                <td className="px-6 py-5 text-sm text-[#4A5568]">{acc.type}</td>
                <td className="px-6 py-5 text-sm text-[#4A5568]">{acc.leverage}</td>
                <td className="px-6 py-5 font-bold text-primary">${acc.balance} {acc.currency}</td>
                <td className="px-6 py-5">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.status === 'Live' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {acc.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-xs font-bold text-accent hover:underline">Change Leverage</button>
                  <span className="mx-2 text-[#DDE3EE]">|</span>
                  <button className="text-xs font-bold text-primary hover:underline">History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
              <h2 className="font-display font-bold text-2xl mb-6 text-primary">Open New Account</h2>
              <form className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Account Type</label>
                    <select className="input-field">
                       <option>Standard STP</option>
                       <option>Raw ECN</option>
                       <option>Pro ECN</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Leverage</label>
                    <select className="input-field">
                       <option>1:100</option>
                       <option>1:200</option>
                       <option>1:500</option>
                    </select>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowNew(false)} className="flex-1 btn-ghost">Cancel</button>
                    <button type="button" className="flex-1 btn-primary">Create Account</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
