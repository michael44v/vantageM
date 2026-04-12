import { useState, useEffect, useCallback } from "react";
import { User, ShieldCheck, Mail, Globe, Phone, FileText, Upload, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import { kycService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DOC_TYPES = [
  { value: "identity", label: "ID Card / Passport",   hint: "Government-issued photo ID" },
  { value: "address",  label: "Proof of Address",      hint: "Utility bill or bank statement (3 months)" },
];

const STATUS_STYLES = {
  approved: "bg-emerald-100 text-emerald-600",
  pending:  "bg-amber-100 text-amber-600",
  rejected: "bg-red-100 text-red-500",
};

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in-up text-white ${type === "success" ? "bg-primary" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

const CLOUDINARY_CLOUD  = "dguvkirdr";
const CLOUDINARY_PRESET = "futyApp";

function UploadZone({ docType, onUploaded, disabled }) {
  const [file,     setFile]     = useState(null);
  const [progress, setProgress] = useState(""); // "cloudinary"|"saving"|""
  const [error,    setError]    = useState("");

  const handleFile = async (raw) => {
    if (!raw) return;
    if (raw.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return; }
    setFile(raw);
    setError("");

    try {
      // Step 1 — Cloudinary only
      setProgress("cloudinary");
      const form = new FormData();
      form.append("file",          raw);
      form.append("upload_preset", CLOUDINARY_PRESET);
      form.append("folder",        "vantage_kyc");

      const cfRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
        { method: "POST", body: form }
      );
      if (!cfRes.ok) {
        const e = await cfRes.json();
        throw new Error(e.error?.message || "Cloudinary upload failed.");
      }
      const { secure_url, public_id } = await cfRes.json();

      // Step 2 — Send only the URL to backend (no file re-upload)
      setProgress("saving");
      await kycService.registerDocument({ docType, fileUrl: secure_url, publicId: public_id });

      setProgress("");
      onUploaded();
    } catch (err) {
      setError(err.message || "Upload failed.");
      setProgress("");
    }
  };

  const label = progress === "cloudinary" ? "Uploading to cloud…"
              : progress === "saving"     ? "Saving document…"
              : null;

  return (
    <div className="space-y-2">
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-colors
        ${error ? "border-red-300 bg-red-50" : "border-surface-border hover:border-accent"}
        ${disabled || progress ? "opacity-50 pointer-events-none" : ""}`}>
        <input type="file" className="sr-only" accept="image/*,application/pdf"
          disabled={disabled || !!progress}
          onChange={(e) => handleFile(e.target.files?.[0])} />
        {label ? (
          <><Loader2 className="w-8 h-8 text-accent animate-spin mb-2" /><p className="text-sm font-bold text-primary">{label}</p></>
        ) : file && !error ? (
          <><CheckCircle className="w-8 h-8 text-emerald-500 mb-2" /><p className="text-sm font-bold text-primary">{file.name}</p><p className="text-xs text-[#8897A9]">Click to replace</p></>
        ) : (
          <><Upload className="w-8 h-8 text-[#8897A9] group-hover:text-accent mb-2 transition-colors" /><p className="text-sm font-bold text-primary">Click to upload or drag & drop</p><p className="text-xs text-[#8897A9]">PNG, JPG, PDF up to 10MB</p></>
        )}
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
export default function KYCSection() {
  const { user } = useAuth();
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [uploading, setUploading] = useState(false);

  // Which docType is open for upload
  const [activeUpload, setActiveUpload] = useState(null); // "identity" | "address" | null

// In KYCSection.jsx — update fetchDocs:
const fetchDocs = useCallback(async () => {
  setLoading(true);
  try {
    const res = await kycService.getDocuments(); // was getStatus()
    setDocs(Array.isArray(res.data) ? res.data : []);
  } catch (_) {}
  finally { setLoading(false); }
}, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // Overall KYC status derived from docs
  const overallStatus = (() => {
    if (docs.length === 0) return "pending";
    if (docs.some((d) => d.status === "rejected")) return "rejected";
    if (docs.every((d) => d.status === "approved")) return "approved";
    return "under_review";
  })();

  const statusLabel = {
    pending:      "Pending",
    under_review: "Under Review",
    approved:     "Approved ✓",
    rejected:     "Action Required",
  }[overallStatus];

  const statusStyle = {
    approved:     "bg-emerald-100 text-emerald-600",
    under_review: "bg-blue-100 text-blue-600",
    rejected:     "bg-red-100 text-red-500",
    pending:      "bg-amber-100 text-amber-600",
  }[overallStatus];

  const handleUploaded = () => {
    setActiveUpload(null);
    setToast({ message: "Document uploaded successfully. Under review within 24 hours.", type: "success" });
    fetchDocs();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-extrabold text-2xl text-primary">Profile & Verification</h1>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${statusStyle}`}>
          <ShieldCheck className="w-4 h-4" /> KYC: {statusLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8897A9]">Personal Information</h3>
            {[
              { icon: User,   value: user?.name  || "—" },
              { icon: Mail,   value: user?.email || "—" },
              { icon: Phone,  value: user?.phone || "Not provided" },
              { icon: Globe,  value: user?.country || "—" },
            ].map(({ icon: Icon, value }) => (
              <div key={value} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#8897A9] flex-shrink-0" />
                <span className="text-sm text-[#4A5568] break-all">{value}</span>
              </div>
            ))}
            <button className="w-full btn-ghost text-xs py-2 mt-2">Edit Profile</button>
          </div>
        </div>

        {/* Verification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-border rounded-xl p-6 sm:p-8 shadow-card space-y-6">
            <h3 className="font-display font-bold text-lg text-primary">Identity Verification</h3>

            {/* Doc list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-[#EEF0F5] animate-pulse" />)}
              </div>
            ) : docs.length === 0 ? (
              <p className="text-sm text-[#8897A9]">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-border gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-primary capitalize">{doc.document_type === "identity" ? "ID / Passport" : "Proof of Address"}</div>
                        <div className="text-[10px] text-[#8897A9]">{new Date(doc.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.status === "rejected" && doc.rejection_reason && (
                        <span className="text-xs text-red-500 max-w-[160px] truncate" title={doc.rejection_reason}>
                          {doc.rejection_reason}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[doc.status] ?? "bg-surface text-[#8897A9]"}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload buttons per type */}
            <div className="space-y-4 border-t border-surface-border pt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8897A9]">Upload Documents</p>
              {DOC_TYPES.map((dt) => {
                const existing = docs.find((d) => d.document_type === dt.value);
                const isOpen   = activeUpload === dt.value;
                return (
                  <div key={dt.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-primary">{dt.label}</p>
                        <p className="text-xs text-[#8897A9]">{dt.hint}</p>
                      </div>
                      {existing?.status === "approved"
                        ? <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>
                        : (
                          <button
                            onClick={() => setActiveUpload(isOpen ? null : dt.value)}
                            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                          >
                            {isOpen ? <><X className="w-3 h-3" /> Cancel</> : <><Upload className="w-3.5 h-3.5" /> {existing ? "Re-upload" : "Upload"}</>}
                          </button>
                        )
                      }
                    </div>
                    {isOpen && (
                      <UploadZone
                        docType={dt.value}
                        onUploaded={handleUploaded}
                        disabled={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}