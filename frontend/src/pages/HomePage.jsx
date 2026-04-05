import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe, Star, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader, StatCard, Badge, Table } from "../components/ui";
import { spreadsData, earningsChartData, promotions } from "../data/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const trustedBy = [
  { name: "Google", stars: 4.5 },
  { name: "Trustpilot", stars: 4.4 },
  { name: "App Store", stars: 4.6 },
  { name: "ForexBrokers", stars: 4.3 },
  { name: "WikiFX", stars: 4.5 },
  { name: "DayTrading", stars: 4.4 },
  { name: "Google Play", stars: 4.5 },
  { name: "Finance Review", stars: 5.0 },
];

const pressLogos = ["CNBC", "Reuters", "CNN", "Financial Times", "Business Insider", "Yahoo Finance"];

const promoColorMap = {
  accent: { bg: "bg-accent", text: "text-accent", badge: "bg-accent/10 text-accent border-accent/20" },
  teal: { bg: "bg-teal", text: "text-teal", badge: "bg-teal/10 text-teal border-teal/20" },
  gold: { bg: "bg-gold", text: "text-gold", badge: "bg-gold/10 text-gold border-gold/20" },
};

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.floor(count) ? "text-gold fill-gold" : "text-[#DDE3EE] fill-[#DDE3EE]"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState("");

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative min-h-[90vh] bg-primary flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-teal/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/12 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-[1200px] mx-auto px-10 w-full py-20 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-accent-light rounded-full animate-pulse2" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent-light">Award-Winning CFD Broker</span>
            </div>

            <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-white leading-[1.06] mb-6">
              ABle Markets<br />
              <span className="text-accent-light">Ultimate Trading</span><br />
              Machine
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              A globally trusted CFD platform serving 5,000,000+ traders. Access 1,000+ instruments across forex, gold, indices, shares, and more — from 0.0 pips.
            </p>

            <div className="flex gap-3 mb-10 flex-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-[220px] px-5 py-3.5 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all"
              />
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-accent-light hover:-translate-y-0.5 transition-all shadow-lg shadow-accent/30"
              >
                Sign Up Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <StatCard value="5M+" label="Registered Users" light />
              <StatCard value="1,000+" label="Instruments" light />
              <StatCard value="0.0" label="Pips From" light />
              <StatCard value="$0" label="Deposit Fees" light />
            </div>
          </div>

          {/* Right: Chart card */}
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card p-7">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Portfolio Performance</div>
              <div className="font-display font-extrabold text-3xl text-white mb-1">$25,324.23</div>
              <div className="flex items-center gap-1.5 text-sm text-emerald-400 font-semibold mb-6">
                <TrendingUp className="w-4 h-4" />
                +12.4% This Month
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={earningsChartData}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8500A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#E8500A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0B1E3D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 12 }}
                    formatter={(v) => [`$${v.toLocaleString()}`, "Value"]}
                  />
                  <Area dataKey="value" stroke="#E8500A" strokeWidth={2.5} fill="url(#heroGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-xl">
              <div className="text-xs text-[#8897A9] font-medium mb-1">XAU/USD</div>
              <div className="font-display font-bold text-lg text-primary">2,341.50</div>
              <div className="text-xs text-teal font-semibold">+0.75 spread</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl">
              <div className="text-xs text-[#8897A9] font-medium mb-1">Customer Support</div>
              <div className="font-display font-bold text-lg text-primary">24/7</div>
              <Stars count={5} />
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONS STRIP */}
      <section className="bg-surface py-5 border-b border-surface-border overflow-x-auto">
        <div className="max-w-[1200px] mx-auto px-10 flex gap-5 min-w-max">
          {promotions.map((promo) => {
            const c = promoColorMap[promo.color] || promoColorMap.accent;
            return (
              <div key={promo.id} className="bg-white border border-surface-border rounded-[12px] px-5 py-4 flex items-center gap-4 shadow-card min-w-[220px]">
                <div className={`w-10 h-10 rounded-[10px] ${c.bg}/10 flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-3 h-3 rounded-sm ${c.bg}`} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8897A9]">{promo.type}</div>
                  <div className="text-sm font-bold text-primary">{promo.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPETITIVE SPREADS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader
            tag="Competitive Pricing"
            title={<>See Our <span className="text-accent">Competitive Spreads</span></>}
            subtitle="We consistently beat market averages — giving you an edge before you even place a trade."
          />
          <div className="overflow-hidden rounded-xl border border-surface-border shadow-card">
            <div className="grid grid-cols-3 bg-primary px-7 py-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Instrument</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-teal" />
                ABle Markets
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60 text-right">Market Average</div>
            </div>
            {spreadsData.map((row, i) => (
              <div
                key={row.pair}
                className={`grid grid-cols-3 px-7 py-4 items-center border-b border-surface-border hover:bg-surface transition-colors ${
                  i === spreadsData.length - 1 ? "border-b-0" : ""
                }`}
              >
                <div>
                  <div className="font-bold text-primary text-sm">{row.pair}</div>
                  <div className="text-xs text-[#8897A9] mt-0.5">{row.category}</div>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="font-display font-bold text-lg text-primary">{row.ours}</span>
                </div>
                <div className="text-right font-display font-bold text-base text-[#4A5568]">{row.market}</div>
              </div>
            ))}
            <div className="bg-surface px-7 py-3 text-xs text-[#8897A9]">
              Spreads are in pips. Last updated April 2026. Indicative purposes only — net costs may differ at any time.
            </div>
          </div>
          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2">
              Sign Up Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY ABLE MARKETS */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="section-tag text-teal mb-3">Why ABle Markets</p>
            <h2 className="font-display font-extrabold text-4xl text-white mb-4">An Award-Winning Broker</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden mb-16 border border-white/10">
            {[
              { val: "5,000,000+", lab: "Registered Users" },
              { val: "1,000+", lab: "Products" },
              { val: "From 0.0", lab: "Pip Spreads" },
              { val: "$0", lab: "Deposit Fees" },
            ].map((s) => (
              <div key={s.lab} className="bg-white/5 py-10 text-center px-4">
                <div className="font-display font-extrabold text-4xl text-accent-light mb-2">{s.val}</div>
                <div className="text-sm text-white/50">{s.lab}</div>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Trusted CFD Broker",
                desc: "With over 15 years of experience, ABle Markets has built a reputation as a trusted, regulated CFD broker. Trade 1,000+ products with seamless execution and 24/7 dedicated support.",
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Secure Funds",
                desc: "Client funds are held in fully segregated trust accounts with top-tier banks, separate from our operational capital. Insurance coverage up to USD 1,000,000 per claimant.",
              },
              {
                icon: <Globe className="w-7 h-7" />,
                title: "Competitive Spreads",
                desc: "Trade smarter with ultra-tight spreads designed to help you manage costs effectively. Competitive pricing across all products — forex, gold, indices, shares, and more.",
              },
            ].map((f) => (
              <div key={f.title} className="glass-card p-8 hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className="text-teal mb-5">{f.icon}</div>
                <h3 className="font-display font-bold text-lg text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Ratings" title={<><span className="text-accent">Trust</span> We Have Earned</>} center />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {trustedBy.map((t) => (
              <div key={t.name} className="bg-white border border-surface-border rounded-xl p-5 text-center shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="font-display font-bold text-sm text-primary mb-3">{t.name}</div>
                <Stars count={t.stars} />
                <div className="text-xs text-[#8897A9] mt-1.5">{t.stars} / 5.0</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-surface-border">
            {pressLogos.map((p) => (
              <span key={p} className="font-display font-extrabold text-sm text-[#8897A9] hover:text-primary transition-colors cursor-default tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRADE ANYTIME */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <SectionHeader
                tag="Access"
                title={<>Trade <span className="text-accent">Anytime, Anywhere</span></>}
              />
              <p className="text-base text-[#4A5568] leading-relaxed mb-4">
                One of the world's leading CFD brokers with over 15 years of market experience, ABle Markets provides access to 1,000+ CFD products — forex, indices, commodities, shares, ETFs, and bonds.
              </p>
              <p className="text-base text-[#4A5568] leading-relaxed mb-8">
                Trade from South Africa, Kenya, Nigeria, Botswana or anywhere across the globe using desktop or mobile, powered by MT4, MT5, TradingView, and our proprietary app.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Full MT4 / MT5 / TradingView integration",
                  "Advanced charting and analysis tools",
                  "Copy trading — follow proven experts",
                  "Demo accounts for risk-free practice",
                  "24/7 dedicated customer support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#4A5568]">
                    <div className="w-5 h-5 rounded-full bg-teal/15 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                  Open Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/platforms" className="btn-ghost inline-flex items-center gap-2">
                  View Platforms
                </Link>
              </div>
            </div>

            {/* Earnings card */}
            <div className="relative">
              <div className="bg-white border border-surface-border rounded-xl shadow-lg p-7">
                <div className="text-xs text-[#8897A9] mb-1 font-medium">Earnings — Trading Performance</div>
                <div className="font-display font-extrabold text-3xl text-primary mb-6">$25,324.23 USD</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={earningsChartData}>
                    <defs>
                      <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8500A" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#E8500A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8897A9" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B1E3D", border: "none", borderRadius: 8, color: "white", fontSize: 12 }}
                      formatter={(v) => [`$${v.toLocaleString()}`, "Value"]}
                    />
                    <Area dataKey="value" stroke="#E8500A" strokeWidth={2.5} fill="url(#tradeGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white border border-surface-border rounded-xl px-5 py-4 shadow-lg text-center">
                <div className="font-display font-extrabold text-2xl text-primary">24/7</div>
                <Stars count={5} />
                <div className="text-xs font-semibold text-primary mt-1">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader
            tag="Help"
            title={<>Support & <span className="text-accent">Resources</span></>}
            subtitle="Get the answers, assistance, and education you need to support your trading journey."
            center
          />
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                title: "24/7 Customer Support",
                desc: "Our dedicated support team is available around the clock. Live chat, email, and phone — always here when you need us.",
                action: "Chat Now",
              },
              {
                title: "Help Centre",
                desc: "Comprehensive documentation covering account setup, platform guides, trading strategies, deposits, withdrawals, and more.",
                action: "View More",
              },
              {
                title: "Trading Academy",
                desc: "Free educational resources for traders of all levels — articles, webinars, video courses, eBooks, and live sessions.",
                action: "Start Learning",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-white border border-surface-border rounded-xl p-8 hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-display font-bold text-lg text-primary mb-3">{c.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed mb-6">{c.desc}</p>
                <button className="text-sm font-bold text-accent flex items-center gap-1.5 hover:gap-2.5 transition-all">
                  {c.action} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0d2a50] to-[#0B3D3A]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal/10 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-10 text-center relative z-10">
          <h2 className="font-display font-extrabold text-5xl text-white mb-5">Start Your Trading Now</h2>
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">Join over 5 million traders worldwide. Open an account in minutes.</p>
          <div className="flex items-center justify-center gap-12 mb-10 border-y border-white/10 py-8">
            {[
              { val: "5,000,000+", lab: "Registered Users" },
              { val: "1,000+", lab: "Products" },
              { val: "0.0 pips", lab: "Spreads From" },
              { val: "$0", lab: "Deposit Fees*" },
            ].map((s) => (
              <div key={s.lab} className="text-center">
                <div className="font-display font-extrabold text-3xl text-accent-light">{s.val}</div>
                <div className="text-sm text-white/50 mt-1">{s.lab}</div>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-white font-bold text-base hover:bg-accent-light hover:-translate-y-0.5 transition-all shadow-xl shadow-accent/30"
          >
            Start Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
