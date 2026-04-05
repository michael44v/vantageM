import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader } from "../components/ui";

const partnerTypes = [
  {
    id: "ib",
    title: "Introducing Broker (IB)",
    highlight: "$15 / Lot",
    highlightLabel: "per lot rebate",
    description:
      "Earn rebates on every trade your referred clients make. The more they trade, the more you earn — with no cap on your monthly income.",
    perks: [
      "Real-time rebate payments",
      "Dedicated IB portal and dashboard",
      "Multi-tier IB structure available",
      "Marketing materials and landing pages provided",
      "Personal account manager assigned",
      "Flexible withdrawal options",
    ],
  },
  {
    id: "cpa",
    title: "CPA Affiliate",
    highlight: "$800",
    highlightLabel: "per qualified client",
    description:
      "Earn a fixed Cost Per Acquisition for every new funded trader you refer. Get paid once per qualified client — no ongoing trading requirements.",
    perks: [
      "Up to $800 CPA per qualified client",
      "Fast monthly payout schedule",
      "Unique tracking links and landing pages",
      "Real-time conversion and click tracking",
      "Dedicated affiliate account manager",
      "Access to full performance reports",
    ],
  },
];

const steps = [
  { title: "Apply Online", desc: "Complete our simple application form. Approval typically takes 24 to 48 hours." },
  { title: "Get Your Links", desc: "Receive unique referral links, promotional materials, and access to the partner portal." },
  { title: "Refer Traders", desc: "Share your links across your channels. Track every referral in real time." },
  { title: "Earn Commissions", desc: "Receive rebates or CPA payments monthly, directly to your bank or e-wallet." },
];

export default function PartnersPage() {
  const [clients, setClients] = useState(20);
  const [lots, setLots] = useState(15);
  const estimated = clients * lots * 15;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <p className="text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-2">/</span>Partner Program
          </p>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4 leading-tight">
            Earn More with the<br />
            <span className="text-gold">Vantage Partner Program</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl">
            Join thousands of IBs and affiliates earning generous commissions by referring clients to Vantage Markets.
          </p>
        </div>
      </section>

      {/* PARTNER TYPES */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader
            tag="Partnership Models"
            title={<>Choose Your <span className="text-accent">Partnership</span></>}
            subtitle="Two models designed to reward you based on how you bring in new traders."
          />
          <div className="grid lg:grid-cols-2 gap-7 mb-20">
            {partnerTypes.map((p) => (
              <div
                key={p.id}
                className="relative border-2 border-surface-border rounded-xl p-10 hover:border-accent hover:-translate-y-1 hover:shadow-xl transition-all duration-200 overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-xl" />
                <h3 className="font-display font-extrabold text-2xl text-primary mb-4">{p.title}</h3>
                <div className="inline-flex items-baseline gap-2 bg-gold/10 border border-gold/30 rounded-[10px] px-4 py-2.5 mb-5">
                  <span className="font-display font-extrabold text-2xl text-gold">{p.highlight}</span>
                  <span className="text-sm text-[#4A5568]">{p.highlightLabel}</span>
                </div>
                <p className="text-[#4A5568] leading-relaxed mb-6">{p.description}</p>
                <ul className="space-y-3 mb-8">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-sm text-[#4A5568] border-b border-surface-border pb-3 last:border-b-0 last:pb-0">
                      <Check className="w-4 h-4 text-teal flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                  {p.id === "ib" ? "Become an IB" : "Become an Affiliate"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* COMMISSION CALCULATOR */}
          <div className="bg-primary rounded-xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-12">
                <p className="text-xs font-bold uppercase tracking-widest text-teal mb-4">Calculator</p>
                <h2 className="font-display font-extrabold text-3xl text-white mb-4 leading-tight">
                  Estimate Your Monthly Earnings
                </h2>
                <p className="text-white/55 leading-relaxed">
                  Use our interactive calculator to see how much you could earn as an Vantage Markets IB based on your referral volume and client activity.
                </p>
              </div>
              <div className="bg-white/6 border-l border-white/10 p-12 flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-3">
                    Number of Active Clients: <span className="text-white font-extrabold text-base ml-1">{clients}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={clients}
                    onChange={(e) => setClients(Number(e.target.value))}
                    className="w-full accent-accent h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>1</span><span>200</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-3">
                    Avg Lots per Client / Month: <span className="text-white font-extrabold text-base ml-1">{lots}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={lots}
                    onChange={(e) => setLots(Number(e.target.value))}
                    className="w-full accent-accent h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>1</span><span>100</span>
                  </div>
                </div>
                <div className="bg-white/8 rounded-[12px] p-6 text-center border border-white/10">
                  <div className="text-xs text-white/40 mb-2">Estimated Monthly Earnings</div>
                  <div className="font-display font-extrabold text-5xl text-gold">
                    ${estimated.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/30 mt-2">Based on $15 rebate per lot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Process" title={<>How It <span className="text-accent">Works</span></>} center />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-accent to-teal hidden lg:block" />
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center z-10">
                <div className="w-20 h-20 rounded-full bg-white border-3 border-accent mx-auto flex items-center justify-center shadow-card mb-5" style={{ borderWidth: 3 }}>
                  <span className="font-display font-extrabold text-2xl text-accent">{i + 1}</span>
                </div>
                <h4 className="font-display font-bold text-base text-primary mb-2">{s.title}</h4>
                <p className="text-sm text-[#4A5568] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
