import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { siteService } from "../../services/api";

const navItems = [
  { label: "Trading", path: "/trading" },
  { label: "Platforms", path: "/platforms" },
  { label: "Promotions", path: "/promotions" },
  { label: "Partners", path: "/partners" },
  { label: "About", path: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState("vāntãgeCFD");
  const [siteLogo, setSiteLogo] = useState("https://www.vantagemarkets.com/wp-content/themes/vantage/images/logo.svg");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    siteService.getSettings().then(res => {
       if (res.data?.site_name) setSiteName(res.data.site_name);
       if (res.data?.site_logo) setSiteLogo(res.data.site_logo);
    }).catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/97 backdrop-blur-xl shadow-card border-b border-[#DDE3EE]" : "bg-transparent"
        }`}
        style={{ height: 72 }}
      >
        <div className="max-w-[1200px] mx-auto px-10 h-full flex items-center justify-between gap-8" style={{backgroundColor:"white"}}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
             <img src={siteLogo} alt="Logo" style={{height:"32px", objectFit: "contain"}}/>
            <span className="font-display font-extrabold text-xl text-primary">{siteName}</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-7 flex-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-accent" : "text-[#4A5568] hover:text-accent"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <span className="text-sm font-medium text-[#4A5568]">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#4A5568] hover:text-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-[12px] text-sm font-semibold text-primary border border-[#DDE3EE] hover:border-accent hover:text-accent transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-[12px] text-sm font-semibold text-white bg-accent hover:bg-accent-light hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-accent/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-primary hover:text-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-[72px] animate-fade-in lg:hidden">
          <div className="px-6 py-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-[12px] text-base font-medium transition-colors ${
                    isActive ? "bg-accent/5 text-accent" : "text-[#4A5568] hover:bg-[#F4F6FA]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="px-6 py-3 rounded-[12px] text-sm font-semibold text-white bg-primary text-center"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-6 py-3 rounded-[12px] text-sm font-semibold text-center border border-[#DDE3EE] text-primary hover:border-accent hover:text-accent transition-all">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-6 py-3 rounded-[12px] text-sm font-semibold text-center text-white bg-accent hover:bg-accent-light transition-all">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
