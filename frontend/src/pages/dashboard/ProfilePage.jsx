import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { User, Mail, Phone, Globe, Camera, Loader2, CheckCircle } from "lucide-react";

const CLOUDINARY_CLOUD  = "dguvkirdr";
const CLOUDINARY_PRESET = "futyApp";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    country: user?.country || "",
    profile_image: user?.profile_image || ""
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      formData.append("folder", "vantage_profiles");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setForm(prev => ({ ...prev, profile_image: data.secure_url }));
      setMsg("Image uploaded! Don't forget to save changes.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await authService.updateProfile(form);
      // Update local context
      login({ ...user, ...form });
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Account Settings</h1>
          <p className="text-sm text-[#4A5568]">Manage your personal information and profile picture.</p>
        </div>
        {msg && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{msg}</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl shadow-card p-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface border-4 border-white shadow-sm flex items-center justify-center">
                {form.profile_image ? (
                  <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#8897A9]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h3 className="font-display font-bold text-lg text-primary">{user?.name}</h3>
            <p className="text-sm text-[#8897A9]">{user?.email}</p>
            <div className="mt-4 pt-4 border-t border-surface-border flex justify-around text-center">
              <div>
                <p className="text-xs font-bold text-[#8897A9] uppercase tracking-wider mb-1">Role</p>
                <span className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full uppercase">{user?.role}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#8897A9] uppercase tracking-wider mb-1">Status</p>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2">
          <div className="bg-white border border-surface-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border bg-surface/30">
              <h3 className="font-display font-bold text-primary">Personal Details</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
                    <input
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-primary focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
                    <input
                      disabled
                      value={user?.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-[#8897A9] bg-surface cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
                    <input
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-primary focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8897A9]" />
                    <input
                      value={form.country}
                      onChange={e => setForm({...form, country: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-primary focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-1.5">Profile Image URL</label>
                <input
                  value={form.profile_image}
                  onChange={e => setForm({...form, profile_image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm text-primary focus:outline-none focus:border-accent transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-2.5 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
