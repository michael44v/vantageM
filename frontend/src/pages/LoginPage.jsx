import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, TrendingUp, Shield, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { value: "5M+",    label: "Registered Traders" },
  { value: "0.0",    label: "Pip Spreads From" },
  { value: "1,000+", label: "Tradable Instruments" },
  { value: "24/7",   label: "Customer Support" },
];

const FEATURES = [
  { icon: TrendingUp, text: "Real-time market execution" },
  { icon: Shield,     text: "Segregated client funds" },
  { icon: Zap,        text: "Lightning-fast order routing" },
];

export default function LoginPage() {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    

    setLoading(true);
    try {
      const res = await login(form);
      if (res.success) {
       // navigate(res.role === "admin" ? "/admin" : "/dashboard");
        const from = location.state?.from?.pathname;
      const defaultRoute = res.role === "admin" ? "/admin" : "/dashboard";
      navigate(from || defaultRoute, { replace: true });
      } else {
        setError(res.error || "Invalid email or password.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">

      {/* ── Left brand panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-primary/80 border-r border-white/10 p-12 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-0 top-1/2 w-[200px] h-[200px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-accent rounded-[9px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
              <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl text-white tracking-tight">
            Vantage Markets
          </span>
        </Link>

        {/* Headline + features */}
        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-4xl text-white mb-4 leading-tight">
            Welcome back to the<br />
            <span className="text-accent-light">Ultimate Trading Machine</span>
          </h2>
          <p className="text-white/50 leading-relaxed mb-10 text-sm">
            Access your account, manage your portfolio, and trade across
            global financial markets — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 mb-10">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-accent-light" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <div className="font-display font-extrabold text-xl text-accent-light">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/20 relative z-10">
          © {new Date().getFullYear()} Vantage Markets. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-[8px] flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg text-primary">Vantage Markets</span>
          </Link>

          <div className="bg-white border border-surface-border rounded-2xl p-10 shadow-card">
            <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Sign In</h1>
            <p className="text-sm text-[#4A5568] mb-8">
              No account yet?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">
                Create one free
              </Link>
            </p>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#DDE3EE] bg-white text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange("password")}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 rounded-[12px] border border-[#DDE3EE] bg-white text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8897A9] hover:text-primary transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="accent-accent w-3.5 h-3.5" />
                  <span className="text-sm text-[#4A5568]">Remember me</span>
                </label>
                <a href="#" className="text-sm text-accent font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-accent-light transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Footer note */}
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