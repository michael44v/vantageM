import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Shield, Zap, Globe, Star, ChevronRight,
  TrendingUp, Check, Play, Award, BarChart2, Users,
  Lock, Clock, ChevronDown, Activity, Wifi
} from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { spreadsData, earningsChartData, promotions } from "../data/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

/* ─── static data ─────────────────────────────────────────────────── */
const trustedBy = [
  { name: "Google",         stars: 4.5 },
  { name: "Trustpilot",     stars: 4.4 },
  { name: "App Store",      stars: 4.6 },
  { name: "ForexBrokers",   stars: 4.3 },
  { name: "WikiFX",         stars: 4.5 },
  { name: "DayTrading",     stars: 4.4 },
  { name: "Google Play",    stars: 4.5 },
  { name: "Finance Review", stars: 5.0 },
];

const pressLogos = ["CNBC","Reuters","CNN","Financial Times","Business Insider","Yahoo Finance"];

const promoAccentMap = {
  accent: { dot: "bg-accent",  ring: "bg-accent/10"  },
  teal:   { dot: "bg-teal",    ring: "bg-teal/10"    },
  gold:   { dot: "bg-gold",    ring: "bg-gold/10"    },
};

const instrumentTabs = [
  { label:"FOREX",       title:"FOREX",       cta:"Learn Forex",   path:"/trading",
    body1:"Trade the world's most popular forex and currency pairs with a trusted forex broker whether you are from South Africa, Kenya, Botswana or Nigeria.",
    body2:"Access 40+ major, minor, and exotic forex pairs with low spreads from 0.0. Start trading the world's leading currencies including EUR/USD, GBP/USD, and USD/JPY." },
  { label:"INDICES",     title:"INDICES",     cta:"Trade Indices",  path:"/trading",
    body1:"Trade global stock market indices and gain exposure to entire economies through a single instrument.",
    body2:"Access the US500, UK100, GER40, JP225, HK50, AUS200 and more with competitive spreads and high liquidity." },
  { label:"GOLD & SILVER",title:"GOLD & SILVER",cta:"Trade Metals", path:"/trading",
    body1:"Trade precious metals as CFDs without physical delivery. Gold and Silver are among the most actively traded instruments globally.",
    body2:"XAU/USD spreads from just 0.75 pips. Trade safe-haven assets 24 hours a day, five days a week." },
  { label:"ENERGY",      title:"ENERGY",      cta:"Trade Energy",   path:"/trading",
    body1:"Trade oil and energy CFDs including Brent Crude, WTI, and Natural Gas with deep liquidity and tight spreads.",
    body2:"Energy markets move on global supply and demand. Go long or short with full flexibility." },
  { label:"ETFs",        title:"ETFs",        cta:"Trade ETFs",     path:"/trading",
    body1:"Trade Exchange-Traded Fund CFDs for broad, diversified exposure across sectors, commodities, and geographies.",
    body2:"Access SPY, QQQ, GLD, VTI, and 50+ more ETF instruments with competitive pricing." },
  { label:"SHARES",      title:"SHARES",      cta:"Trade Shares",   path:"/trading",
    body1:"Trade CFDs on global company stocks including Apple, Tesla, Amazon, NVIDIA, and 300+ other companies.",
    body2:"Go long or short on the world's most liquid equities. No stamp duty, no physical delivery required." },
];

/* platform icons as inline SVG / emoji stand-ins (replace with real logos) */
const platforms = [
  { name:"MetaTrader 4",  short:"MT4",  color:"#1a73e8" },
  { name:"MetaTrader 5",  short:"MT5",  color:"#0f9d58" },
  { name:"TradingView",   short:"TV",   color:"#131722" },
  { name:"Google Play",   short:"GP",   color:"#EA4335" },
  { name:"App Store",     short:"AS",   color:"#0070C9" },
  { name:"WebTrader",     short:"WT",   color:"#FF6B35" },
];

/* live ticker data */
const tickerItems = [
  { pair:"EUR/USD", price:"1.0842", change:"+0.12%", up:true  },
  { pair:"XAU/USD", price:"2,341.50", change:"+0.75%", up:true  },
  { pair:"BTC/USD", price:"64,320.00", change:"-1.23%", up:false },
  { pair:"US500",   price:"5,234.10", change:"+0.44%", up:true  },
  { pair:"GBP/USD", price:"1.2651", change:"-0.08%", up:false },
  { pair:"OIL/USD", price:"83.42",  change:"+1.10%", up:true  },
  { pair:"USD/JPY", price:"154.23", change:"+0.33%", up:true  },
  { pair:"ETH/USD", price:"3,124.80",change:"-0.55%", up:false },
];

/* award cards */
const awards = [
  { year:"2024", title:"Best CFD Broker",       org:"ForexBrokers.com",   icon:"🏆" },
  { year:"2024", title:"Best Trading Platform",  org:"Finance Magnates",   icon:"🥇" },
  { year:"2023", title:"Most Trusted Broker",    org:"WikiFX",             icon:"🛡️" },
  { year:"2023", title:"Best Mobile Trading",    org:"DayTrading.com",     icon:"📱" },
  { year:"2022", title:"Best Customer Support",  org:"Global Forex Awards", icon:"⭐" },
  { year:"2022", title:"Best Execution Quality", org:"Investment Trends",  icon:"⚡" },
];

/* how it works steps */
const steps = [
  { n:"01", title:"Create Account",   desc:"Sign up in minutes with just your email. No complex paperwork to start.", icon:<Users className="w-7 h-7"/> },
  { n:"02", title:"Verify Identity",  desc:"Quick KYC process. Upload your ID and proof of address — done in under 5 minutes.", icon:<Lock className="w-7 h-7"/> },
  { n:"03", title:"Fund Your Account",desc:"Deposit via bank transfer, card, or e-wallet. $0 deposit fees, instant credit.", icon:<BarChart2 className="w-7 h-7"/> },
  { n:"04", title:"Start Trading",    desc:"Access 1,000+ instruments from forex to gold, indices, shares, ETFs and more.", icon:<Activity className="w-7 h-7"/> },
];

/* ─── tiny helpers ─────────────────────────────────────────────────── */
function StarRow({ count }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 ${i < Math.floor(count) ? "fill-[#F5A623]" : "fill-[#DDE3EE]"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function ChartBars() {
  const bars = [
    { h:"40%",delay:"0.1s",hi:false },{ h:"65%",delay:"0.2s",hi:false },
    { h:"45%",delay:"0.3s",hi:false },{ h:"80%",delay:"0.4s",hi:true  },
    { h:"55%",delay:"0.5s",hi:false },{ h:"90%",delay:"0.6s",hi:false },
    { h:"70%",delay:"0.7s",hi:false },
  ];
  return (
    <div className="flex items-end gap-2 mb-4" style={{ height:80 }}>
      {bars.map((b,i) => (
        <div key={i} className="flex-1 rounded-t-[4px]"
          style={{
            height:b.h,
            background: b.hi
              ? "linear-gradient(to top,#FF6B35,rgba(255,107,53,0.3))"
              : "linear-gradient(to top,#00B4A6,rgba(0,180,166,0.3))",
            animation:`growBar 1s ease-out ${b.delay} both`,
          }}/>
      ))}
    </div>
  );
}

/* ─── Live Ticker ──────────────────────────────────────────────────── */
function LiveTicker() {
  const [offset, setOffset] = useState(0);
  const speed = 0.6;
  useEffect(() => {
    let raf;
    const tick = () => {
      setOffset(prev => {
        const next = prev - speed;
        // reset when one full copy has scrolled
        return next <= -1800 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="bg-[#050E1F] border-b border-white/10 overflow-hidden py-2.5" style={{ position:"relative" }}>
      <div className="flex items-center" style={{ transform:`translateX(${offset}px)`, whiteSpace:"nowrap", willChange:"transform" }}>
        {items.map((t, i) => (
          <div key={i} className="inline-flex items-center gap-3 px-8 border-r border-white/10">
            <span className="text-[11px] font-bold tracking-wider text-white/40 uppercase">{t.pair}</span>
            <span className="text-[13px] font-bold text-white font-mono">{t.price}</span>
            <span className={`text-[11px] font-bold ${t.up ? "text-emerald-400" : "text-red-400"}`}>
              {t.change}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.up ? "bg-emerald-400" : "bg-red-400"}`}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Counter animation hook ───────────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const num = parseFloat(target.replace(/[^0-9.]/g,""));
    const raf = (now) => {
      const pct = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCount(Math.floor(eased * num));
      if (pct < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [start]);
  return count;
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function HomePage() {
  const [email, setEmail]       = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  /* Ferrari / supercar video — using a reliable public mp4 fallback */
  const videoSrc = "https://www.w3schools.com/html/mov_bbb.mp4"; // replace with actual Ferrari video URL

  return (
    <PublicLayout>

      {/* ── LIVE TICKER ── */}
      <LiveTicker />

      {/* ══════════════════════════════════════════════════════════════
          HERO — Ferrari video background
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Video BG */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter:"brightness(0.28) saturate(1.2)" }}
        >
          {/* Primary: Ferrari/supercar GIF-like looping video */}
          <source
            src="https://cdn.pixabay.com/video/2016/09/08/5118-182948005_large.mp4"
            type="video/mp4"
          />
          {/* Fallback */}
          <source src={videoSrc} type="video/mp4"/>
        </video>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:"linear-gradient(120deg, rgba(11,30,61,0.92) 0%, rgba(11,30,61,0.55) 50%, rgba(0,0,0,0.75) 100%)"
        }}/>
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background:"linear-gradient(to top,#0B1E3D,transparent)" }}/>

        {/* Scanline texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 3px)", backgroundSize:"100% 3px" }}/>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>

        {/* Ambient glows */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none"
          style={{ background:"radial-gradient(ellipse,rgba(0,180,166,0.22),transparent 70%)" }}/>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
          style={{ background:"radial-gradient(ellipse,rgba(232,80,10,0.18),transparent 60%)" }}/>

        <div className="max-w-[1200px] mx-auto px-10 w-full py-24 grid lg:grid-cols-2 gap-20 items-center relative z-10">

          {/* LEFT */}
          <div style={{ animation:"fadeSlideUp 0.9s cubic-bezier(.22,1,.36,1) both" }}>

            <div className="inline-flex items-center gap-2 mb-6 rounded-full px-4 py-1.5"
              style={{ background:"rgba(255,107,53,0.15)", border:"1px solid rgba(255,107,53,0.35)" }}>
              <Wifi className="w-3.5 h-3.5 text-[#FF6B35]"/>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#FF6B35]">Live Markets · Award-Winning CFD Broker</span>
            </div>

            <h1 className="font-display font-extrabold text-white leading-[1.06] mb-6"
              style={{ fontSize:"clamp(38px,5.5vw,68px)", letterSpacing:"-0.02em" }}>
              vāntãgeCFD<br/>
              <span style={{ background:"linear-gradient(90deg,#FF6B35,#F5A623)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Ultimate Trading
              </span><br/>
              Machine
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg"
              style={{ animation:"fadeSlideUp 0.9s 0.15s cubic-bezier(.22,1,.36,1) both" }}>
              An award-winning CFD platform trusted by 5,000,000+ traders.
              Trade forex, gold, indices, stocks and more — from 0.0 pips.
            </p>

            <div className="flex gap-3 mb-8 flex-wrap" style={{ animation:"fadeSlideUp 0.9s 0.25s cubic-bezier(.22,1,.36,1) both" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="flex-1 min-w-[200px] px-5 py-3.5 rounded-[10px] text-white placeholder-white/35 focus:outline-none text-sm transition-all"
                style={{ border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)" }}
                onFocus={e => (e.target.style.borderColor="rgba(255,107,53,0.7)")}
                onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.15)")}/>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] text-white font-bold text-sm whitespace-nowrap transition-all hover:-translate-y-0.5"
                style={{ background:"linear-gradient(135deg,#E8500A,#FF6B35)", boxShadow:"0 8px 32px rgba(232,80,10,0.45)" }}>
                Sign Up Free <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>

            {/* Platform icons strip */}
            <div style={{ animation:"fadeSlideUp 0.9s 0.35s cubic-bezier(.22,1,.36,1) both" }}>
              <p className="text-[11px] text-white/35 uppercase tracking-widest mb-3">Available on</p>
              <div className="flex items-center gap-3 flex-wrap">
                {platforms.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-[8px] transition-all hover:-translate-y-0.5 cursor-pointer"
                    style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(6px)" }}
                    title={p.name}>
                    <div className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background:p.color }}>
                      {p.short}
                    </div>
                    <span className="text-[11px] font-semibold text-white/60 hidden sm:block">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-8 mt-8 border-t border-white/10 flex-wrap"
              style={{ animation:"fadeSlideUp 0.9s 0.45s cubic-bezier(.22,1,.36,1) both" }}>
              {[["5M+","Registered Users"],["1,000+","Trading Products"],["0.0","Pips From"],["$0","Deposit Fees"]].map(([val,lab]) => (
                <div key={lab}>
                  <div className="font-display font-extrabold text-2xl"
                    style={{ background:"linear-gradient(90deg,#FF6B35,#F5A623)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {val}
                  </div>
                  <div className="text-[12px] text-white/45 mt-0.5">{lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — trading card */}
          <div className="hidden lg:block relative" style={{ animation:"fadeSlideUp 0.9s 0.2s cubic-bezier(.22,1,.36,1) both" }}>
            <div className="rounded-[24px] p-7 text-white"
              style={{ background:"rgba(255,255,255,0.07)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">Portfolio Performance</div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>LIVE
                </div>
              </div>
              <ChartBars/>
              <div className="font-display font-extrabold text-3xl text-white">$25,324.23</div>
              <div className="text-sm text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4"/>+12.4% This Month
              </div>
            </div>

            {/* floating badges */}
            <div className="absolute -top-5 -right-5 bg-white rounded-[14px] px-4 py-3 shadow-2xl"
              style={{ animation:"floatY 4s ease-in-out infinite" }}>
              <div className="text-[10px] text-[#8897A9] font-medium mb-1">XAU/USD · Gold</div>
              <div className="font-display font-bold text-lg text-[#0B1E3D]">2,341.50</div>
              <div className="text-[10px] text-[#00B4A6] font-semibold mt-0.5">↑ 0.75 pips spread</div>
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white rounded-[14px] px-4 py-3 shadow-2xl"
              style={{ animation:"floatY 4s 2s ease-in-out infinite" }}>
              <div className="text-[10px] text-[#8897A9] font-medium mb-1">Customer Support</div>
              <div className="font-display font-bold text-lg text-[#0B1E3D]">24 / 7</div>
              <StarRow count={5}/>
            </div>

            <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white rounded-[14px] px-4 py-3 shadow-2xl"
              style={{ animation:"floatY 4s 1s ease-in-out infinite" }}>
              <div className="text-[10px] text-[#8897A9] mb-1">New Trade Opened</div>
              <div className="text-sm font-bold text-[#0B1E3D]">EUR/USD ↗ Buy</div>
              <div className="text-[10px] text-emerald-500 font-semibold">+$342.80 profit</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 flex flex-col items-center gap-2"
          style={{ animation:"bounce 2s infinite" }}>
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5"/>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROMO STRIP (unchanged content)
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#F4F6FA] border-t border-b border-[#DDE3EE] py-5 overflow-x-auto">
        <div className="max-w-[1200px] mx-auto px-10 flex gap-6 min-w-max">
          {promotions.map(promo => {
            const c = promoAccentMap[promo.color] || promoAccentMap.accent;
            return (
              <div key={promo.id}
                className="bg-white border border-[#DDE3EE] rounded-[12px] px-5 py-4 flex items-center gap-4 min-w-[220px] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ boxShadow:"0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className={`w-11 h-11 rounded-[10px] ${c.ring} flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-3.5 h-3.5 rounded-sm ${c.dot}`}/>
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

      {/* ══════════════════════════════════════════════════════════════
          NEW SECTION 1 — HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#050E1F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"linear-gradient(rgba(0,180,166,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,166,0.04) 1px,transparent 1px)", backgroundSize:"80px 80px" }}/>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,#00B4A6,transparent)" }}/>

        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.12em] uppercase text-[#00B4A6] mb-3">Simple Onboarding</p>
            <h2 className="font-display font-extrabold text-white" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              Start Trading in <span style={{ background:"linear-gradient(90deg,#FF6B35,#F5A623)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>4 Steps</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-md mx-auto text-base leading-relaxed">
              From zero to live trading in minutes. No complexity, no hidden barriers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* connector line */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px hidden lg:block"
              style={{ background:"linear-gradient(90deg,transparent,#00B4A6,#FF6B35,transparent)", opacity:0.4 }}/>

            {steps.map((s, i) => (
              <div key={s.n}
                className="relative rounded-[20px] p-7 text-center group transition-all duration-300 hover:-translate-y-2 cursor-default"
                style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  animation:`fadeSlideUp 0.7s ${0.1 + i * 0.12}s cubic-bezier(.22,1,.36,1) both`,
                }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center relative"
                  style={{ background:"linear-gradient(135deg,rgba(232,80,10,0.2),rgba(0,180,166,0.2))", border:"1px solid rgba(255,107,53,0.3)" }}>
                  <div className="text-[#FF6B35]">{s.icon}</div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center text-[10px] font-black text-white">{s.n}</div>
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">{s.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm transition-all hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg,#E8500A,#FF6B35)", boxShadow:"0 8px 32px rgba(232,80,10,0.35)" }}>
              Open Free Account <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SPREADS (unchanged content, enhanced animation)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Competitive Pricing</p>
            <h2 className="font-display font-extrabold text-primary mb-4" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              See Our <span className="text-accent">Competitive Spreads</span>
            </h2>
            <p className="text-base text-[#4A5568] leading-relaxed max-w-[560px]">
              We consistently beat the market average — giving you an edge before you even place a trade.
            </p>
          </div>

          <div className="bg-white border border-[#DDE3EE] rounded-[20px] overflow-hidden" style={{ boxShadow:"0 4px 24px rgba(11,30,61,0.10)" }}>
            <div className="grid grid-cols-3 bg-primary px-7 py-[18px] items-center">
              <div className="text-[13px] font-semibold text-white/70">Instrument</div>
              <div className="text-[13px] font-semibold text-white flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-[#00B4A6]"/>vāntãgeCFD
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
                  <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]"/>
                  <span className="font-display font-bold text-lg text-[#0B1E3D]">{row.ours}</span>
                </div>
                <div className="text-right font-display font-bold text-base text-[#4A5568]">{row.market}</div>
              </div>
            ))}
            <div className="bg-[#F4F6FA] px-7 py-3 text-xs text-[#8897A9]">
              Spreads are in pips. Last updated April 2026. All spreads are for indicative purposes only.
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[12px] bg-accent text-white font-bold text-base hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
              style={{ boxShadow:"0 8px 24px rgba(232,80,10,0.25)" }}>
              Sign Up Now <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          NEW SECTION 2 — AWARDS WALL
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#0B1E3D 0%,#0d2a50 60%,#0B3D3A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(245,166,35,0.08),transparent)" }}/>

        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.12em] uppercase text-[#F5A623] mb-3">Global Recognition</p>
            <h2 className="font-display font-extrabold text-white" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              Industry <span style={{ background:"linear-gradient(90deg,#F5A623,#FF6B35)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Awards & Recognition</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-md mx-auto">
              Recognized by the world's most respected financial industry bodies year after year.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {awards.map((a, i) => (
              <div key={i}
                className="rounded-[20px] p-7 flex items-start gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group cursor-default"
                style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  animation:`fadeSlideUp 0.7s ${0.08 * i}s cubic-bezier(.22,1,.36,1) both`,
                }}>
                <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.2)" }}>
                  {a.icon}
                </div>
                <div>
                  <div className="text-[11px] text-[#F5A623] font-bold uppercase tracking-wider mb-1">{a.year}</div>
                  <div className="font-display font-bold text-white text-base leading-snug mb-1">{a.title}</div>
                  <div className="text-[12px] text-white/40">{a.org}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-[20px] p-8 text-center"
            style={{ background:"rgba(245,166,35,0.07)", border:"1px solid rgba(245,166,35,0.15)" }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="w-6 h-6 text-[#F5A623]"/>
              <span className="font-display font-bold text-white text-lg">30+ Industry Awards Since 2009</span>
            </div>
            <p className="text-white/50 text-sm max-w-lg mx-auto">
              Our consistent excellence in trading technology, customer service, and platform reliability has earned us recognition from leading global financial authorities.
            </p>
          </div>
        </div>
      </section>

      {/* BROKER STATS (unchanged content) */}
      <section className="py-24 bg-primary relative overflow-hidden" ref={statsRef}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background:"rgba(0,180,166,0.10)" }}/>
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#00B4A6] mb-3">Why vāntãgeCFD</p>
            <h2 className="font-display font-extrabold text-4xl text-white">An Award-Winning Broker</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-[20px] overflow-hidden mb-16 border border-white/10"
            style={{ background:"rgba(255,255,255,0.10)", gap:"1px" }}>
            {[["5,000,000+","Registered Users"],["1,000+","Products"],["From 0.0","Pips Spreads"],["$0","Deposit Fees"]].map(([val,lab]) => (
              <div key={lab} className="py-10 text-center px-4" style={{ background:"rgba(255,255,255,0.05)" }}>
                <div className="font-display font-extrabold text-4xl text-[#FF6B35] leading-none mb-2">{val}</div>
                <div className="text-sm text-white/60">{lab}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { icon:<Shield className="w-7 h-7"/>, title:"Trusted CFD Broker",    desc:"With over 15 years of experience, vāntãgeCFD has built a reputation as a trusted, award-winning CFD broker. Trade 1,000+ products backed by seamless execution and 24/7 support." },
              { icon:<Zap className="w-7 h-7"/>,    title:"Secure Funds",           desc:"Client funds are held in segregated trust accounts with top-tier banks, separate from our operational capital. Insurance coverage up to USD 1,000,000 per claimant." },
              { icon:<Globe className="w-7 h-7"/>,  title:"Competitive Spreads",    desc:"Trade smarter with ultra-tight spreads designed to help you manage costs effectively. Competitive pricing across all products to optimise your trading." },
            ].map(f => (
              <div key={f.title}
                className="border rounded-[20px] p-8 transition-all duration-200 hover:-translate-y-1 cursor-default"
                style={{ background:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.10)" }}
                onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.10)")}
                onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.06)")}>
                <div className="text-[#00B4A6] mb-5">{f.icon}</div>
                <h3 className="font-display font-bold text-lg text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST (unchanged content) */}
      <section className="py-24 bg-[#F4F6FA]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Ratings and Recognition</p>
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              <span className="text-accent">Trust</span> We Have Earned
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {trustedBy.map(t => (
              <div key={t.name}
                className="bg-white border border-[#DDE3EE] rounded-[12px] p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ boxShadow:"0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className="font-display font-bold text-sm text-[#0B1E3D] mb-3">{t.name}</div>
                <StarRow count={t.stars}/>
                <div className="text-xs text-[#8897A9] mt-1.5">{t.stars} / 5.0</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-[#DDE3EE]">
            {pressLogos.map(p => (
              <span key={p} className="font-display font-extrabold text-sm text-[#8897A9] hover:text-[#0B1E3D] transition-colors cursor-default tracking-wide">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* TRADE ANYTIME (unchanged content) */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">Access</p>
              <h2 className="font-display font-extrabold text-primary mb-6" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
                Trade <span className="text-accent">Anytime, Anywhere</span>
              </h2>
              <p className="text-base text-[#4A5568] leading-relaxed mb-4">
                One of the world's leading CFD brokers with over 15 years of market experience, vāntãgeCFD provides traders with access to 1,000+ CFD products, including forex, indices, commodities, shares, ETFs, and bonds.
              </p>
              <p className="text-base text-[#4A5568] leading-relaxed mb-6">
                Trade CFDs with ease on desktop or mobile using our variety of advanced trading tools and features from your home country, whether you are from South Africa, Kenya, Botswana or Nigeria.
              </p>
              <ul className="mb-8 divide-y divide-[#DDE3EE]">
                {["Trade CFDs from South Africa, Kenya, Botswana or Nigeria","Desktop and mobile trading with advanced tools","MetaTrader 4, MetaTrader 5, TradingView","24/7 dedicated customer support","Copy trading — follow expert traders"].map(item => (
                  <li key={item} className="flex items-center gap-3 py-[10px] text-[15px] text-[#4A5568]">
                    <div className="w-[22px] h-[22px] rounded-full bg-teal/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#00B4A6]"/>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all">
                  Open Account <ArrowRight className="w-4 h-4"/>
                </Link>
                <Link to="/platforms"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] border border-[#DDE3EE] text-[#0B1E3D] font-bold text-sm hover:border-accent hover:text-accent transition-all">
                  View Platforms
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border border-[#DDE3EE] rounded-[20px] p-7" style={{ boxShadow:"0 12px 48px rgba(11,30,61,0.16)" }}>
                <div className="text-[14px] text-[#8897A9] mb-1 font-medium">Earnings — Trading Performance</div>
                <div className="font-display font-extrabold text-3xl text-[#0B1E3D] mb-6">$25,324.23 USD</div>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={earningsChartData}>
                    <defs>
                      <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#E8500A" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#E8500A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#8897A9" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ background:"#0B1E3D", border:"none", borderRadius:8, color:"white", fontSize:12 }}
                      formatter={v => [`$${v.toLocaleString()}`,"Value"]}/>
                    <Area dataKey="value" stroke="#E8500A" strokeWidth={2.5} fill="url(#tradeGrad)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[11px] text-[#8897A9] mt-2">
                  {["APR","MAY","JUN","JUL","AUG","SEP"].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white border border-[#DDE3EE] rounded-[12px] px-5 py-4 text-center"
                style={{ boxShadow:"0 4px 24px rgba(11,30,61,0.10)" }}>
                <div className="font-display font-extrabold text-2xl text-[#0B1E3D]">24/7</div>
                <StarRow count={5}/>
                <div className="text-xs font-semibold text-[#0B1E3D] mt-1">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUMENTS TABS (unchanged content) */}
      <section className="py-24 bg-[#F4F6FA]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-accent mb-3">What You Can Trade</p>
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              Driving <span className="text-accent">Excellence</span> with a Leading CFD Broker
            </h2>
          </div>
          <div className="flex gap-1 mb-9 bg-[#EEF1F8] rounded-[10px] p-1 w-fit flex-wrap">
            {instrumentTabs.map((tab,i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                className={`px-5 py-2 rounded-[8px] text-[13px] font-semibold transition-all ${activeTab === i ? "bg-white text-accent shadow-[0_4px_24px_rgba(11,30,61,0.10)]" : "text-[#4A5568] hover:text-primary"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-[#DDE3EE] rounded-[20px] p-10" style={{ boxShadow:"0 4px 24px rgba(11,30,61,0.10)" }}>
            <h3 className="font-display font-extrabold text-2xl text-[#0B1E3D] mb-3">{instrumentTabs[activeTab].title}</h3>
            <p className="text-[15px] text-[#4A5568] leading-relaxed mb-3">{instrumentTabs[activeTab].body1}</p>
            <p className="text-[15px] text-[#4A5568] leading-relaxed mb-6">{instrumentTabs[activeTab].body2}</p>
            <Link to={instrumentTabs[activeTab].path}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-accent text-white font-bold text-sm hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
              style={{ boxShadow:"0 4px 16px rgba(232,80,10,0.25)" }}>
              {instrumentTabs[activeTab].cta} <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          NEW SECTION 3 — REAL-TIME MARKET SNAPSHOT
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#050E1F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"linear-gradient(rgba(0,180,166,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,166,0.03) 1px,transparent 1px)", backgroundSize:"80px 80px" }}/>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(232,80,10,0.6),transparent)" }}/>

        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.12em] uppercase text-[#FF6B35] mb-3">Live Markets</p>
            <h2 className="font-display font-extrabold text-white" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              Real-Time Market <span style={{ background:"linear-gradient(90deg,#00B4A6,#0070C9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Snapshot</span>
            </h2>
            <p className="text-white/45 mt-4 max-w-md mx-auto">
              Live prices across all major asset classes — always up to date, always competitive.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tickerItems.map((t, i) => (
              <div key={i}
                className="rounded-[16px] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-default group"
                style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  animation:`fadeSlideUp 0.6s ${0.06 * i}s cubic-bezier(.22,1,.36,1) both`,
                }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">{t.pair}</div>
                    <div className="font-mono font-bold text-2xl text-white mt-1">{t.price}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${t.up ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
                    {t.up ? "▲" : "▼"} {t.change}
                  </div>
                </div>
                {/* mini sparkline placeholder */}
                <div className="h-10 flex items-end gap-0.5 opacity-50 group-hover:opacity-80 transition-opacity">
                  {Array.from({ length: 20 }).map((_, j) => {
                    const h = 20 + Math.sin(j * 0.8 + i) * 15 + Math.random() * 10;
                    return (
                      <div key={j} className="flex-1 rounded-sm"
                        style={{
                          height:`${h}px`,
                          background: t.up
                            ? `rgba(52,211,153,${0.3 + (j / 20) * 0.7})`
                            : `rgba(248,113,113,${0.3 + (j / 20) * 0.7})`,
                        }}/>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/trading"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white transition-all hover:-translate-y-0.5"
              style={{ background:"rgba(0,180,166,0.15)", border:"1px solid rgba(0,180,166,0.35)" }}>
              View All Markets <ChevronRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORT CARDS (unchanged content) */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-primary" style={{ fontSize:"clamp(28px,4vw,44px)", lineHeight:1.15 }}>
              Support and <span className="text-accent">Resources</span>
            </h2>
            <p className="text-base text-[#4A5568] max-w-[560px] mx-auto mt-4 leading-relaxed">
              Get the answers, assistance, and education you need to support your trading journey.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { title:"24/7 Customer Support", action:"Chat Now", desc:"We provide support and account assistance at every stage of your journey. Our dedicated customer support team is available 24/7 to assist with any trading-related inquiries." },
              { title:"Help Center",           action:"View More", desc:"Find answers to your questions quickly with our comprehensive Help Center. From account setup to trading strategies, our resources provide clear and detailed guidance." },
              { title:"Learn",                 action:"View More", desc:"Access free educational resources to expand your trading knowledge. Whether you are a beginner or an experienced trader, we have articles, webinars, videos, and courses." },
            ].map(c => (
              <div key={c.title}
                className="border border-[#DDE3EE] rounded-[20px] px-7 py-9 text-center transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-xl">
                <h3 className="font-display font-bold text-lg text-[#0B1E3D] mb-3">{c.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed mb-6">{c.desc}</p>
                <button className="text-[13px] font-bold text-accent tracking-[0.04em] uppercase flex items-center gap-1.5 mx-auto hover:gap-2.5 transition-all">
                  {c.action} <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER (unchanged content) */}
      <section className="py-24 text-center relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#0B1E3D 0%,#0d2a50 50%,#0B3D3A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse 70% 80% at 50% 50%,rgba(0,180,166,0.15),transparent)" }}/>
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <h2 className="font-display font-extrabold text-white mb-4" style={{ fontSize:"clamp(28px,5vw,52px)" }}>
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
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-accent text-white font-bold text-base hover:bg-[#FF6B35] hover:-translate-y-0.5 transition-all"
            style={{ boxShadow:"0 16px 40px rgba(232,80,10,0.35)" }}>
            Start Now <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      </section>

      {/* ── Global animation keyframes ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes growBar {
          from { transform:scaleY(0); transform-origin:bottom; }
          to   { transform:scaleY(1); transform-origin:bottom; }
        }
        @keyframes bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(8px); }
        }
        @keyframes pulse2 {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        .animate-pulse2 { animation:pulse2 2s infinite; }
      `}</style>

    </PublicLayout>
  );
}