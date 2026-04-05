import { useState } from "react";
import { CheckCircle, XCircle, Eye, Shield, FileText, ExternalLink } from "lucide-react";

export default function AdminKYC() {
  const kycRequests = [
    { id: 1, user: "James Okonkwo", type: "Identity", doc: "Passport_Scan.jpg", date: "2024-04-05", status: "Pending" },
    { id: 2, user: "Sarah Kimani", type: "Address", doc: "Utility_Bill.pdf", date: "2024-04-06", status: "Pending" },
    { id: 3, user: "Mikael Johansson", type: "Identity", doc: "ID_Card.png", date: "2024-04-04", status: "Approved" },
  ];

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
            {kycRequests.map((req) => (
              <tr key={req.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-bold text-[#111111] text-sm">{req.user}</div>
                  <div className="text-xs text-[#8897A9] mt-0.5 font-medium uppercase tracking-tighter">USER-ID: {req.id + 100}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFC800]/10 flex items-center justify-center text-[#CCA000]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#111111]">{req.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[#4A5568] font-medium">{req.date}</td>
                <td className="px-6 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                     req.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                   }`}>
                      {req.status}
                   </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg text-[#8897A9] hover:bg-[#F8F8F8] hover:text-[#111111] transition-all" title="View Document">
                      <Eye className="w-4 h-4" />
                    </button>
                    {req.status === 'Pending' && (
                      <>
                        <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Reject">
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
