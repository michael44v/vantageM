import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe, Star, ChevronRight, TrendingUp, Check } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { spreadsData, earningsChartData, promotions } from "../data/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

const trustedBy = [
  { name: "Google", stars: 4.5 }, { name: "Trustpilot", stars: 4.4 },
  { name: "App Store", stars: 4.6 }, { name: "ForexBrokers", stars: 4.3 },
  { name: "WikiFX", stars: 4.5 }, { name: "DayTrading", stars: 4.4 },
  { name: "Google Play", stars: 4.5 }, { name: "Finance Review", stars: 5.0 },
];

const pressLogos = ["CNBC", "Reuters", "CNN", "Financial Times", "Business Insider", "Yahoo Finance"];

const promoAccentMap = {
  accent: { dot: "bg-accent",  ring: "bg-accent/10"  },
  teal:   { dot: "bg-teal",    ring: "bg-teal/10"    },
  gold:   { dot: "bg-gold",    ring: "bg-gold/10"    },
};

const instrumentTabs = [
  { label: "FOREX", title: "FOREX", cta: "Learn Forex", path: "/trading",
    body1: "Trade the world's most popular forex and currency pairs with a trusted forex broker whether you are from South Africa, Kenya, Botswana or Nigeria.",
    body2: "Access 40+ major, minor, and exotic forex pairs with low spreads from 0.0. Start trading the world's leading currencies including EUR/USD, GBP/USD, and USD/JPY." },
  { label: "INDICES", title: "INDICES", cta: "Trade Indices", path: "/trading",
    body1: "Trade global stock market indices and gain exposure to entire economies through a single instrument.",
    body2: "Access the US500, UK100, GER40, JP225, HK50, AUS200 and more with competitive spreads and high liquidity." },
  { label: "GOLD & SILVER", title: "GOLD & SILVER", cta: "Trade Metals", path: "/trading",
    body1: "Trade precious metals as CFDs without physical delivery. Gold and Silver are among the most actively traded instruments globally.",
    body2: "XAU/USD spreads from just 0.75 pips. Trade safe-haven assets 24 hours a day, five days a week." },
  { label: "ENERGY", title: "ENERGY", cta: "Trade Energy", path: "/trading",
    body1: "Trade oil and energy CFDs including Brent Crude, WTI, and Natural Gas with deep liquidity and tight spreads.",
    body2: "Energy markets move on global supply and demand. Go long or short with full flexibility." },
  { label: "ETFs", title: "ETFs", cta: "Trade ETFs", path: "/trading",
    body1: "Trade Exchange-Traded Fund CFDs for broad, diversified exposure across sectors, commodities, and geographies.",
    body2: "Access SPY, QQQ, GLD, VTI, and 50+ more ETF instruments with competitive pricing." },
  { label: "SHARES", title: "SHARES", cta: "Trade Shares", path: "/trading",
    body1: "Trade CFDs on global company stocks including Apple, Tesla, Amazon, NVIDIA, and 300+ other companies.",
    body2: "Go long or short on the world's most liquid equities. No stamp duty, no physical delivery required." },
];

function StarRow({ count }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${i < Math.floor(count) ? "fill-[#F5A623]" : "fill-[#DDE3EE]"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ChartBars() {
  const bars = [
    { h: "40%", delay: "0.1s", hi: false }, { h: "65%", delay: "0.2s", hi: false },
    { h: "45%", delay: "0.3s", hi: false }, { h: "80%", delay: "0.4s", hi: true  },
    { h: "55%", delay: "0.5s", hi: false }, { h: "90%", delay: "0.6s", hi: false },
    { h: "70%", delay: "0.7s", hi: false },
  ];
  return (
    <div className="flex items-end gap-2 mb-4" style={{ height: 80 }}>
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t-[4px]"
          style={{
            height: b.h,
            background: b.hi
              ? "linear-gradient(to top, #FF6B35, rgba(255,107,53,0.3))"
              : "linear-gradient(to top, #00B4A6, rgba(0,180,166,0.3))",
            animation: `growBar 1s ease-out ${b.delay} both`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  return (
    <PublicLayout>

      {/* HERO */}
      <section className="relative min-h-screen bg-primary flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(0,180,166,0.18), transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(232,80,10,0.15), transparent 60%)" }} />
          <div className="absolute top-1/4 left-1/2 w-[300px] h-[300px] rounded-full blur-[80px]"
            style={{ background: "radial-gradient(ellipse, rgba(245,166,35,0.08), transparent 50%)" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="max-w-[1200px] mx-auto px-10 w-full py-20 grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse2" />
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#FF6B35]">Award-Winning CFD Broker</span>
            </div>

            <h1 className="font-display font-extrabold text-white leading-[1.08] mb-6" style={{ fontSize: "clamp(36px,5vw,62px)" }}>
              vāntãgeCFD<br /><span className="text-[#FF6B35]">Ultimate Trading</span><br />Machine
            </h1>

            <p className="text-lg text-white/65 leading-relaxed mb-8 max-w-lg">
              An award-winning CFD platform trusted by 5,000,000+ traders. Trade forex, gold, indices, stocks and more — from 0.0 pips.
            </p>

            <div className="flex gap-3 mb-10 flex-wrap">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="flex-1 min-w-[200px] px-5 py-3.5 rounded-[10px] border border-white/15 bg-white/8 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all" />
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-accent text-white font-bold text-sm whitespace-nowrap hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
                style={{ boxShadow: "0 8px 24px rgba(232,80,10,0.4)" }}>
                Sign Up Now
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/10 flex-wrap">
              {[["5M+","Registered Users"],["1,000+","Trading Products"],["0.0","Pips From"],["$0","Deposit Fees"]].map(([val,lab]) => (
                <div key={lab}>
                  <div className="font-display font-extrabold text-2xl text-[#FF6B35]">{val}</div>
                  <div className="text-[13px] text-white/50 mt-0.5">{lab}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative" style={{ animation: "fadeIn 0.6s ease 0.2s both" }}>
            <div className="bg-white/7 backdrop-blur-xl border border-white/12 rounded-[20px] p-7 text-white">
              <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 mb-4">Portfolio Performance</div>
              <ChartBars />
              <div className="font-display font-extrabold text-3xl text-white">$25,324.23</div>
              <div className="text-sm text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />+12.4% This Month
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-[14px] px-4 py-3 shadow-2xl">
              <div className="text-[11px] text-[#8897A9] font-medium mb-1">XAU/USD · Gold</div>
              <div className="font-display font-bold text-lg text-[#0B1E3D]">2,341.50</div>
              <div className="text-[11px] text-[#00B4A6] font-semibold mt-0.5">+0.75 pips spread</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-[14px] px-4 py-3 shadow-2xl">
              <div className="text-[11px] text-[#8897A9] font-medium mb-1">Customer Support</div>
              <div className="font-display font-bold text-lg text-[#0B1E3D]">24/7</div>
              <StarRow count={5} />
            </div>
          </div>
        </div>
      </section>

      {/* PROMO STRIP */}
      <div className="bg-[#F4F6FA] border-t border-b border-[#DDE3EE] py-5 overflow-x-auto">
        <div className="max-w-[1200px] mx-auto px-10 flex gap-6 min-w-max">
          {promotions.map((promo) => {
            const c = promoAccentMap[promo.color] || promoAccentMap.accent;
            return (
              <div key={promo.id} className="bg-white border border-[#DDE3EE] rounded-[12px] px-5 py-4 flex items-center gap-4 min-w-[220px]"
                style={{ boxShadow: "0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className={`w-11 h-11 rounded-[10px] ${c.ring} flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-3.5 h-3.5 rounded-sm ${c.dot}`} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8897A9]">{promo.type}</div>
                  <div className="text-sm font-bold text-[#0B1E3D] mt-0.5">{promo.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPREADS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Competitive Pricing</p>
            <h2 className="font-display font-extrabold text-primary mb-4" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.15 }}>
              See Our <span className="text-accent">Competitive Spreads</span>
            </h2>
            <p className="text-base text-[#4A5568] leading-relaxed max-w-[560px]">
              We consistently beat the market average — giving you an edge before you even place a trade.
            </p>
          </div>

          <div className="bg-white border border-[#DDE3EE] rounded-[20px] overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(11,30,61,0.10)" }}>
            <div className="grid grid-cols-3 bg-primary px-7 py-[18px] items-center">
              <div className="text-[13px] font-semibold text-white/70">Instrument</div>
              <div className="text-[13px] font-semibold text-white flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-[#00B4A6]" />vāntãgeCFD
              </div>
              <div className="text-[13px] font-semibold text-white/70 text-right">Market Average</div>
            </div>
            {spreadsData.map((row, i) => (
              <div key={row.pair}
                className={`grid grid-cols-3 px-7 py-[18px] items-center hover:bg-[#F4F6FA] transition-colors ${i < spreadsData.length - 1 ? "border-b border-[#DDE3EE]" : ""}`}>
                <div>
                  <div className="font-bold text-[#0B1E3D] text-[15px]">{row.pair}</div>
                  <div className="text-xs text-[#8897A9] mt-0.5">{row.category}</div>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                  <span className="font-display font-bold text-lg text-[#0B1E3D]">{row.ours}</span>
                </div>
                <div className="text-right font-display font-bold text-base text-[#4A5568]">{row.market}</div>
              </div>
            ))}
            <div className="bg-[#F4F6FA] px-7 py-3 text-xs text-[#8897A9]">
              Spreads are in pips. Last updated April 2026. All spreads are for indicative purposes only as net costs may differ at any time of day.
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-[12px] bg-accent text-white font-bold text-base hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 8px 24px rgba(232,80,10,0.25)" }}>
              Sign Up Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BROKER STATS — dark */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(0,180,166,0.10)" }} />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#00B4A6] mb-3">Why vāntãgeCFD</p>
            <h2 className="font-display font-extrabold text-4xl text-white">An Award-Winning Broker</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-[20px] overflow-hidden mb-16 border border-white/10" style={{ background: "rgba(255,255,255,0.10)", gap: "1px" }}>
            {[["5,000,000+","Registered Users"],["1,000+","Products"],["From 0.0","Pips Spreads"],["$0","Deposit Fees"]].map(([val,lab]) => (
              <div key={lab} className="py-10 text-center px-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="font-display font-extrabold text-4xl text-[#FF6B35] leading-none mb-2">{val}</div>
                <div className="text-sm text-white/60">{lab}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-7 h-7" />, title: "Trusted CFD Broker", desc: "With over 15 years of experience, vāntãgeCFD has built a reputation as a trusted, award-winning CFD broker. Trade 1,000+ products backed by seamless execution and 24/7 support." },
              { icon: <Zap className="w-7 h-7" />, title: "Secure Funds", desc: "Client funds are held in segregated trust accounts with top-tier banks, separate from our operational capital. Insurance coverage up to USD 1,000,000 per claimant." },
              { icon: <Globe className="w-7 h-7" />, title: "Competitive Spreads", desc: "Trade smarter with ultra-tight spreads designed to help you manage costs effectively. Competitive pricing across all products to optimise your trading." },
            ].map((f) => (
              <div key={f.title} className="border rounded-[20px] p-8 transition-all duration-200 hover:-translate-y-1 cursor-default"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
                <div className="text-[#00B4A6] mb-5">{f.icon}</div>
                <h3 className="font-display font-bold text-lg text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 bg-[#F4F6FA]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Ratings and Recognition</p>
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.15 }}>
              <span className="text-accent">Trust</span> We Have Earned
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {trustedBy.map((t) => (
              <div key={t.name} className="bg-white border border-[#DDE3EE] rounded-[12px] p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ boxShadow: "0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className="font-display font-bold text-sm text-[#0B1E3D] mb-3">{t.name}</div>
                <StarRow count={t.stars} />
                <div className="text-xs text-[#8897A9] mt-1.5">{t.stars} / 5.0</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-[#DDE3EE]">
            {pressLogos.map((p) => (
              <span key={p} className="font-display font-extrabold text-sm text-[#8897A9] hover:text-[#0B1E3D] transition-colors cursor-default tracking-wide">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* TRADE ANYTIME */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Access</p>
              <h2 className="font-display font-extrabold text-primary mb-6" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.15 }}>
                Trade <span className="text-accent">Anytime, Anywhere</span>
              </h2>
              <p className="text-base text-[#4A5568] leading-relaxed mb-4">
                One of the world's leading CFD brokers with over 15 years of market experience, vāntãgeCFD provides traders with access to 1,000+ CFD products, including forex, indices, commodities, shares, ETFs, and bonds.
              </p>
              <p className="text-base text-[#4A5568] leading-relaxed mb-6">
                Trade CFDs with ease on desktop or mobile using our variety of advanced trading tools and features from your home country, whether you are from South Africa, Kenya, Botswana or Nigeria.
              </p>
              <ul className="mb-8 divide-y divide-[#DDE3EE]">
                {["Trade CFDs from South Africa, Kenya, Botswana or Nigeria","Desktop and mobile trading with advanced tools","MetaTrader 4, MetaTrader 5, TradingView","24/7 dedicated customer support","Copy trading — follow expert traders"].map((item) => (
                  <li key={item} className="flex items-center gap-3 py-[10px] text-[15px] text-[#4A5568]">
                    <div className="w-[22px] h-[22px] rounded-full bg-teal/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#00B4A6]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all">
                  Open Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/platforms" className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] border border-[#DDE3EE] text-[#0B1E3D] font-bold text-sm hover:border-accent hover:text-accent transition-all">
                  View Platforms
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border border-[#DDE3EE] rounded-[20px] p-7" style={{ boxShadow: "0 12px 48px rgba(11,30,61,0.16)" }}>
                <div className="text-[14px] text-[#8897A9] mb-1 font-medium">Earnings — Trading Performance</div>
                <div className="font-display font-extrabold text-3xl text-[#0B1E3D] mb-6">$25,324.23 USD</div>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={earningsChartData}>
                    <defs>
                      <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8500A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#E8500A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8897A9" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0B1E3D", border: "none", borderRadius: 8, color: "white", fontSize: 12 }} formatter={(v) => [`$${v.toLocaleString()}`, "Value"]} />
                    <Area dataKey="value" stroke="#E8500A" strokeWidth={2.5} fill="url(#tradeGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[11px] text-[#8897A9] mt-2">
                  {["APR","MAY","JUN","JUL","AUG","SEP"].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white border border-[#DDE3EE] rounded-[12px] px-5 py-4 text-center"
                style={{ boxShadow: "0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className="font-display font-extrabold text-2xl text-[#0B1E3D]">24/7</div>
                <StarRow count={5} />
                <div className="text-xs font-semibold text-[#0B1E3D] mt-1">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUMENTS TABS */}
      <section className="py-24 bg-[#F4F6FA]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">What You Can Trade</p>
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.15 }}>
              Driving <span className="text-accent">Excellence</span> with a Leading CFD Broker
            </h2>
          </div>
          <div className="flex gap-1 mb-9 bg-[#EEF1F8] rounded-[10px] p-1 w-fit flex-wrap">
            {instrumentTabs.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className={`px-5 py-2 rounded-[8px] text-[13px] font-semibold transition-all ${activeTab === i ? "bg-white text-accent shadow-[0_4px_24px_rgba(11,30,61,0.10)]" : "text-[#4A5568] hover:text-primary"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-[#DDE3EE] rounded-[20px] p-10" style={{ boxShadow: "0 4px 24px rgba(11,30,61,0.10)" }}>
            <h3 className="font-display font-extrabold text-2xl text-[#0B1E3D] mb-3">{instrumentTabs[activeTab].title}</h3>
            <p className="text-[15px] text-[#4A5568] leading-relaxed mb-3">{instrumentTabs[activeTab].body1}</p>
            <p className="text-[15px] text-[#4A5568] leading-relaxed mb-6">{instrumentTabs[activeTab].body2}</p>
            <Link to={instrumentTabs[activeTab].path} className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 4px 16px rgba(232,80,10,0.25)" }}>
              {instrumentTabs[activeTab].cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORT CARDS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.15 }}>
              Support and <span className="text-accent">Resources</span>
            </h2>
            <p className="text-base text-[#4A5568] max-w-[560px] mx-auto mt-4 leading-relaxed">
              Get the answers, assistance, and education you need to support your trading journey.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { title: "24/7 Customer Support", action: "Chat Now", desc: "We provide support and account assistance at every stage of your journey. Our dedicated customer support team is available 24/7 to assist with any trading-related inquiries." },
              { title: "Help Center", action: "View More", desc: "Find answers to your questions quickly with our comprehensive Help Center. From account setup to trading strategies, our resources provide clear and detailed guidance." },
              { title: "Learn", action: "View More", desc: "Access free educational resources to expand your trading knowledge. Whether you are a beginner or an experienced trader, we have articles, webinars, videos, and courses." },
            ].map((c) => (
              <div key={c.title} className="border border-[#DDE3EE] rounded-[20px] px-7 py-9 text-center transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-xl">
                <h3 className="font-display font-bold text-lg text-[#0B1E3D] mb-3">{c.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed mb-6">{c.desc}</p>
                <button className="text-[13px] font-bold text-accent tracking-[0.04em] uppercase flex items-center gap-1.5 mx-auto hover:gap-2.5 transition-all">
                  {c.action} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0d2a50 50%, #0B3D3A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,180,166,0.15), transparent)" }} />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <h2 className="font-display font-extrabold text-white mb-4" style={{ fontSize: "clamp(28px,5vw,52px)" }}>
            Start Your Trading Now
          </h2>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Join over 5 million traders worldwide. Open an account in minutes.
          </p>
          <div className="flex items-center justify-center gap-12 my-10 border-y border-white/10 py-8 flex-wrap">
            {[["5,000,000+","Registered Users"],["1,000+","Products"],["0.0 pips","Spreads From"],["$0","Deposit Fees*"]].map(([val,lab]) => (
              <div key={lab} className="text-center">
                <div className="font-display font-extrabold text-3xl text-[#FF6B35]">{val}</div>
                <div className="text-sm text-white/50 mt-1">{lab}</div>
              </div>
            ))}
          </div>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-white font-bold text-base hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
            style={{ boxShadow: "0 16px 40px rgba(232,80,10,0.35)" }}>
            Start Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
