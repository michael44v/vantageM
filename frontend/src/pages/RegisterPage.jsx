import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { Input } from "../components/ui";

const countries = [
  "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Ethiopia", "Tanzania",
  "Uganda", "Rwanda", "Botswana", "United Kingdom", "Germany", "France",
  "Australia", "Singapore", "UAE", "Saudi Arabia", "India", "Brazil", "Other",
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "", accountType: "standard", password: "", confirmPassword: "",
    agreeTerms: false, ageConfirm: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.includes("@")) e.email = "A valid email is required.";
    if (!form.country) e.country = "Please select your country.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.agreeTerms) e.agreeTerms = "You must accept the terms.";
    if (!form.ageConfirm) e.ageConfirm = "You must confirm you are 18 or older.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="bg-white border border-surface-border rounded-xl p-12 max-w-md w-full text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-teal/10 border-2 border-teal flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-teal" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-primary mb-3">Account Created</h2>
          <p className="text-[#4A5568] leading-relaxed mb-8">
            Your Vantage Markets account has been created successfully. Please check your email to verify your address before logging in.
          </p>
          <Link to="/login" className="btn-primary inline-block px-8 py-3">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left brand */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 border-r border-white/10 p-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[100px]" />
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-accent rounded-[9px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white"><path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" /></svg>
          </div>
          <span className="font-display font-extrabold text-xl text-white">Vantage Markets</span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-4xl text-white mb-6 leading-tight">
            Start Trading in<br /><span className="text-accent-light">Under 5 Minutes</span>
          </h2>
          <div className="space-y-4">
            {["No deposit fees on most methods", "Spreads from 0.0 pips on Raw ECN", "$50 minimum deposit to get started", "Demo account available instantly", "Regulated by ASIC, FCA, CIMA, VFSC"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-teal" />
                </div>
                <span className="text-sm text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/25 relative z-10">
          CFDs involve significant risk and may not be suitable for all investors. You could lose more than your initial investment.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? "bg-accent text-white" : "bg-surface-border text-[#8897A9]"}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-primary" : "text-[#8897A9]"}`}>
                  {s === 1 ? "Personal Details" : "Security"}
                </span>
                {s < 2 && <div className={`h-0.5 w-12 rounded ${step > s ? "bg-accent" : "bg-surface-border"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white border border-surface-border rounded-xl p-10 shadow-card">
            <h1 className="font-display font-extrabold text-3xl text-primary mb-2">
              {step === 1 ? "Create Your Account" : "Secure Your Account"}
            </h1>
            <p className="text-sm text-[#4A5568] mb-8">
              Already registered?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">Sign in here</Link>
            </p>

            {step === 1 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="James" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} error={errors.firstName} />
                  <Input label="Last Name" placeholder="Okonkwo" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} error={errors.lastName} />
                </div>
                <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
                <Input label="Phone Number (optional)" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Country of Residence</label>
                  <select
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className={`w-full px-4 py-3 rounded-[12px] border bg-white text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm ${errors.country ? "border-red-400" : "border-[#DDE3EE]"}`}
                  >
                    <option value="">Select your country</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <p className="text-xs text-red-500 font-medium">{errors.country}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Account Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ val: "standard", label: "Standard", sub: "0 commission" }, { val: "raw", label: "Raw ECN", sub: "0.0 pips" }, { val: "demo", label: "Demo", sub: "Virtual funds" }].map((t) => (
                      <label key={t.val} className={`border-2 rounded-[10px] p-3 cursor-pointer text-center transition-all ${form.accountType === t.val ? "border-accent bg-accent/5" : "border-surface-border hover:border-accent/40"}`}>
                        <input type="radio" name="accountType" value={t.val} checked={form.accountType === t.val} onChange={() => update("accountType", t.val)} className="sr-only" />
                        <div className="font-bold text-sm text-primary">{t.label}</div>
                        <div className="text-xs text-[#8897A9]">{t.sub}</div>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={handleNext} className="w-full py-3.5 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-accent-light transition-all hover:-translate-y-0.5">
                  Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="text-sm font-semibold text-primary block mb-1.5">Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={`w-full px-4 py-3 pr-11 rounded-[12px] border bg-white text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm ${errors.password ? "border-red-400" : "border-[#DDE3EE]"}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-[38px] text-[#8897A9] hover:text-primary transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password}</p>}
                </div>
                <Input label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} error={errors.confirmPassword} />

                <div className="space-y-3 pt-2">
                  {[
                    { field: "agreeTerms", label: <>I have read and agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>.</> },
                    { field: "ageConfirm", label: "I confirm that I am 18 years of age or older." },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form[field]} onChange={(e) => update(field, e.target.checked)} className="accent-accent mt-0.5 w-4 h-4 flex-shrink-0" />
                        <span className="text-sm text-[#4A5568] leading-relaxed">{label}</span>
                      </label>
                      {errors[field] && <p className="text-xs text-red-500 font-medium mt-1 pl-7">{errors[field]}</p>}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-[12px] bg-surface border border-surface-border text-primary font-semibold text-sm hover:border-accent hover:text-accent transition-all">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-accent-light transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
