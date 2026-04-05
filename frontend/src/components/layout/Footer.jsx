import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

const footerCols = [
  {
    title: "Trading",
    links: [
      { label: "All Products", path: "/trading" },
      { label: "Forex", path: "/trading#forex" },
      { label: "Indices", path: "/trading#indices" },
      { label: "Gold & Silver", path: "/trading#gold" },
      { label: "Energy", path: "/trading#energy" },
      { label: "Shares & ETFs", path: "/trading#shares" },
    ],
  },
  {
    title: "Platforms",
    links: [
      { label: "MetaTrader 5", path: "/platforms" },
      { label: "MetaTrader 4", path: "/platforms" },
      { label: "TradingView", path: "/platforms" },
      { label: "ABle App", path: "/platforms" },
      { label: "Copy Trading", path: "/platforms#copy" },
      { label: "Demo Account", path: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Regulation", path: "/about#regulation" },
      { label: "Promotions", path: "/promotions" },
      { label: "Partner Program", path: "/partners" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-[1200px] mx-auto px-10">
        {/* Main footer */}
        <div className="pt-16 pb-12 grid grid-cols-1 lg:grid-cols-5 gap-10 border-b border-white/10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-accent rounded-[9px] flex items-center justify-center">
                <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
                  <path d="M10 2L3 7v6l7 5 7-5V7L10 2zm0 2.5l5 3.5v4L10 15 5 12V8l5-3.5z" />
                </svg>
              </div>
              <span className="font-display font-extrabold text-xl text-white">ABle Markets</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              An award-winning CFD broker trusted by 5,000,000+ traders across 100+ countries. Trade smarter with institutional-grade technology.
            </p>
            <div className="flex flex-col gap-3">
              <a href="mailto:support@ablemarkets.com" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@ablemarkets.com
              </a>
              <div className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                iCount Building, Kumul Highway, Port Vila, Vanuatu
              </div>
            </div>
          </div>

          {/* Nav cols */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-white/50 hover:text-accent-light transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk warning */}
        <div className="py-8 border-b border-white/10">
          <div className="bg-white/5 border border-white/8 rounded-[12px] p-5">
            <p className="text-xs text-white/40 leading-relaxed">
              <span className="font-bold text-white/60">RISK WARNING: </span>
              Trading derivatives carries significant risks. It is not suitable for all investors and if you are a professional client, you could lose substantially more than your initial investment. When acquiring our derivative products, you have no entitlement, right or obligation to the underlying financial assets. Past performance is no indication of future performance and tax laws are subject to change. The information on this website is general in nature and does not take into account your personal objectives, financial circumstances, or needs. We encourage you to seek independent advice if necessary.
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="py-6">
          <p className="text-xs text-white/30 leading-relaxed mb-3">
            VIG Group, operating under the brand ABle Markets, is an investment dealer authorized and regulated by the Mauritius Financial Services Commission (FSC). Business operations are protected by insurance coverage provided by Willis Towers Watson (WTW). Claims eligibility of up to USD 1,000,000 per claimant. ABle Markets is a member of The Financial Commission. ABle Markets does not offer services to residents of India, Canada, China, Singapore, the United States, or any FATF blacklisted jurisdiction.
          </p>
          <p className="text-xs text-white/30 text-center pt-4 border-t border-white/10">
            &copy; {new Date().getFullYear()} ABle Markets. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
