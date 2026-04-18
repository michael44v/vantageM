import { useState, useEffect } from "react";
import { notificationService } from "../../services/api";
import { Bell, Check, Loader2, Info, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
//import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async () => {
    try {
      await notificationService.markRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      alert(err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':   return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'security':return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Notifications</h1>
          <p className="text-sm text-[#4A5568]">Stay updated with your account activity.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkRead}
            className="flex items-center gap-2 text-xs font-bold text-accent hover:text-accent-light transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white border border-surface-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-[#8897A9]" />
            </div>
            <h3 className="font-display font-bold text-primary text-lg">No notifications yet</h3>
            <p className="text-sm text-[#8897A9]">We'll let you know when something happens.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-5 flex gap-4 transition-all ${
                n.is_read ? "border-surface-border opacity-75" : "border-accent/20 shadow-sm"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.is_read ? "bg-surface" : "bg-accent/10"
              }`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-bold truncate ${n.is_read ? "text-[#4A5568]" : "text-primary"}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] font-medium text-[#8897A9] whitespace-nowrap ml-2">
                    {n.created_at ? new Date(n.created_at.replace(/-/g, '/')).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                  </span>
                </div>
                <p className="text-sm text-[#4A5568] leading-relaxed">
                  {n.message}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 bg-accent rounded-full self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
