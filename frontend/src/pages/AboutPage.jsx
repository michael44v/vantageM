import { Link } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader } from "../components/ui";
import { regulations } from "../data/mockData";

const values = [
  { title: "Transparency", desc: "No hidden fees, no surprises. Every cost, condition, and commission is disclosed before you trade." },
  { title: "Speed and Reliability", desc: "Lightning-fast order execution with 99.9% server uptime. When you place an order, it fills — every time." },
  { title: "Security First", desc: "Client funds held in segregated accounts, protected by insurance coverage of up to USD 1,000,000." },
  { title: "Global Reach", desc: "Serving traders across Africa, Asia, Europe, and beyond — with localised support and payment methods." },
  { title: "Education", desc: "Free courses, webinars, market analysis, and a trading academy for all experience levels." },
  { title: "Partnership", desc: "We grow when our traders grow. Our incentives — from spreads to promotions — align with your success." },
];

const timeline = [
  { year: "2009", title: "vāntãgeCFD Founded", desc: "Started with a small team in Australia focused on providing transparent forex trading to retail traders." },
  { year: "2013", title: "ASIC Regulated", desc: "Received full ASIC regulation, cementing our commitment to the highest regulatory standards." },
  { year: "2016", title: "1 Million Users", desc: "Reached our first million registered traders. Expanded MT4 and MT5 offerings with copy trading features." },
  { year: "2019", title: "African Expansion", desc: "Launched dedicated services for South Africa, Kenya, Nigeria, and Botswana with localised payment methods." },
  { year: "2021", title: "FCA Authorised", desc: "Received FCA authorisation in the United Kingdom, extending our regulated presence to European clients." },
  { year: "2024", title: "5 Million Traders", desc: "Reached the 5 million registered user milestone. Launched the vāntãgeCFD proprietary app and TradingView integration." },
  { year: "2026", title: "The Journey Continues", desc: "Expanding product range, enhancing technology, and continuing to serve traders across 100+ countries worldwide." },
];

const awards = [
  { title: "Best CFD Broker — Africa", issuer: "Global Forex Awards 2025" },
  { title: "Most Trusted Broker", issuer: "Forex Brokers Awards 2024" },
  { title: "Best Trading Platform", issuer: "WikiFX Global Awards 2024" },
  { title: "Excellence in Customer Service", issuer: "DayTrading Awards 2025" },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-teal/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <p className="text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-2">/</span>About
          </p>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4 leading-tight">
            About <span className="text-accent-light">vāntãgeCFD</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl">
            A globally trusted CFD broker with 15+ years of experience — built for traders who demand institutional quality from their broker.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start mb-20">
            <div>
              <SectionHeader tag="Our Mission" title={<>Making Professional Trading <span className="text-accent">Accessible to All</span></>} />
              <p className="text-[#4A5568] leading-relaxed mb-4">
                vāntãgeCFD was founded with a single mission: to democratise access to global financial markets for every trader, whether they are based in Lagos, Nairobi, Johannesburg, or London.
              </p>
              <p className="text-[#4A5568] leading-relaxed mb-4">
                We believe every trader deserves institutional-grade technology, fair pricing, and transparent execution — regardless of account size.
              </p>
              <p className="text-[#4A5568] leading-relaxed">
                That is why we offer spreads from 0.0 pips, zero deposit fees, and access to 1,000+ instruments on platforms that professionals and beginners alike can rely on.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "2009", lab: "Year Founded" },
                { val: "5M+", lab: "Registered Users" },
                { val: "15+", lab: "Years Experience" },
                { val: "100+", lab: "Countries Served" },
              ].map((s) => (
                <div key={s.lab} className="bg-primary rounded-xl p-7 text-center">
                  <div className="font-display font-extrabold text-4xl text-accent-light mb-2">{s.val}</div>
                  <div className="text-sm text-white/50">{s.lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* VALUES */}
          <SectionHeader tag="Our Values" title={<>What We <span className="text-accent">Stand For</span></>} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="border border-surface-border rounded-xl p-7 hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-2 h-8 bg-accent rounded-full mb-4" />
                <h3 className="font-display font-bold text-base text-primary mb-3">{v.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGULATION */}
      <section id="regulation" className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader
            tag="Regulation"
            title={<>Fully Regulated and <span className="text-accent">Globally Trusted</span></>}
            subtitle="vāntãgeCFD operates under strict regulatory oversight across multiple jurisdictions — ensuring the highest standards of client protection."
            center
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {regulations.map((reg) => (
              <div key={reg.authority} className="bg-white border border-surface-border rounded-xl p-6 text-center shadow-card hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="font-display font-extrabold text-2xl text-primary mb-1">{reg.authority}</div>
                <div className="text-sm font-semibold text-[#4A5568] mb-2">{reg.region}</div>
                <div className="text-xs text-[#8897A9] leading-relaxed">{reg.number}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-surface-border rounded-[12px] p-5 text-xs text-[#8897A9] leading-relaxed">
            VIG Group, operating under the brand vāntãgeCFD, is an investment dealer authorised and regulated by the Mauritius Financial Services Commission (FSC). Business operations are protected by insurance coverage provided by Willis Towers Watson (WTW), a global insurance brokerage established in 1828. This coverage includes claims eligibility of up to USD 1,000,000 per claimant. vāntãgeCFD is a member of The Financial Commission, an international organisation engaged in the resolution of disputes within the financial services industry.
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Our Journey" title={<>A History of <span className="text-accent">Excellence</span></>} />
          <div className="relative pl-10 border-l-2 border-gradient" style={{ borderImage: "linear-gradient(to bottom, #FFC800, #00B4A6) 1" }}>
            <div className="space-y-10">
              {timeline.map((item) => (
                <div key={item.year} className="relative">
                  <div className="absolute -left-[2.85rem] top-1 w-3.5 h-3.5 rounded-full bg-accent border-2 border-white shadow-md" />
                  <div className="text-xs font-extrabold text-accent uppercase tracking-widest mb-1">{item.year}</div>
                  <h3 className="font-display font-bold text-base text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10">
          <SectionHeader tag="Awards" title={<>Industry <span className="text-accent">Recognition</span></>} center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {awards.map((a) => (
              <div
                key={a.title}
                className="bg-white border border-surface-border rounded-xl p-6 text-center hover:border-gold/50 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <div className="w-3.5 h-3.5 rounded-sm bg-gold" />
                </div>
                <h4 className="font-display font-bold text-sm text-primary mb-2">{a.title}</h4>
                <div className="text-xs text-[#8897A9]">{a.issuer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
