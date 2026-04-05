import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader, Badge } from "../components/ui";
import { instruments, accountTypes, spreadsData } from "../data/mockData";

function PageHero() {
  return (
    <section className="pt-20 pb-16 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-teal/15 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-[1200px] mx-auto px-10 relative z-10">
        <p className="text-sm text-white/40 mb-4">
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span>Trading</span>
        </p>
        <h1 className="font-display font-extrabold text-5xl text-white mb-4 leading-tight">
          Trade the World's<br />
          <span className="text-accent-light">Financial Markets</span>
        </h1>
        <p className="text-lg text-white/55 max-w-xl">
          Access 1,000+ CFD instruments across forex, gold, indices, shares, ETFs, and energy — with spreads from 0.0 pips.
        </p>
      </div>
    </section>
  );
}

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState("forex");
  const active = instruments.find((i) => i.id === activeTab);

  return (
    <PublicLayout>
      <PageHero />

      {/* INSTRUMENTS */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Instruments" title={<>What You Can <span className="text-accent">Trade</span></>} />

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap mb-10">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setActiveTab(inst.id)}
                className={`px-5 py-2.5 rounded-[12px] text-sm font-semibold border transition-all duration-200 ${
                  activeTab === inst.id
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-[#4A5568] border-surface-border hover:border-accent hover:text-accent"
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {active && (
            <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in">
              <div>
                <h2 className="font-display font-extrabold text-3xl text-primary mb-4">{active.title}</h2>
                <p className="text-[#4A5568] leading-relaxed mb-4">{active.description}</p>
                <p className="text-[#4A5568] leading-relaxed mb-6">{active.details}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {active.pairs.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1.5 bg-surface border border-surface-border rounded-full text-xs font-semibold text-primary"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Spread", value: active.spread },
                    { label: "Leverage", value: active.leverage },
                    { label: "Instruments", value: active.instruments },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface border border-surface-border rounded-[12px] p-4 text-center">
                      <div className="font-display font-bold text-base text-accent">{s.value}</div>
                      <div className="text-xs text-[#8897A9] mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                  Open Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Live spreads panel */}
              <div className="bg-primary rounded-xl p-7">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Live Spreads</div>
                <div className="space-y-0 divide-y divide-white/10">
                  {spreadsData
                    .filter((s) =>
                      active.id === "forex"
                        ? s.type === "major" || s.type === "minor"
                        : active.id === "gold"
                        ? s.type === "commodity"
                        : active.id === "indices"
                        ? s.type === "index"
                        : active.id === "energy"
                        ? s.type === "energy"
                        : true
                    )
                    .slice(0, 5)
                    .map((row) => (
                      <div key={row.pair} className="flex items-center justify-between py-3.5">
                        <div>
                          <div className="font-bold text-sm text-white">{row.pair}</div>
                          <div className="text-xs text-white/40 mt-0.5">{row.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold text-base text-teal">{row.ours} pips</div>
                          <div className="text-xs text-white/40">Market: {row.market}</div>
                        </div>
                      </div>
                    ))}
                  {spreadsData.filter((s) =>
                    active.id === "forex" ? s.type === "major" || s.type === "minor" : active.id === "gold" ? s.type === "commodity" : active.id === "indices" ? s.type === "index" : active.id === "energy" ? s.type === "energy" : true
                  ).length === 0 && (
                    <div className="py-6 text-center text-white/30 text-sm">
                      Live spread data loading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/25 mt-5">Spreads are indicative. Updated in real time during trading hours.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ACCOUNT TYPES */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader
            tag="Account Types"
            title={<>Choose Your <span className="text-accent">Trading Account</span></>}
            subtitle="Whether you are just starting or trading professionally, we have an account built for your goals."
          />
          <div className="grid lg:grid-cols-3 gap-6">
            {accountTypes.map((acc) => (
              <div
                key={acc.name}
                className={`relative rounded-xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  acc.featured
                    ? "bg-white border-2 border-accent shadow-lg"
                    : "bg-white border border-surface-border shadow-card"
                }`}
              >
                {acc.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="accent">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-display font-extrabold text-2xl text-primary mb-2">{acc.name}</h3>
                <p className="text-sm text-[#4A5568] mb-6 leading-relaxed">
                  {acc.name === "Standard"
                    ? "No commission, just the spread. Perfect for new traders."
                    : acc.name === "Raw ECN"
                    ? "Raw market spreads with ultra-low commission. Best value."
                    : "For professionals. Lowest commissions, tightest spreads."}
                </p>
                <ul className="space-y-0 divide-y divide-surface-border mb-8">
                  {[
                    ["Min Deposit", acc.minDeposit],
                    ["Spread", acc.spread],
                    ["Commission", acc.commission],
                    ["Leverage", acc.leverage],
                    ["Platforms", acc.platforms],
                  ].map(([k, v]) => (
                    <li key={k} className="flex justify-between py-3 text-sm">
                      <span className="text-[#8897A9]">{k}</span>
                      <span className="font-semibold text-primary">{v}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-[12px] text-sm font-bold transition-all ${
                    acc.featured
                      ? "bg-accent text-white hover:bg-accent-light"
                      : "bg-surface border border-surface-border text-primary hover:border-accent hover:text-accent"
                  }`}
                >
                  Open Account
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEES */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Pricing" title={<>Transparent <span className="text-accent">Pricing</span></>} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { val: "$0", label: "Deposit Fees", note: "Most methods free" },
              { val: "$0", label: "Withdrawal Fees", note: "Standard methods free" },
              { val: "0.0", label: "Min. Spread", note: "Raw ECN account" },
              { val: "$3", label: "Commission", note: "Per lot (Raw ECN)" },
            ].map((fee) => (
              <div key={fee.label} className="bg-surface border border-surface-border rounded-xl p-6 text-center">
                <div className="font-display font-extrabold text-4xl text-accent mb-2">{fee.val}</div>
                <div className="font-semibold text-primary text-sm mb-1">{fee.label}</div>
                <div className="text-xs text-[#8897A9]">{fee.note}</div>
              </div>
            ))}
          </div>
          <div className="bg-surface border border-surface-border rounded-[12px] px-5 py-4 text-xs text-[#8897A9] leading-relaxed">
            Other fees may apply based on payment method and region. Swap/overnight fees apply to positions held past rollover. Please review our full trading conditions for details.
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
