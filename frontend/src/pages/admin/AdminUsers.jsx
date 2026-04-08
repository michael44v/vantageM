import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Eye, Ban, Trash2, Loader2 } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge, Input } from "../../components/ui";

function statusVariant(s) {
  return { Active: "success", Pending: "warning", Suspended: "danger" }[s] || "neutral";
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Users</h1>
          <p className="text-sm text-[#4A5568]">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-surface-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
          <input
            placeholder="Search by name, email, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-surface-border text-sm text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-[10px] text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? "bg-accent text-white border-accent"
                  : "bg-surface border-surface-border text-[#4A5568] hover:border-accent hover:text-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-surface-border">
                {["User", "Country", "Account Type", "Balance", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                  </td>
                </tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-primary text-sm">{u.name}</div>
                        <div className="text-xs text-[#8897A9]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4A5568]">{u.country}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-primary bg-surface border border-surface-border px-2.5 py-1 rounded-full capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary text-sm">${parseFloat(u.wallet_balance).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#8897A9]">{u.joined}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelected(u)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-teal/10 hover:text-teal transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-amber-50 hover:text-amber-600 transition-all"
                        title={u.status === "Active" ? "Suspend" : "Activate"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8897A9]">
                    No users match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-xs text-[#8897A9]">Showing {filtered.length} of {users.length} users</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-[6px] text-xs font-semibold transition-all ${p === 1 ? "bg-accent text-white" : "bg-surface text-[#4A5568] hover:bg-surface-border"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent font-display font-extrabold text-xl flex items-center justify-center">
                {selected.name[0]}
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-primary">{selected.name}</h2>
                <div className="text-sm text-[#4A5568]">{selected.email}</div>
              </div>
              <div className="ml-auto">
                <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
              </div>
            </div>
            <div className="space-y-0 divide-y divide-surface-border">
              {[
                ["Country", selected.country],
                ["Account Type", selected.account],
                ["Balance", selected.balance],
                ["Member Since", selected.joined],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <span className="text-sm text-[#8897A9]">{k}</span>
                  <span className="text-sm font-semibold text-primary">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { toggleStatus(selected.id); setSelected(null); }}
                className="flex-1 py-2.5 rounded-[10px] border border-amber-300 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-all"
              >
                {selected.status === "Active" ? "Suspend User" : "Activate User"}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
