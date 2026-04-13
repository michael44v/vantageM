import { useState, useEffect } from "react";
import { Mail, Send, Loader2, CheckCircle, Search, User } from "lucide-react";
import { adminService, mailService } from "../../services/api";

export default function AdminMail() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminService.getUsers(1, 1000).then(res => {
      setUsers(res.data || []);
      setLoading(false);
    });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess("");
    setError("");

    try {
      if (selectedUser === "all") {
        for (const u of users) {
          await mailService.sendCustomMail({ email: u.email, subject, message });
        }
        setSuccess(`Broadcast sent to ${users.length} users successfully!`);
      } else {
        await mailService.sendCustomMail({ email: selectedUser, subject, message });
        setSuccess("Email sent successfully!");
      }
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to send mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Broadcast Mail</h1>
        <p className="text-sm text-[#4A5568]">Send official notifications and updates to your traders.</p>
      </div>

      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-2">Recipient</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input-field"
                required
              >
                <option value="all">All Users ({users.length})</option>
                <optgroup label="Individual Users">
                  {users.map(u => (
                    <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-2">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Important update regarding your account..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8897A9] block mb-2">Message Body</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="input-field h-48 resize-none py-4"
                required
              />
              <p className="text-[10px] text-[#8897A9] mt-2 italic">Supports plain text. Emails are sent via vāntãgeCFD Mail Gateway.</p>
            </div>

            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={sending || loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-base"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {sending ? "Sending Broadcast..." : "Send Email Now"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Email Delivery Info</h4>
          <p className="text-xs text-blue-800 leading-relaxed">
            All messages are logged for security. Avoid sending sensitive information like passwords or private keys.
            Broadcasts to many users may take a few moments to process.
          </p>
        </div>
      </div>
    </div>
  );
}
