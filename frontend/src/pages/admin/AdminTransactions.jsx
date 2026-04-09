import { useState, useEffect } from "react";
import { Search, Check, X, Loader2 } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";

function statusVariant(s) {
  const map = { completed: "success", pending: "warning", processing: "neutral", rejected: "danger" };
  return map[s.toLowerCase()] || "neutral";
}

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await adminService.getAllTransactions();
      setTxns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await adminService.approveTransaction(id);
      alert("Transaction approved.");
      fetchTransactions();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const filtered = txns.filter((t) => {
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || t.type === typeFilter;
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totals = {
    deposits: txns.filter((t) => t.type === "Deposit" && t.status === "Completed").length,
    withdrawals: txns.filter((t) => t.type === "Withdrawal" && t.status === "Completed").length,
    pending: txns.filter((t) => t.status === "Pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Transactions</h1>
        <p className="text-sm text-[#4A5568]">All deposits, withdrawals, and payment activity.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Completed Deposits", val: totals.deposits, color: "text-teal", bg: "bg-teal/10" },
          { label: "Completed Withdrawals", val: totals.withdrawals, color: "text-accent", bg: "bg-accent/10" },
          { label: "Pending Approval", val: totals.pending, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-surface-border rounded-xl p-5 shadow-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[10px] ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`font-display font-extrabold text-2xl ${c.color}`}>{c.val}</span>
            </div>
            <div className="text-sm font-semibold text-[#4A5568]">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-surface-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
          <input
            placeholder="Search by user or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-surface-border text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Deposit", "Withdrawal"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${typeFilter === t ? "bg-accent text-white border-accent" : "bg-surface border-surface-border text-[#4A5568] hover:border-accent hover:text-accent"}`}>{t}</button>
          ))}
          <div className="w-px bg-surface-border" />
          {["All", "Completed", "Pending", "Processing", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-surface border-surface-border text-[#4A5568] hover:border-primary hover:text-primary"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-surface-border">
                {["Transaction ID", "User", "Type", "Amount", "Method", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                  </td>
                </tr>
              ) : filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface/50 transition-colors group">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-primary">{tx.reference}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-primary">{tx.user_name}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${tx.type === "deposit" ? "bg-teal/10 text-teal" : "bg-accent/10 text-accent"}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-display font-bold text-sm text-primary">${parseFloat(tx.amount).toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-[#4A5568] capitalize">{tx.method}</td>
                  <td className="px-5 py-4"><Badge variant={statusVariant(tx.status)}>{tx.status}</Badge></td>
                  <td className="px-5 py-4 text-xs text-[#8897A9]">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {(tx.status === "pending" || tx.status === "processing") && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => approve(tx.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] bg-teal/10 text-teal text-xs font-semibold hover:bg-teal hover:text-white transition-all"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => reject(tx.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-xs text-[#8897A9]">Showing {filtered.length} of {txns.length} transactions</span>
          <div className="flex gap-1">
            {[1, 2].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-[6px] text-xs font-semibold transition-all ${p === 1 ? "bg-accent text-white" : "bg-surface text-[#4A5568] hover:bg-surface-border"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
