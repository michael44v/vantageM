import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, Shield } from "lucide-react";
import { authService } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authService.requestPasswordReset(email);
      setSent(true);
      // In demo mode, we might show the token
      if (res.debug_token) {
        console.log("Demo Reset Token:", res.debug_token);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
          {!sent ? (
            <>
              <h2 className="text-2xl font-display font-extrabold text-primary mb-2 text-center">Forgot Password?</h2>
              <p className="text-sm text-[#8897A9] text-center mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#8897A9] uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8897A9]" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-[#DDE3EE] rounded-2xl text-primary placeholder-[#8897A9] focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-medium text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-sm font-bold text-white bg-accent hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-primary mb-2">Check Your Email</h2>
              <p className="text-sm text-[#8897A9] leading-relaxed mb-8">
                We've sent a password reset link to <span className="font-bold text-primary">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <div className="bg-surface border border-surface-border rounded-xl p-4 mb-8">
                 <p className="text-[10px] font-bold text-[#8897A9] uppercase tracking-wider mb-1">Didn't get the email?</p>
                 <button onClick={() => setSent(false)} className="text-xs font-bold text-accent hover:underline">Try another email address</button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#F4F6FA] text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-light transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
