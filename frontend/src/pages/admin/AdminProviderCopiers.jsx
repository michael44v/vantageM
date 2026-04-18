import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Loader2, ArrowLeft } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";

export default function AdminProviderCopiers() {
  const { providerId } = useParams();
  const [copiers, setCopiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCopiers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getProviderCopiers(providerId);
      setCopiers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchCopiers();
  }, [fetchCopiers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/copy-trading"
            className="p-2 rounded-lg bg-white border border-surface-border text-[#4A5568] hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Provider Copiers</h1>
            <p className="text-sm text-[#4A5568]">View all traders currently copying this provider.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : copiers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-[#8897A9]" />
            </div>
            <h3 className="font-display font-bold text-lg text-primary">No copiers found</h3>
            <p className="text-sm text-[#8897A9] max-w-xs mx-auto mt-1">
              This provider doesn't have any active copy relationships yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-surface-border">
                  {["Copier", "Account #", "Balance", "Risk Multiplier", "Status", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#8897A9]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {copiers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-primary">{c.copier_name}</div>
                      <div className="text-xs text-[#8897A9]">{c.copier_email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-primary">
                      {c.account_number}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      ${parseFloat(c.balance).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-accent">
                      {c.risk_multiplier}x
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          c.status === "active"
                            ? "success"
                            : c.status === "paused"
                            ? "neutral"
                            : "error"
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[#8897A9]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
