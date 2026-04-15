import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { adminService } from "../../services/api";
import { Badge } from "../../components/ui";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
const earningsChartData = [
  { month: "Apr", value: 18200 },
  { month: "May", value: 19800 },
  { month: "Jun", value: 17400 },
  { month: "Jul", value: 22100 },
  { month: "Aug", value: 21000 },
  { month: "Sep", value: 25324 },
];

const weekData = [
  { day: "Mon", deposits: 42000, withdrawals: 12000 },
  { day: "Tue", deposits: 68000, withdrawals: 18000 },
  { day: "Wed", deposits: 35000, withdrawals: 9000 },
  { day: "Thu", deposits: 91000, withdrawals: 24000 },
  { day: "Fri", deposits: 74000, withdrawals: 16000 },
  { day: "Sat", deposits: 28000, withdrawals: 8000 },
  { day: "Sun", deposits: 19000, withdrawals: 5000 },
];

function statusVariant(status) {
  const map = { Active: "success", Pending: "warning", Suspended: "danger", Processing: "warning", Completed: "success", Rejected: "danger", approved: "success", rejected: "danger", deposit: "success", withdrawal: "danger" };
  return map[status?.toLowerCase()] || "neutral";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, tRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUsers(1, 4),
          adminService.getAllTransactions({ page: 1, per_page: 5 })
        ]);
        setStats(sRes.data);
        setUsers(uRes.data);
        setTransactions(tRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total_users?.toLocaleString() || "0",
      sub: "Active Traders",
      up: true,
      icon: Users,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Total Deposits",
      value: `$${(stats?.total_deposits || 0).toLocaleString()}`,
      sub: "Approved",
      up: true,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Open Positions",
      value: stats?.open_positions || "0",
      sub: "Live trades",
      up: true,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Trans.",
      value: stats?.pending_transactions || "0",
      sub: "Require approval",
      up: false,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-primary mb-1">Dashboard</h1>
        <p className="text-sm text-[#4A5568]">Welcome back. Here is what is happening across vāntãgeCFD today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-surface-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-[10px] ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.up ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="font-display font-extrabold text-2xl text-primary mb-1">{card.value}</div>
            <div className="text-xs text-[#8897A9] font-medium">{card.label}</div>
            <div className={`text-xs font-semibold mt-1 ${card.up ? "text-emerald-500" : "text-amber-500"}`}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Portfolio growth */}
        <div className="xl:col-span-2 bg-white border border-surface-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-primary">Platform Volume</h3>
              <p className="text-xs text-[#8897A9]">Deposits vs Withdrawals — This Week</p>
            </div>
            <Badge variant="teal">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8897A9" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8897A9" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111111", border: "none", borderRadius: 8, color: "white", fontSize: 12 }}
                formatter={(v, n) => [`$${v.toLocaleString()}`, n === "deposits" ? "Deposits" : "Withdrawals"]}
              />
              <Bar dataKey="deposits" fill="#00B4A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#FFC800" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-teal" /><span className="text-xs text-[#4A5568]">Deposits</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-accent" /><span className="text-xs text-[#4A5568]">Withdrawals</span></div>
          </div>
        </div>

        {/* User growth */}
        <div className="bg-white border border-surface-border rounded-xl p-6 shadow-card">
          <h3 className="font-display font-bold text-lg text-primary mb-1">User Growth</h3>
          <p className="text-xs text-[#8897A9] mb-6">Cumulative registrations</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={earningsChartData}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC800" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FFC800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8897A9" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "none", borderRadius: 8, color: "white", fontSize: 12 }} />
              <Area dataKey="value" stroke="#FFC800" strokeWidth={2} fill="url(#adminGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-surface-border grid grid-cols-2 gap-4">
            <div>
              <div className="font-display font-bold text-xl text-primary">{stats?.total_users?.toLocaleString() || "0"}</div>
              <div className="text-xs text-[#8897A9]">Total Users</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-teal">{stats?.active_users?.toLocaleString() || "0"}</div>
              <div className="text-xs text-[#8897A9]">Active Traders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
            <h3 className="font-display font-bold text-base text-primary">Recent Users</h3>
            <a href="/admin/users" className="text-xs font-semibold text-accent hover:underline">View all</a>
          </div>
          <div className="divide-y divide-surface-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface transition-colors">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{u.name}</div>
                  <div className="text-xs text-[#8897A9] truncate">{u.country} — {u.role}</div>
                </div>
                <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
            <h3 className="font-display font-bold text-base text-primary">Recent Transactions</h3>
            <a href="/admin/transactions" className="text-xs font-semibold text-accent hover:underline">View all</a>
          </div>
          <div className="divide-y divide-surface-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "deposit" ? "bg-teal/10" : "bg-accent/10"}`}>
                  <div className={`w-2.5 h-2.5 rounded-sm ${tx.type === "deposit" ? "bg-teal" : "bg-accent"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{tx.user_name}</div>
                  <div className="text-xs text-[#8897A9]">{tx.type} — {tx.method}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold ${tx.type === "deposit" ? "text-teal" : "text-accent"}`}>${parseFloat(tx.amount).toLocaleString()}</div>
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
