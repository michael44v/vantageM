import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Search, Loader2, Plus, Edit2, Trash2, Shield, X, Save } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";

export default function AdminSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', data: {} }

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSignals();
      setSignals(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      ...modal.data,
      user_id: fd.get("user_id"),
      name: fd.get("name"),
      description: fd.get("description"),
      roi: fd.get("roi"),
      win_rate: fd.get("win_rate"),
      drawdown: fd.get("drawdown"),
      status: fd.get("status"),
    };

    try {
      await adminService.upsertSignal(payload);
      setModal(null);
      fetchSignals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this signal?")) return;
    try {
      await adminService.deleteSignal(id);
      fetchSignals();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Copy Trading Signals</h1>
          <p className="text-sm text-[#4A5568]">Manage providers and their performance metrics.</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add', data: { status: 'active', roi: 0, win_rate: 0, drawdown: 0 } })}
          className="btn-primary py-2.5 px-5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-surface-border">
                  {["Provider", "ROI", "Win Rate", "Drawdown", "Subs", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {signals.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-primary">{s.name}</td>
                    <td className="px-5 py-4 font-mono text-emerald-600 font-bold">{s.roi}%</td>
                    <td className="px-5 py-4">{s.win_rate}%</td>
                    <td className="px-5 py-4 text-red-500 font-semibold">{s.drawdown}%</td>
                    <td className="px-5 py-4 font-medium">{s.subscribers}</td>
                    <td className="px-5 py-4">
                       <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link to={`/admin/copy-trading/${s.user_id}/copiers`} className="p-1.5 rounded-lg text-teal hover:bg-teal/50 transition-colors" title="View Copiers">
                           <Users className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setModal({ mode: 'edit', data: s })} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
             <h2 className="font-display font-extrabold text-xl text-primary mb-6">{modal.mode === 'add' ? 'Add' : 'Edit'} Signal Provider</h2>
             <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold uppercase text-[#8897A9]">Provider User ID</label>
                      <input name="user_id" type="number" defaultValue={modal.data.user_id} required className="input-field mt-1" />
                   </div>
                   <div>
                      <label className="text-xs font-bold uppercase text-[#8897A9]">Display Name</label>
                      <input name="name" defaultValue={modal.data.name} required className="input-field mt-1" />
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-[#8897A9]">Description</label>
                   <textarea name="description" defaultValue={modal.data.description} className="input-field mt-1 h-24 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <label className="text-xs font-bold uppercase text-[#8897A9]">ROI (%)</label>
                      <input name="roi" type="number" step="0.01" defaultValue={modal.data.roi} className="input-field mt-1" />
                   </div>
                   <div>
                      <label className="text-xs font-bold uppercase text-[#8897A9]">Win Rate (%)</label>
                      <input name="win_rate" type="number" step="0.01" defaultValue={modal.data.win_rate} className="input-field mt-1" />
                   </div>
                   <div>
                      <label className="text-xs font-bold uppercase text-[#8897A9]">Drawdown (%)</label>
                      <input name="drawdown" type="number" step="0.01" defaultValue={modal.data.drawdown} className="input-field mt-1" />
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#8897A9]">Status</label>
                  <select name="status" defaultValue={modal.data.status} className="input-field mt-1">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border border-surface-border font-semibold">Cancel</button>
                   <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-white font-bold">Save Provider</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
