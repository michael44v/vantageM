import { useState, useEffect } from "react";
import { Search, Eye, Ban, Trash2, Edit2, Loader2, DollarSign, Download } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";

function statusVariant(s) {
  return { Active: "success", Pending: "warning", Suspended: "danger" }[s] || "neutral";
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Country", "Balance", "Role", "Status", "Joined"];
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = filtered.map(u => [
      u.id,
      u.name,
      u.email,
      u.country,
      u.wallet_balance,
      u.role,
      u.status,
      u.created_at
    ].map(escape));

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchUsers = async () => {

    setLoading(true);
    try {
      const res = await adminService.getUsers(1, 100);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userData) => {
    try {
      await adminService.updateUser(userData);
      setEditing(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = fd.get("amount");
    const type = fd.get("type");
    try {
      await adminService.adjustBalance(adjusting, amount, type);
      setAdjusting(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    await handleUpdate({ ...user, status: newStatus });
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.country || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Users</h1>
          <p className="text-sm text-[#4A5568]">{users.length} registered accounts</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
        <div className="flex flex-wrap gap-2">
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

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-surface-border">
                {["User", "Country", "Account Type", "Balance", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {u.name ? u.name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-primary text-sm">{u.name}(USER_ID: {u.id})</div>
                        <div className="text-xs text-[#8897A9]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                
                  <td className="px-5 py-4 text-sm text-[#4A5568]">{u.country}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-primary bg-surface border border-surface-border px-2.5 py-1 rounded-full">
                      {u.account || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary text-sm">
                    ${parseFloat(u.wallet_balance || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#8897A9]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(u)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-teal/10 hover:text-teal transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditing(u)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-blue-50 hover:text-blue-600 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAdjusting(u.id)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-teal/10 hover:text-teal transition-all"
                        title="Adjust Balance"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="p-1.5 rounded-[8px] text-[#4A5568] hover:bg-amber-50 hover:text-amber-600 transition-all"
                        title={u.status === "active" ? "Suspend" : "Activate"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 rounded-[8px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
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

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-surface-border">
          {filtered.map((u) => (
            <div key={u.id} className="p-4 space-y-3">
              {/* Top row: avatar + name + status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {u.name ? u.name[0].toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-primary text-sm truncate">{u.name}</div>
                    <div className="text-xs text-[#8897A9] truncate">{u.email}</div>
                  </div>
                </div>
                <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs bg-surface rounded-[10px] p-3">

                <span className="text-[#8897A9]">UID</span>
                <span className="text-primary font-medium">{u.id}</span>

                <span className="text-[#8897A9]">Country</span>
                <span className="text-primary font-medium">{u.country}</span>

                <span className="text-[#8897A9]">Account</span>
                <span className="text-primary font-medium">{u.account || u.role}</span>

                <span className="text-[#8897A9]">Balance</span>
                <span className="text-primary font-semibold">
                  ${parseFloat(u.wallet_balance || 0).toLocaleString()}
                </span>

                <span className="text-[#8897A9]">Joined</span>
                <span className="text-primary">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  onClick={() => setSelected(u)}
                  className="p-2 rounded-[8px] text-[#4A5568] hover:bg-teal/10 hover:text-teal transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditing(u)}
                  className="p-2 rounded-[8px] text-[#4A5568] hover:bg-blue-50 hover:text-blue-600 transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAdjusting(u.id)}
                  className="p-2 rounded-[8px] text-[#4A5568] hover:bg-teal/10 hover:text-teal transition-all"
                  title="Adjust Balance"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleStatus(u)}
                  className="p-2 rounded-[8px] text-[#4A5568] hover:bg-amber-50 hover:text-amber-600 transition-all"
                  title={u.status === "active" ? "Suspend" : "Activate"}
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="p-2 rounded-[8px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-[#8897A9]">
              No users match your search criteria.
            </div>
          )}
        </div>

        {/* Footer pagination */}
        <div className="px-5 py-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-xs text-[#8897A9]">
            Showing {filtered.length} of {users.length} users
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-[6px] text-xs font-semibold transition-all ${
                  p === 1
                    ? "bg-accent text-white"
                    : "bg-surface text-[#4A5568] hover:bg-surface-border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {adjusting && (
        <div
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setAdjusting(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-sm w-full shadow-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-extrabold text-xl text-primary mb-6">Adjust Balance</h2>
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#8897A9]">Amount ($)</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  className="input-field mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#8897A9]">Type</label>
                <select name="type" className="input-field mt-1">
                  <option value="add">Add Funds</option>
                  <option value="deduct">Deduct Funds</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAdjusting(null)}
                  className="flex-1 py-2.5 rounded-[10px] border border-surface-border text-[#4A5568] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-[10px] bg-accent text-white font-semibold"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-extrabold text-xl text-primary mb-6">Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleUpdate({
                  ...editing,
                  name: fd.get("name"),
                  email: fd.get("email"),
                  role: fd.get("role"),
                  status: fd.get("status"),
                  wallet_balance: fd.get("balance"),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold uppercase text-[#8897A9]">Name</label>
                <input name="name" defaultValue={editing.name} className="input-field mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#8897A9]">Email</label>
                <input name="email" defaultValue={editing.email} className="input-field mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#8897A9]">Role</label>
                  <select name="role" defaultValue={editing.role} className="input-field mt-1">
                    <option value="trader">Trader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#8897A9]">Status</label>
                  <select name="status" defaultValue={editing.status} className="input-field mt-1">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#8897A9]">Wallet Balance ($)</label>
                <input
                  name="balance"
                  type="number"
                  step="0.01"
                  defaultValue={editing.wallet_balance}
                  className="input-field mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 rounded-[10px] border border-surface-border text-[#4A5568] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-[10px] bg-accent text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent font-display font-extrabold text-xl flex items-center justify-center flex-shrink-0">
                {selected.name ? selected.name[0].toUpperCase() : "?"}
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-extrabold text-xl text-primary truncate">
                  {selected.name}
                </h2>
                <div className="text-sm text-[#4A5568] truncate">{selected.email}</div>
              </div>
              <div className="ml-auto flex-shrink-0">
                <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
              </div>
            </div>
            <div className="space-y-0 divide-y divide-surface-border">
              {[
                ["Country", selected.country],
                ["Account Type", selected.account || selected.role],
                ["Balance", "$" + parseFloat(selected.wallet_balance || 0).toLocaleString()],
                ["Member Since", new Date(selected.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <span className="text-sm text-[#8897A9]">{k}</span>
                  <span className="text-sm font-semibold text-primary">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  toggleStatus(selected);
                  setSelected(null);
                }}
                className="flex-1 py-2.5 rounded-[10px] border border-amber-300 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-all"
              >
                {selected.status === "active" ? "Suspend User" : "Activate User"}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}