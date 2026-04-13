import { useState, useEffect } from "react";
import { spreadsData, tickerData } from "../../data/mockData";
import { Badge } from "../../components/ui";
import { adminService } from "../../services/api";
import { Loader2, Save, CheckCircle } from "lucide-react";

export function AdminMarkets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Markets</h1>
        <p className="text-sm text-[#4A5568]">Live instrument overview and spread configuration.</p>
      </div>

      {/* Live prices */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h3 className="font-display font-bold text-base text-primary">Live Prices</h3>
          <Badge variant="teal">Live</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-surface-border">
                {["Pair", "Price", "Change", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {tickerData.map((t) => (
                <tr key={t.pair} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-primary">{t.pair}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-primary">{t.price}</td>
                  <td className={`px-5 py-3.5 font-semibold text-sm ${t.up ? "text-emerald-500" : "text-red-500"}`}>{t.change}</td>
                  <td className="px-5 py-3.5"><Badge variant="success">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spread config */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border">
          <h3 className="font-display font-bold text-base text-primary">Spread Configuration</h3>
          <p className="text-xs text-[#8897A9] mt-0.5">Manage display spreads shown to clients.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-surface-border">
                {["Instrument", "Category", "Our Spread", "Market Avg", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {spreadsData.map((row) => (
                <tr key={row.pair} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-primary">{row.pair}</td>
                  <td className="px-5 py-3.5 text-[#4A5568]">{row.category}</td>
                  <td className="px-5 py-3.5">
                    <input
                      defaultValue={row.ours}
                      className="w-20 px-2.5 py-1.5 rounded-[8px] border border-surface-border text-sm font-semibold text-teal focus:outline-none focus:border-accent transition-all"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-[#8897A9] font-semibold">{row.market}</td>
                  <td className="px-5 py-3.5">
                    <button className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-semibold rounded-[7px] hover:bg-accent hover:text-white transition-all">Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    adminService.getSettings().then(res => {
      setSettings(res.data || {});
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await adminService.updateSettings(settings);
      setMsg("Settings saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateKey = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Settings</h1>
          <p className="text-sm text-[#4A5568]">Platform configuration and admin account settings.</p>
        </div>
        {msg && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{msg}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform settings */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card p-6">
          <h3 className="font-display font-bold text-base text-primary mb-5">Platform Settings</h3>
          <form onSubmit={handleSave} className="space-y-5">
            {[
              { label: "Site Name", key: "site_name" },
              { label: "Site Logo (URL)", key: "site_logo" },
              { label: "Support Email", key: "support_email" },
              { label: "Default Currency", key: "default_currency" },
              { label: "Min Deposit (USD)", key: "min_deposit" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">{f.label}</label>
                <input
                  value={settings[f.key] || ""}
                  onChange={e => updateKey(f.key, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-surface-border text-sm text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Admin profile */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card p-6">
          <h3 className="font-display font-bold text-base text-primary mb-5">Admin Profile</h3>
          <div className="space-y-5">
            {[
              { label: "Full Name", value: "Admin User" },
              { label: "Email Address", value: "admin@vantageCFD.com" },
              { label: "Role", value: "Super Admin" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">{f.label}</label>
                <input
                  defaultValue={f.value}
                  className="w-full px-4 py-2.5 rounded-[10px] border border-surface-border text-sm text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">New Password</label>
              <input type="password" placeholder="Leave blank to keep current" className="w-full px-4 py-2.5 rounded-[10px] border border-surface-border text-sm text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
            <button className="btn-primary text-sm py-2.5 px-5">Update Profile</button>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-base text-primary mb-5">Feature Toggles</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Registration Open", key: "registration_open" },
              { label: "Copy Trading", key: "copy_trading_enabled" },
              { label: "Demo Accounts", key: "demo_accounts_enabled" },
              { label: "Promotions Active", key: "promotions_active" },
              { label: "Maintenance Mode", key: "maintenance_mode" },
              { label: "Email Notifications", key: "email_notifications" },
            ].map((t) => {
              const isOn = settings[t.key] === "1";
              return (
                <div key={t.key} className="flex items-center justify-between bg-surface border border-surface-border rounded-[10px] px-4 py-3">
                  <span className="text-sm font-medium text-primary">{t.label}</span>
                  <div
                    onClick={() => {
                       updateKey(t.key, isOn ? "0" : "1");
                       adminService.updateSettings({ [t.key]: isOn ? "0" : "1" });
                    }}
                    className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${isOn ? "bg-teal" : "bg-surface-border"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isOn ? "left-[22px]" : "left-0.5"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
