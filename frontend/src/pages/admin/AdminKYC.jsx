import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Shield, FileText, ExternalLink, Loader2 } from "lucide-react";
import { adminService } from "../../services/api";

export default function AdminKYC() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    try {
      const res = await adminService.getAllKYC();
      setKycRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await adminService.approveKYC(id, status);
      alert(`KYC ${status} successfully.`);
      fetchKYC();
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-[#111111]">KYC Approvals</h1>
        <p className="text-sm text-[#4A5568] mt-1">Review and approve trader identity and address documents.</p>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E0E0E0]">
            <tr>
              {["Trader", "Document Type", "Submitted", "Status", "Actions"].map((h) => (
                <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#666666] ${h === "Actions" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                </td>
              </tr>
            ) : kycRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-[#8897A9]">
                  No KYC requests found.
                </td>
              </tr>
            ) : kycRequests.map((req) => (
              <tr key={req.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-bold text-[#111111] text-sm">{req.user_name}</div>
                  <div className="text-xs text-[#8897A9] mt-0.5 font-medium uppercase tracking-tighter">USER-ID: {req.user_id}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFC800]/10 flex items-center justify-center text-[#CCA000]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#111111] capitalize">{req.document_type}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[#4A5568] font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                     req.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : req.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                   }`}>
                      {req.status}
                   </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={req.file_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[#8897A9] hover:bg-[#F8F8F8] hover:text-[#111111] transition-all" title="View Document">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(req.id, 'approved')} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleApprove(req.id, 'rejected')} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
