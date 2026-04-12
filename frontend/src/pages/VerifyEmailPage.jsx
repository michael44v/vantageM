import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, Mail } from "lucide-react";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const token           = searchParams.get("token") ?? "";

  const [status, setStatus]   = useState("loading"); // loading|success|already|expired|invalid
  const [message, setMessage] = useState("");
  const [userId, setUserId]   = useState(null);
  const [resending, setResending]   = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [countdown, setCountdown]  = useState(5);

  useEffect(() => {
    if (!token) { setStatus("invalid"); setMessage("No verification token found in the link."); return; }
    verify();
  }, [token]);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (status !== "success") return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); navigate("/dashboard"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  const verify = async () => {
    setStatus("loading");
    try {
      const res = await authService.verifyEmailToken(token);
      if (res.already) {
        setStatus("already");
        setMessage(res.message);
      } else {
        setStatus("success");
        setMessage(res.message);
        login(res.user, res.token);
      }
    } catch (err) {
      if (err.message?.includes("expired")) {
        setStatus("expired");
        // Try to extract user_id from error if backend returns it
      } else {
        setStatus("invalid");
      }
      setMessage(err.message || "Verification failed.");
    }
  };

  const handleResend = async () => {
    if (!userId || resending) return;
    setResending(true);
    try {
      await authService.resendVerification(userId);
      setResendDone(true);
    } catch (err) {
      setMessage(err.message || "Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-accent rounded-[9px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
              <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl text-white">Vantage Markets</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* ── Loading ──────────────────────────────────────────────── */}
          {status === "loading" && (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              </div>
              <h1 className="font-display font-bold text-2xl text-primary mb-2">Verifying Your Email</h1>
              <p className="text-sm text-[#8897A9]">Please wait while we confirm your email address…</p>
            </div>
          )}

          {/* ── Success ──────────────────────────────────────────────── */}
          {status === "success" && (
            <>
              {/* Green top bar */}
              <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-bounce-once">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-primary mb-3">
                  Email Verified! 🎉
                </h1>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-8 max-w-xs">
                  Your Vantage Markets account is now fully active. You're ready to trade global markets.
                </p>

                {/* Features unlocked */}
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 text-left space-y-2">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">What's now unlocked</p>
                  {[
                    "Full access to 1,000+ trading instruments",
                    "Deposits, withdrawals and transfers",
                    "Copy trading and signal providers",
                    "KYC verification for higher limits",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-emerald-800">{item}</span>
                    </div>
                  ))}
                </div>

                <Link to="/dashboard"
                  className="w-full py-3.5 rounded-[12px] bg-accent text-primary font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4">
                  Go to Dashboard
                </Link>
                <p className="text-xs text-[#8897A9]">
                  Redirecting automatically in <span className="font-bold text-primary">{countdown}s</span>
                </p>
              </div>
            </>
          )}

          {/* ── Already verified ─────────────────────────────────────── */}
          {status === "already" && (
            <>
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-500" />
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-blue-500" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-primary mb-3">Already Verified</h1>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-8">
                  Your email address is already confirmed. You can log in to your account.
                </p>
                <Link to="/login"
                  className="w-full py-3.5 rounded-[12px] bg-accent text-primary font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center">
                  Go to Login
                </Link>
              </div>
            </>
          )}

          {/* ── Expired ──────────────────────────────────────────────── */}
          {status === "expired" && (
            <>
              <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-primary mb-3">Link Expired</h1>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-8">
                  This verification link has expired (links are valid for 24 hours). Request a new one below.
                </p>
                {!resendDone ? (
                  <button onClick={handleResend} disabled={resending || !userId}
                    className="w-full py-3.5 rounded-[12px] bg-accent text-primary font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4">
                    {resending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>}
                  </button>
                ) : (
                  <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">New verification email sent! Check your inbox.</p>
                  </div>
                )}
                <Link to="/login" className="text-sm text-accent font-bold hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {/* ── Invalid ──────────────────────────────────────────────── */}
          {status === "invalid" && (
            <>
              <div className="h-2 bg-gradient-to-r from-red-400 to-red-500" />
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-primary mb-3">Invalid Link</h1>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-8">
                  {message || "This verification link is invalid or has already been used."}
                </p>
                <Link to="/login"
                  className="w-full py-3.5 rounded-[12px] bg-accent text-primary font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center mb-4">
                  Back to Login
                </Link>
                <Link to="/register" className="text-sm text-[#8897A9] hover:text-primary transition-colors">
                  Create a new account
                </Link>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          © 2026 Vantage Markets · Regulated by ASIC · FCA · CIMA
        </p>
      </div>
    </div>
  );
}