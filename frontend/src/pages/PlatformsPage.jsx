import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader, Badge } from "../components/ui";
import { platforms } from "../data/mockData";

const compareFeatures = [
  { feature: "Mobile Trading", mt5: "iOS & Android", mt4: "iOS & Android", tv: "iOS & Android", app: "iOS & Android" },
  { feature: "Web Browser", mt5: true, mt4: true, tv: true, app: false },
  { feature: "Desktop App", mt5: "Win / Mac", mt4: "Win / Mac", tv: "Win / Mac", app: false },
  { feature: "Expert Advisors (EAs)", mt5: true, mt4: true, tv: false, app: false },
  { feature: "Copy Trading", mt5: true, mt4: false, tv: false, app: "Built-in" },
  { feature: "Algorithmic Trading", mt5: "MQL5", mt4: "MQL4", tv: "Pine Script", app: false },
  { feature: "Economic Calendar", mt5: true, mt4: false, tv: true, app: true },
  { feature: "Advanced Charting", mt5: true, mt4: true, tv: "Best-in-class", app: true },
];

const copyTraders = [
  { initials: "JK", name: "J. Kato", followers: "2,341", style: "Forex", return: "+42.8%", color: "bg-accent" },
  { initials: "NM", name: "N. Mensah", followers: "1,820", style: "Gold", return: "+38.2%", color: "bg-teal" },
  { initials: "AS", name: "A. Silva", followers: "3,104", style: "Multi", return: "+31.5%", color: "bg-gold" },
  { initials: "TL", name: "T. Liu", followers: "987", style: "Indices", return: "+27.9%", color: "bg-primary-light" },
];

function CellVal({ val }) {
  if (val === true) return <Check className="w-4 h-4 text-teal mx-auto" />;
  if (val === false) return <span className="text-[#DDE3EE] text-lg mx-auto block text-center">—</span>;
  return <span className="text-xs font-semibold text-primary">{val}</span>;
}

export default function PlatformsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-teal/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <p className="text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-2">/</span>Platforms
          </p>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4 leading-tight">
            Trade on Any<br /><span className="text-accent-light">Platform You Choose</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl">
            MetaTrader 4, MetaTrader 5, TradingView, and our own ABle App — choose the platform that fits your style.
          </p>
        </div>
      </section>

      {/* PLATFORM CARDS */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Our Platforms" title={<>Choose Your <span className="text-accent">Platform</span></>} />
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-5 mb-20">
            {platforms.map((p) => (
              <div
                key={p.id}
                className="border-2 border-surface-border rounded-xl overflow-hidden hover:border-accent hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              >
                <div className="bg-primary p-6 relative">
                  <div className="font-display font-extrabold text-lg text-white mb-1">{p.name}</div>
                  <div className="text-xs text-white/40 font-medium">{p.tag}</div>
                  {p.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="teal">{p.badge}</Badge>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#4A5568] leading-relaxed mb-5">{p.description}</p>
                  <ul className="space-y-2.5 mb-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#4A5568]">
                        <Check className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="btn-primary text-xs py-2.5 px-4 block text-center">
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* COMPARE TABLE */}
          <SectionHeader tag="Comparison" title={<>Feature <span className="text-accent">Comparison</span></>} />
          <div className="overflow-x-auto rounded-xl border border-surface-border shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60 w-48">Feature</th>
                  {["MetaTrader 5", "MetaTrader 4", "TradingView", "ABle App"].map((h) => (
                    <th key={h} className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-white">
                {compareFeatures.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-primary text-xs">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><CellVal val={row.mt5} /></td>
                    <td className="px-5 py-3.5 text-center"><CellVal val={row.mt4} /></td>
                    <td className="px-5 py-3.5 text-center"><CellVal val={row.tv} /></td>
                    <td className="px-5 py-3.5 text-center"><CellVal val={row.app} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COPY TRADING */}
      <section id="copy" className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader tag="Copy Trading" title={<>Follow <span className="text-accent">Expert Traders</span></>} />
              <p className="text-[#4A5568] leading-relaxed mb-8">
                New to trading? Copy the strategies of experienced traders automatically. Allocate funds, set your risk tolerance, and let proven traders do the work for you.
              </p>
              <ol className="space-y-6 mb-8">
                {[
                  { title: "Browse Top Traders", desc: "Filter by return, risk score, drawdown, and trading style to find the right match." },
                  { title: "Allocate Funds", desc: "Choose how much to invest and set your own maximum loss limits." },
                  { title: "Auto-Copy Trades", desc: "All trades are copied proportionally and automatically in real time." },
                ].map((s, i) => (
                  <li key={s.title} className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-accent text-white font-display font-extrabold flex items-center justify-center flex-shrink-0 text-base">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-primary mb-1">{s.title}</div>
                      <div className="text-sm text-[#4A5568] leading-relaxed">{s.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Start Copy Trading <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-primary rounded-xl p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Top Traders This Month</div>
              <div className="space-y-0 divide-y divide-white/10">
                {copyTraders.map((t) => (
                  <div key={t.name} className="flex items-center gap-4 py-4">
                    <div className={`w-10 h-10 rounded-full ${t.color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.followers} followers · {t.style}</div>
                    </div>
                    <div className="font-display font-extrabold text-lg text-emerald-400">{t.return}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/25 mt-5">Past performance is not indicative of future results.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
