import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { authService } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authService.resetPassword({ email, token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-[#DDE3EE]">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-display font-extrabold text-primary mb-2">Invalid Link</h2>
          <p className="text-[#8897A9] text-sm mb-8">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" title="Go to forgot password page" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
           <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Shield className="w-6 h-6 text-white" />
           </div>
           <span className="font-display font-extrabold text-2xl text-primary tracking-tight">vāntãgeCFD</span>
        </Link>

        <div className="bg-white py-10 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#DDE3EE]">
          {!done ? (
            <>
              <h2 className="text-2xl font-display font-extrabold text-primary mb-2 text-center">Reset Password</h2>
              <p className="text-sm text-[#8897A9] text-center mb-8">
                Create a new, strong password for your account.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-[#8897A9] uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8897A9]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-[#DDE3EE] rounded-2xl text-primary placeholder-[#8897A9] focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-medium text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8897A9] uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8897A9]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-[#DDE3EE] rounded-2xl text-primary placeholder-[#8897A9] focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-medium text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-accent hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-primary mb-2">Success!</h2>
              <p className="text-sm text-[#8897A9] leading-relaxed mb-8">
                Your password has been reset successfully. Redirecting you to login...
              </p>
              <Link to="/login" className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center">
                Log In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
