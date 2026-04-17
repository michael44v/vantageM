import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Shield, FileText, ExternalLink, Loader2, Calendar, User } from "lucide-react";
import { adminService } from "../../services/api";

export default function AdminKYC() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const res = await adminService.getKYCRequests();
      setKycRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await adminService.approveKYC(id);
      fetchKYC();
    } catch (err) {
      alert(err.message);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason:");
    if (reason === null) return;
    try {
      await adminService.rejectKYC(id, reason);
      fetchKYC();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-[#111111]">KYC Approvals</h1>
        <p className="text-sm text-[#4A5568] mt-1">Review and approve trader identity and address documents.</p>
      </div>

      {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white border border-[#E0E0E0] rounded-xl shadow-card overflow-hidden">
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
            {kycRequests.map((req) => (
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
                    <span className="font-bold text-[#111111]">{req.document_type}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[#4A5568] font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                     req.status?.toLowerCase() === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                   }`}>
                      {req.status}
                   </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={req.file_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[#8897A9] hover:bg-[#F8F8F8] hover:text-[#111111] transition-all" title="View Document">
                      <Eye className="w-4 h-4" />
                    </a>
                    {req.status?.toLowerCase() === 'pending' && (
                      <>
                        <button onClick={() => approve(req.id)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => reject(req.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Reject">
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

      {/* --- MOBILE LIST VIEW (Visible only on Mobile) --- */}
      <div className="md:hidden space-y-4">
        {kycRequests.map((req) => (
          <div key={req.id} className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm space-y-4">
            {/* Header: Name & Status */}
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-[#111111] text-base">{req.user_name}</div>
                <div className="text-[10px] text-[#8897A9] font-medium uppercase tracking-tighter">ID: {req.user_id}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                req.status?.toLowerCase() === 'approved'
                 ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                 : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                 {req.status}
              </span>
            </div>

            {/* Content: Doc Type & Date */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#F0F0F0]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[#666666] font-bold tracking-widest">Document</span>
                <div className="flex items-center gap-2 text-[#111111] font-bold text-xs">
                   <FileText className="w-3.5 h-3.5 text-[#CCA000]" />
                   {req.document_type}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[#666666] font-bold tracking-widest">Submitted</span>
                <div className="flex items-center gap-2 text-[#4A5568] font-medium text-xs">
                   <Calendar className="w-3.5 h-3.5" />
                   {new Date(req.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Actions: Large buttons for mobile tapping */}
            <div className="flex gap-2 pt-1">
              <a 
                href={req.file_url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F8F8F8] text-[#111111] rounded-lg text-xs font-bold border border-[#E0E0E0]"
              >
                <Eye className="w-4 h-4" /> View
              </a>
              {req.status?.toLowerCase() === 'pending' && (
                <>
                  <button 
                    onClick={() => approve(req.id)} 
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => reject(req.id)} 
                    className="p-2.5 bg-red-50 text-red-500 rounded-lg border border-red-100"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}