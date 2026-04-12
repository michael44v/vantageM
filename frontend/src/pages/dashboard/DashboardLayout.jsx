import { useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, TrendingUp,
  User, ShieldCheck, LogOut, Menu, X, ChevronRight, Bell, Wallet, Users,Receipt
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UnverifiedBanner from "../../components/UnverifiedBanner";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Trading Accounts", path: "/dashboard/accounts", icon: TrendingUp },
  { label: "Funds", path: "/dashboard/funds", icon: CreditCard },
  { label: "Internal Transfer", path: "/dashboard/transfer", icon: ArrowLeftRight },
  { label: "Copy Trading", path: "/dashboard/copy", icon: Users },
  { label: "KYC / Profile", path: "/dashboard/kyc", icon: ShieldCheck },
  { label: "Transactions", path: "/dashboard/transactions", icon: Receipt },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <UnverifiedBanner /> 
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-primary transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 h-[68px]">
          <div className="w-8 h-8 bg-accent rounded-[8px] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="font-display font-extrabold text-base text-white truncate">
              Vantage Portal
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-[10px] mb-0.5 transition-all group ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10">
          <Link to="/trading-terminal" className="flex items-center gap-3 px-4 py-3 mx-2 rounded-[10px] mb-2 bg-teal text-white hover:bg-teal-light transition-all">
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-bold">Trading Terminal</span>}
          </Link>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2 mt-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                {user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-xs text-white/40 truncate">Trader</div>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors ml-auto flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center py-2 text-white/40 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 bg-white border-b border-surface-border h-[68px] flex-shrink-0">
           <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#4A5568] hover:text-primary transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8897A9]">
              <Link to="/" className="hover:text-accent transition-colors">Vantage Markets</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-medium">Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8897A9] font-bold">Wallet Balance</span>
              <span className="text-sm font-bold text-primary">$1,000.00 USD</span>
            </div>
            <button className="relative text-[#4A5568] hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
            </button>
             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-white">
                {user?.name?.[0] || "U"}
              </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
