import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input, Button } from "../components/ui";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(form);
    setLoading(false);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin" : "/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-primary/80 border-r border-white/10 p-12 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-0 top-1/2 w-[200px] h-[200px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-accent rounded-[9px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
              <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl text-white">ABle Markets</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-4xl text-white mb-6 leading-tight">
            Welcome back to the<br />
            <span className="text-accent-light">Ultimate Trading Machine</span>
          </h2>
          <p className="text-white/55 leading-relaxed mb-10">
            Login to access your account, manage your portfolio, and trade 1,000+ instruments across global financial markets.
          </p>
          <div className="space-y-4">
            {[
              { val: "5,000,000+", lab: "Registered Traders" },
              { val: "From 0.0", lab: "Pip Spreads" },
              { val: "24/7", lab: "Customer Support" },
            ].map((s) => (
              <div key={s.lab} className="flex items-center gap-4">
                <div className="font-display font-extrabold text-xl text-accent-light w-28">{s.val}</div>
                <div className="text-sm text-white/50">{s.lab}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25 relative z-10">
          Demo credentials — Trader: trader@ablemarkets.com / trader123<br />
          Admin: admin@ablemarkets.com / admin123
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-[8px] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white"><path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" /></svg>
            </div>
            <span className="font-display font-extrabold text-lg text-primary">ABle Markets</span>
          </Link>

          <div className="bg-white border border-surface-border rounded-xl p-10 shadow-card">
            <h1 className="font-display font-extrabold text-3xl text-primary mb-2">Sign In</h1>
            <p className="text-sm text-[#4A5568] mb-8">
              No account yet?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">
                Register here
              </Link>
            </p>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm font-semibold text-primary">Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-[12px] border border-[#DDE3EE] bg-white text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-[38px] text-[#8897A9] hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-accent" />
                  <span className="text-sm text-[#4A5568]">Remember me</span>
                </label>
                <a href="#" className="text-sm text-accent font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-accent-light transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-border text-center">
              <p className="text-xs text-[#8897A9]">
                By signing in you agree to our{" "}
                <a href="#" className="text-accent hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
