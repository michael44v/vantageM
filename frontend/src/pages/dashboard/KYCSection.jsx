import { useState } from "react";
import { User, ShieldCheck, Mail, Globe, Phone, FileText, Upload, CheckCircle } from "lucide-react";

export default function KYCSection() {
  const [kycStatus, setKycStatus] = useState("pending"); // pending, approved, rejected
  const [docs, setDocs] = useState([
    { type: "ID Card / Passport", status: "Approved", date: "2024-04-01" },
    { type: "Proof of Address", status: "Pending", date: "2024-04-05" },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-2xl text-primary">Profile & Verification</h1>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
           <ShieldCheck className="w-4 h-4" />
           KYC: {kycStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8897A9] mb-4">Personal Information</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#8897A9]" />
                    <div className="text-sm font-bold text-primary">Demo Trader</div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#8897A9]" />
                    <div className="text-sm font-medium text-[#4A5568]">trader@vantagemarkets.com</div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#8897A9]" />
                    <div className="text-sm font-medium text-[#4A5568]">+1 (555) 000-1234</div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#8897A9]" />
                    <div className="text-sm font-medium text-[#4A5568]">Nigeria</div>
                 </div>
              </div>
              <button className="w-full btn-ghost text-xs py-2 mt-6">Edit Profile</button>
           </div>
        </div>

        {/* Verification */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-surface-border rounded-xl p-8 shadow-card">
              <h3 className="font-display font-bold text-lg text-primary mb-6">Identity Verification</h3>
              <div className="space-y-4 mb-8">
                 {docs.map((doc) => (
                    <div key={doc.type} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-border">
                       <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-accent" />
                          <div>
                             <div className="text-sm font-bold text-primary">{doc.type}</div>
                             <div className="text-[10px] text-[#8897A9]">{doc.date}</div>
                          </div>
                       </div>
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {doc.status}
                       </span>
                    </div>
                 ))}
              </div>

              <div className="border-2 border-dashed border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer group">
                 <Upload className="w-8 h-8 text-[#8897A9] group-hover:text-accent mb-3" />
                 <div className="text-sm font-bold text-primary">Upload New Document</div>
                 <div className="text-xs text-[#8897A9] mt-1">Proof of Identity or Residential Address</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
