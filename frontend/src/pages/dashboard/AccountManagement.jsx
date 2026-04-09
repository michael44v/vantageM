import { useState, useEffect } from "react";
import { Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { accountService } from "../../services/api";

export default function AccountManagement() {
  const [showNew, setShowNew] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: "standard_stp",
    leverage: "500",
    is_demo: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountService.getAll();
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      await accountService.create({
        ...formData,
        leverage: parseInt(formData.leverage, 10)
      });
      setShowNew(false);
      fetchAccounts();
    } catch (err) {
      alert("Failed to create account: " + err.message);
    } finally {
      setCreating(false);
    }
  };

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
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-[#8897A9]">
                  No trading accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-primary">MT4 Account</div>
                    <div className="text-xs text-[#8897A9]">#{acc.account_number}</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#4A5568] capitalize">
                    {acc.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-5 text-sm text-[#4A5568]">1:{acc.leverage}</td>
                  <td className="px-6 py-5 font-bold text-primary">
                    ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${!acc.is_demo ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                      {acc.is_demo ? 'Demo' : 'Live'}
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
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }}>
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Account Type</label>
                    <select
                      className="input-field"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                       <option value="standard_stp">Standard STP</option>
                       <option value="raw_ecn">Raw ECN</option>
                       <option value="pro_ecn">Pro ECN</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-2">Leverage</label>
                    <select
                      className="input-field"
                      value={formData.leverage}
                      onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                    >
                       <option value="100">1:100</option>
                       <option value="200">1:200</option>
                       <option value="500">1:500</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_demo"
                      checked={formData.is_demo}
                      onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                    />
                    <label htmlFor="is_demo" className="text-sm text-[#4A5568]">Demo Account</label>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowNew(false)} className="flex-1 btn-ghost">Cancel</button>
                    <button type="submit" disabled={creating} className="flex-1 btn-primary flex items-center justify-center">
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
