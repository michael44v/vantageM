import { useState, useEffect } from "react";
import { Mail, X, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

export default function UnverifiedBanner() {
  const { user }          = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState("");

  // Only show if email_verified_at is null/missing
  const isUnverified = user && !user.email_verified_at && !dismissed;

  // Check dismissed state in sessionStorage so it re-appears next login
  useEffect(() => {
    if (sessionStorage.getItem("vm_verify_dismissed")) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("vm_verify_dismissed", "1");
    setDismissed(true);
  };

  const handleResend = async () => {
    if (!user?.id || resending) return;
    setResending(true); setError("");
    try {
      await authService.resendVerification(user.id);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  if (!isUnverified) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-fade-in-up overflow-hidden">

          {/* Top amber bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

          <div className="p-8">
            {/* Close */}
            <button onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#8897A9] hover:text-primary hover:bg-surface transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="font-display font-extrabold text-xl text-primary text-center mb-2">
              Verify Your Email Address
            </h2>
            <p className="text-sm text-[#4B5563] text-center leading-relaxed mb-6">
              We sent a confirmation link to{" "}
              <span className="font-bold text-primary">{user?.email}</span>.
              Click it to activate your account and unlock all features.
            </p>

            {/* What's locked */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Locked until verified</p>
              {[
                "Deposits and withdrawals",
                "KYC document submission",
                "Copy trading",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-800">{item}</span>
                </div>
              ))}
            </div>

            {/* Success state */}
            {sent ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Email sent!</p>
                  <p className="text-xs text-emerald-600">Check your inbox and spam folder.</p>
                </div>
              </div>
            ) : (
              <>
                {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
                <button onClick={handleResend} disabled={resending}
                  className="w-full py-3 rounded-xl bg-accent text-primary font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-3">
                  {resending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>}
                </button>
              </>
            )}

            <button onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl border border-surface-border text-[#8897A9] text-sm font-medium hover:text-primary hover:border-[#8897A9] transition-colors">
              Remind me later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}