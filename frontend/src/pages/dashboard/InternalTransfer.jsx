import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ArrowRightLeft, Wallet, TrendingUp, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { accountService } from "../../services/api";

export default function InternalTransfer() {
  const [from, setFrom] = useState("wallet");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountService.getAll();
        setAccounts(res.data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleTransfer = async () => {
    if (!amount || !to) return;
    setLoading(true);
    try {
      await accountService.internalTransfer({
        from,
        to,
        amount: parseFloat(amount),
        accounts
      });
      alert("Transfer successful!");
      setAmount("");
      // Refresh accounts
      const res = await accountService.getAll();
      setAccounts(res.data);
    } catch (err) {
      alert("Transfer failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-primary">Internal Transfer</h1>
        <p className="text-sm text-[#8897A9] mt-1">Move funds instantly between your Wallet and Trading Accounts.</p>
      </div>

      <div className="bg-white border border-surface-border rounded-xl p-8 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-field"
            >
              <option value="wallet">Main Wallet ($1,000.00)</option>
              {accounts.map(acc => (
                <option key={acc.account_number} value={acc.account_number}>MT4 #{acc.account_number} (${parseFloat(acc.balance).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex absolute left-1/2 top-[55px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-surface border border-surface-border rounded-full items-center justify-center z-10">
             <ArrowRightLeft className="w-4 h-4 text-[#8897A9]" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-field"
            >
              <option value="">Select Destination</option>
              {from !== 'wallet' && <option value="wallet">Main Wallet</option>}
              {accounts.filter(acc => acc.account_number !== from).map(acc => (
                <option key={acc.account_number} value={acc.account_number}>MT4 #{acc.account_number}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
           <label className="block text-xs font-bold uppercase tracking-widest text-[#8897A9]">Amount to Transfer</label>
           <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pl-8 text-lg font-bold"
              />
           </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
           <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
           <p className="text-xs text-amber-800 leading-relaxed">
             Transfers are processed instantly. Please ensure you have no open positions in the source account that might be affected by the margin change.
           </p>
        </div>

        <button
           onClick={handleTransfer}
           disabled={loading || !amount || !to}
           className="w-full btn-primary py-4 flex items-center justify-center gap-2"
        >
           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Transfer Funds <ArrowRight className="w-4 h-4" /></>
           )}
        </button>
      </div>
    </div>
  );
}
