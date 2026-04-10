import { useState, useEffect, useCallback } from "react";
import { Search, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";

function statusVariant(s) {
  const normalized = s?.toLowerCase();
  if (normalized === "completed") return "success";
  if (normalized === "pending") return "warning";
  if (normalized === "processing") return "neutral";
  if (normalized === "rejected") return "danger";
  return "neutral";
}

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTxns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getTransactions();
      setTxns(res.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTxns();
  }, [fetchTxns]);

  const approve = async (id) => {
    try {
      await adminService.approveTransaction(id);
      fetchTxns();
    } catch (err) {
      alert(err.message);
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await adminService.rejectTransaction(id, reason);
      fetchTxns();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = txns.filter((t) => {
    const userStr = t.user_name || "";
    const refStr = t.reference || "";
    const matchSearch = userStr.toLowerCase().includes(search.toLowerCase()) || refStr.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || t.type.toLowerCase() === typeFilter.toLowerCase();
    const matchStatus = statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchType && matchStatus;
  });

  const totals = {
    deposits: txns.filter((t) => t.type.toLowerCase() === "deposit" && t.status.toLowerCase() === "completed").length,
    withdrawals: txns.filter((t) => t.type.toLowerCase() === "withdrawal" && t.status.toLowerCase() === "completed").length,
    pending: txns.filter((t) => t.status.toLowerCase() === "pending").length,
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
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent mb-2" />
                    <span className="text-sm text-[#8897A9]">Loading transactions...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-[#8897A9]">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface/50 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-primary">
                      <div className="flex flex-col">
                        <span>{tx.reference}</span>
                        {tx.tx_hash && <span className="text-[10px] text-[#8897A9] truncate max-w-[120px]">{tx.tx_hash}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-primary">{tx.user_name}</div>
                      <div className="text-[11px] text-[#8897A9]">{tx.user_email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${tx.type.toLowerCase() === "deposit" ? "bg-teal/10 text-teal" : "bg-accent/10 text-accent"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-display font-bold text-sm text-primary">
                      ${parseFloat(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#4A5568] capitalize">{tx.method.replace(/_/g, " ")}</span>
                        {tx.receipt_url && (
                          <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent font-bold flex items-center gap-0.5 hover:underline">
                            View Receipt <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4"><Badge variant={statusVariant(tx.status)}>{tx.status}</Badge></td>
                    <td className="px-5 py-4 text-xs text-[#8897A9]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {(tx.status.toLowerCase() === "pending" || tx.status.toLowerCase() === "processing") && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approve(tx.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] bg-teal/10 text-teal text-[10px] font-bold hover:bg-teal hover:text-white transition-all uppercase"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => reject(tx.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] bg-red-50 text-red-500 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
