import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft, ArrowUpRight, ArrowRightLeft,
  Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader2, ExternalLink, Filter,
  TrendingUp, Wallet, Search, ChevronLeft, ChevronRight,
  Receipt
} from "lucide-react";
import { paymentService } from "../../services/api";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,         bg: "bg-amber-100",   text: "text-amber-600",  dot: "bg-amber-400"  },
  processing: { label: "Processing", icon: Loader2,       bg: "bg-blue-100",    text: "text-blue-600",   dot: "bg-blue-400"   },
  approved:   { label: "Approved",   icon: CheckCircle,   bg: "bg-emerald-100", text: "text-emerald-600",dot: "bg-emerald-400"},
  completed:  { label: "Completed",  icon: CheckCircle,   bg: "bg-emerald-100", text: "text-emerald-600",dot: "bg-emerald-400"},
  rejected:   { label: "Rejected",   icon: XCircle,       bg: "bg-red-100",     text: "text-red-500",    dot: "bg-red-400"    },
};

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  deposit:  { label: "Deposit",  icon: ArrowDownLeft,  color: "text-emerald-500", bg: "bg-emerald-100", sign: "+"  },
  withdrawal:{ label: "Withdraw", icon: ArrowUpRight,   color: "text-red-500",     bg: "bg-red-100",     sign: "-"  },
  transfer: { label: "Transfer", icon: ArrowRightLeft, color: "text-blue-500",    bg: "bg-blue-100",    sign: "↕"  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function fmtAmount(amount) {
  return parseFloat(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gradient-to-r from-[#EEF0F5] via-[#F7F8FA] to-[#EEF0F5] bg-[length:400%_100%] rounded-lg ${className}`}
    style={{ animation: "shimmer 1.6s ease-in-out infinite" }} />;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Transaction Detail Modal ──────────────────────────────────────────────────
function DetailModal({ txn, onClose }) {
  if (!txn) return null;
  const type = TYPE_CONFIG[txn.type] ?? TYPE_CONFIG.deposit;
  const status = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.pending;
  const Icon = type.icon;

  const rows = [
    ["Type",        type.label],
    ["Amount",      `$${fmtAmount(txn.amount)} ${txn.currency ?? "USD"}`],
    ["Status",      <StatusBadge status={txn.status} />],
    ["Method",      txn.method ?? "—"],
    ...(txn.crypto_symbol  ? [["Coin",    txn.crypto_symbol]]  : []),
    ...(txn.crypto_address ? [["Address", <span className="font-mono text-xs break-all">{txn.crypto_address}</span>]] : []),
    ["Reference",   txn.reference ?? "—"],
    ["Date",        `${fmtDate(txn.created_at)} at ${fmtTime(txn.created_at)}`],
    ...(txn.updated_at && txn.updated_at !== txn.created_at
      ? [["Updated", `${fmtDate(txn.updated_at)} at ${fmtTime(txn.updated_at)}`]]
      : []),
    ...(txn.notes ? [["Notes", txn.notes]] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${type.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${type.color}`} />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-primary">
              {type.sign !== "↕" ? type.sign : ""}${fmtAmount(txn.amount)}
            </h2>
            <p className="text-xs text-[#8897A9]">{type.label} · {fmtDate(txn.created_at)}</p>
          </div>
        </div>

        {/* Status timeline */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${status.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot} ${txn.status === "processing" ? "animate-pulse" : ""}`} />
          <div>
            <p className={`text-xs font-bold ${status.text}`}>{status.label}</p>
            {txn.status === "pending" && (
              <p className="text-[10px] text-[#8897A9] mt-0.5">Awaiting admin review</p>
            )}
            {txn.status === "approved" || txn.status === "completed" ? (
              <p className="text-[10px] text-[#8897A9] mt-0.5">Transaction processed successfully</p>
            ) : null}
            {txn.status === "rejected" && txn.notes && (
              <p className="text-[10px] text-red-500 mt-0.5">{txn.notes}</p>
            )}
          </div>
        </div>

        {/* Details table */}
        <div className="space-y-3 mb-6">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 py-2 border-b border-surface-border last:border-0">
              <span className="text-xs text-[#8897A9] flex-shrink-0 font-medium">{k}</span>
              <span className="text-xs font-bold text-primary text-right break-all">{v}</span>
            </div>
          ))}
        </div>

        {/* Receipt link */}
        {txn.receipt_url && (
          <a href={txn.receipt_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-accent text-accent text-sm font-bold hover:bg-accent/5 transition-colors mb-3">
            <ExternalLink className="w-4 h-4" /> View Receipt
          </a>
        )}

        <button onClick={onClose}
          className="w-full py-3 rounded-xl border border-surface-border text-[#8897A9] text-sm font-bold hover:text-primary hover:border-[#8897A9] transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Transaction Row (desktop) ─────────────────────────────────────────────────
function TxnRow({ txn, onClick }) {
  const type   = TYPE_CONFIG[txn.type]   ?? TYPE_CONFIG.deposit;
  const Icon   = type.icon;
  const isDebit = txn.type === "withdrawal";

  return (
    <tr onClick={onClick}
      className="hover:bg-surface/40 cursor-pointer transition-colors border-b border-surface-border last:border-0">
      {/* Type icon */}
      <td className="px-6 py-4">
        <div className={`w-9 h-9 rounded-xl ${type.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${type.color}`} />
        </div>
      </td>
      {/* Description */}
      <td className="px-4 py-4">
        <div className="font-semibold text-sm text-primary">{type.label}</div>
        <div className="text-xs text-[#8897A9] mt-0.5 truncate max-w-[180px]">
          {txn.crypto_symbol
            ? `${txn.crypto_symbol} · ${txn.reference}`
            : txn.method
              ? `${txn.method.replace(/_/g, " ")} · ${txn.reference}`
              : txn.reference}
        </div>
      </td>
      {/* Amount */}
      <td className="px-4 py-4">
        <span className={`font-bold text-sm ${isDebit ? "text-red-500" : "text-emerald-600"}`}>
          {isDebit ? "−" : "+"} ${fmtAmount(txn.amount)}
        </span>
        <div className="text-[10px] text-[#8897A9]">{txn.currency ?? "USD"}</div>
      </td>
      {/* Status */}
      <td className="px-4 py-4"><StatusBadge status={txn.status} /></td>
      {/* Date */}
      <td className="px-4 py-4 text-right">
        <div className="text-xs font-medium text-primary">{fmtDate(txn.created_at)}</div>
        <div className="text-[10px] text-[#8897A9]">{fmtTime(txn.created_at)}</div>
      </td>
      {/* Receipt */}
      <td className="px-4 py-4 text-right">
        {txn.receipt_url ? (
          <a href={txn.receipt_url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1 justify-end">
            <ExternalLink className="w-3 h-3" /> Receipt
          </a>
        ) : <span className="text-[10px] text-[#DDE3EE]">—</span>}
      </td>
    </tr>
  );
}

// ── Transaction Card (mobile) ─────────────────────────────────────────────────
function TxnCard({ txn, onClick }) {
  const type    = TYPE_CONFIG[txn.type]   ?? TYPE_CONFIG.deposit;
  const Icon    = type.icon;
  const isDebit = txn.type === "withdrawal";

  return (
    <div onClick={onClick}
      className="bg-white border border-surface-border rounded-xl p-4 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${type.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${type.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm text-primary">{type.label}</span>
          <span className={`font-bold text-sm ${isDebit ? "text-red-500" : "text-emerald-600"}`}>
            {isDebit ? "−" : "+"} ${fmtAmount(txn.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-[10px] text-[#8897A9] truncate">
            {txn.crypto_symbol ? `${txn.crypto_symbol} · ` : ""}{txn.reference ?? txn.method}
          </span>
          <StatusBadge status={txn.status} />
        </div>
        <div className="text-[10px] text-[#8897A9] mt-1">{fmtDate(txn.created_at)}</div>
      </div>
    </div>
  );
}

// ── Summary stat cards ────────────────────────────────────────────────────────
function SummaryCards({ data }) {
  const deposits    = data.filter((t) => t.type === "deposit" && (t.status === "approved" || t.status === "completed"));
  const withdrawals = data.filter((t) => t.type === "withdrawal" && (t.status === "approved" || t.status === "completed"));
  const pending     = data.filter((t) => t.status === "pending");

  const totalDeposited   = deposits.reduce((s, t)    => s + parseFloat(t.amount), 0);
  const totalWithdrawn   = withdrawals.reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Deposited",  value: `$${fmtAmount(totalDeposited)}`,   icon: ArrowDownLeft,  color: "text-emerald-500", bg: "bg-emerald-100" },
        { label: "Total Withdrawn",  value: `$${fmtAmount(totalWithdrawn)}`,   icon: ArrowUpRight,   color: "text-red-500",     bg: "bg-red-100"     },
        { label: "Pending",          value: pending.length,                     icon: Clock,          color: "text-amber-600",   bg: "bg-amber-100"   },
        { label: "Total Txns",       value: data.length,                        icon: Receipt,        color: "text-accent",      bg: "bg-accent/10"   },
      ].map((s) => (
        <div key={s.label} className="bg-white border border-surface-border rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8897A9]">{s.label}</span>
          </div>
          <div className="font-display font-bold text-xl text-primary">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [txns,        setTxns]        = useState([]);
  const [allTxns,     setAllTxns]     = useState([]); // for summary stats (page 1 data)
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");
  const [meta,        setMeta]        = useState(null);
  const [selected,    setSelected]    = useState(null); // detail modal

  // Filters
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);

  const fetchTxns = useCallback(async (p = 1, silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await paymentService.getTransactions({
        type:   typeFilter,
        status: statusFilter,
        page:   p,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setTxns(data);
      setMeta(res.meta ?? null);
      setPage(p);
      // Store first-page data for summary (unfiltered for stats)
      if (p === 1 && typeFilter === "all" && !statusFilter) setAllTxns(data);
    } catch (err) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchTxns(1); }, [fetchTxns]);

  // Client-side search filter
  const displayed = txns.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.reference  ?? "").toLowerCase().includes(q) ||
      (t.method     ?? "").toLowerCase().includes(q) ||
      (t.crypto_symbol ?? "").toLowerCase().includes(q) ||
      (t.type       ?? "").toLowerCase().includes(q)
    );
  });

  const TYPE_FILTERS = [
    { key: "all",        label: "All" },
    { key: "deposit",    label: "Deposits" },
    { key: "withdrawal", label: "Withdrawals" },
    { key: "transfer",   label: "Transfers" },
  ];

  const STATUS_FILTERS = [
    { key: "",           label: "Any Status" },
    { key: "pending",    label: "Pending" },
    { key: "approved",   label: "Approved" },
    { key: "completed",  label: "Completed" },
    { key: "rejected",   label: "Rejected" },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>

      <div className="space-y-6 animate-fade-in">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-primary">Transaction History</h1>
            <p className="text-sm text-[#8897A9] mt-1">All your deposits, withdrawals and transfers.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => fetchTxns(page, true)}
              disabled={refreshing || loading}
              className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40">
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <Link to="/dashboard/funds"
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" /> Deposit
            </Link>
          </div>
        </div>

        {/* ── Summary stats ──────────────────────────────────────────────── */}
        {!loading && allTxns.length > 0 && <SummaryCards data={allTxns} />}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-surface-border rounded-xl p-5 shadow-card space-y-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Type tabs */}
          <div className="flex items-center gap-1 bg-white border border-surface-border rounded-xl p-1 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button key={f.key}
                onClick={() => { setTypeFilter(f.key); setPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${typeFilter === f.key ? "bg-primary text-white" : "text-[#8897A9] hover:text-primary"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field text-xs py-2 flex-shrink-0 sm:w-36">
            {STATUS_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8897A9]" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference, method…"
              className="input-field pl-9 text-sm py-2 w-full" />
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => fetchTxns(1)}
              className="text-xs font-bold text-red-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* ── Desktop table ───────────────────────────────────────────────── */}
        <div className="hidden md:block bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface/50 border-b border-surface-border">
                <tr>
                  {["", "Description", "Amount", "Status", "Date", "Receipt"].map((h, i) => (
                    <th key={h + i}
                      className={`px-${h === "" ? "6" : "4"} py-4 text-xs font-bold uppercase tracking-widest text-[#8897A9] ${i >= 4 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-surface-border">
                      <td className="px-6 py-4"><Skeleton className="w-9 h-9 rounded-xl" /></td>
                      <td className="px-4 py-4 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-3 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#8897A9]">
                        <Receipt className="w-10 h-10 opacity-30" />
                        <p className="font-semibold text-primary text-sm">No transactions found</p>
                        <p className="text-xs">
                          {typeFilter !== "all" || statusFilter || search
                            ? "Try adjusting your filters."
                            : <>Make your first <Link to="/dashboard/funds" className="text-accent font-bold hover:underline">deposit</Link>.</>}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((t) => (
                    <TxnRow key={`${t.type}-${t.id}`} txn={t} onClick={() => setSelected(t)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Mobile cards ────────────────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-surface-border rounded-xl p-4 flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : displayed.length === 0 ? (
            <div className="bg-white border border-dashed border-surface-border rounded-xl p-12 flex flex-col items-center text-center gap-3">
              <Receipt className="w-10 h-10 text-[#DDE3EE]" />
              <p className="font-semibold text-primary text-sm">No transactions found</p>
              <p className="text-xs text-[#8897A9]">
                {typeFilter !== "all" || statusFilter || search
                  ? "Try adjusting your filters."
                  : "Make your first deposit to get started."}
              </p>
              <Link to="/dashboard/funds" className="mt-2 btn-primary text-sm px-5 py-2.5">Deposit Now</Link>
            </div>
          ) : (
            displayed.map((t) => (
              <TxnCard key={`${t.type}-${t.id}`} txn={t} onClick={() => setSelected(t)} />
            ))
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-[#8897A9]">
              Showing {((meta.page - 1) * meta.per_page) + 1}–{Math.min(meta.page * meta.per_page, meta.total)} of <span className="font-bold text-primary">{meta.total}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTxns(page - 1)}
                disabled={page <= 1 || loading}
                className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="text-xs text-[#8897A9] px-1">…</span>
                  ) : (
                    <button key={p}
                      onClick={() => fetchTxns(p)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${page === p ? "bg-primary text-white" : "border border-surface-border text-[#8897A9] hover:text-accent hover:border-accent/40"}`}>
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => fetchTxns(page + 1)}
                disabled={page >= meta.last_page || loading}
                className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-[#8897A9] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {selected && <DetailModal txn={selected} onClose={() => setSelected(null)} />}
    </>
  );
}