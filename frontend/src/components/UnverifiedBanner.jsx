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
  const isUnverified = user && !user.email_verified_at;

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
     
    </>
  );
}