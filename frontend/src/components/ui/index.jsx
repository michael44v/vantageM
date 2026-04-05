// Button component
export function Button({ children, variant = "primary", size = "md", className = "", onClick, disabled, type = "button" }) {
  const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer outline-none border-0 rounded-[12px]";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-light hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
    ghost: "bg-transparent text-primary border border-[#DDE3EE] hover:border-accent hover:text-accent",
    teal: "bg-teal text-white hover:bg-teal-light hover:-translate-y-0.5 hover:shadow-lg",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5",
    dark: "bg-primary text-white hover:bg-primary-light hover:-translate-y-0.5",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// Badge
export function Badge({ children, variant = "accent" }) {
  const variants = {
    accent: "bg-accent/10 text-accent border border-accent/20",
    teal: "bg-teal/10 text-teal border border-teal/20",
    gold: "bg-gold/10 text-gold border border-gold/20",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-600 border border-amber-200",
    neutral: "bg-surface text-[#4A5568] border border-[#DDE3EE]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Input
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-primary">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-[12px] border border-[#DDE3EE] bg-white text-primary placeholder-[#8897A9] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 text-sm ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// Select
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-primary">{label}</label>}
      <select
        className={`w-full px-4 py-3 rounded-[12px] border border-[#DDE3EE] bg-white text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 text-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// Spinner
export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-5 h-5 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };
  return (
    <div className={`${sizes[size]} border-[#DDE3EE] border-t-accent rounded-full animate-spin ${className}`} />
  );
}

// Section header
export function SectionHeader({ tag, title, subtitle, center = false, light = false }) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      {tag && <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${light ? "text-teal-light" : "text-accent"}`}>{tag}</p>}
      <h2 className={`font-display font-extrabold leading-tight mb-4 text-4xl ${light ? "text-white" : "text-primary"}`}>{title}</h2>
      {subtitle && <p className={`text-base leading-relaxed max-w-xl ${center ? "mx-auto" : ""} ${light ? "text-white/60" : "text-[#4A5568]"}`}>{subtitle}</p>}
    </div>
  );
}

// Divider
export function Divider({ className = "" }) {
  return <hr className={`border-[#DDE3EE] ${className}`} />;
}

// Stat card for hero/sections
export function StatCard({ value, label, light = false }) {
  return (
    <div>
      <div className={`font-display font-extrabold text-2xl ${light ? "text-accent-light" : "text-accent"}`}>{value}</div>
      <div className={`text-sm mt-1 ${light ? "text-white/50" : "text-[#8897A9]"}`}>{label}</div>
    </div>
  );
}

// Table
export function Table({ headers, children, className = "" }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-[#DDE3EE] ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary text-white/70">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE3EE] bg-white">{children}</tbody>
      </table>
    </div>
  );
}
