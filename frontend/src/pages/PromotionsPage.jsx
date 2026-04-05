import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { SectionHeader, Badge } from "../components/ui";
import { promotions } from "../data/mockData";

const allPromos = [
  ...promotions,
  {
    id: "refer",
    title: "13% p.a. Funds Growth",
    subtitle: "Earn on idle balance",
    highlight: "13% p.a.",
    description: "Earn up to 13% per annum on your idle account balance. Grow your funds even when you are not actively placing trades.",
    color: "teal",
    type: "Savings",
  },
  {
    id: "rewards",
    title: "Vantage Rewards Program",
    subtitle: "Points for every trade",
    highlight: "Earn Points",
    description: "Earn reward points for every trade and platform interaction. Redeem points for cash credits, trading vouchers, and exclusive gifts.",
    color: "accent",
    type: "Loyalty",
  },
];

const colorMap = {
  accent: { header: "from-accent to-accent-light", badge: "variant-accent", text: "text-accent" },
  teal: { header: "from-teal to-teal-light", badge: "teal", text: "text-teal" },
  gold: { header: "from-gold to-gold-light", badge: "gold", text: "text-gold" },
};

export default function PromotionsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <p className="text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-2">/</span>Promotions
          </p>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4 leading-tight">
            Exclusive <span className="text-accent-light">Promotions</span><br />Just For You
          </h1>
          <p className="text-lg text-white/55 max-w-xl">
            Boost your trading capital with bonuses, cashback rewards, and loyalty programmes — designed to give you an edge from day one.
          </p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="relative bg-primary rounded-xl overflow-hidden p-12 mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0d2a50] to-[#0B3D3A]" />
            <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-teal/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Featured Promotion</span>
                </div>
                <h2 className="font-display font-extrabold text-4xl text-white mb-4 leading-tight">
                  Deposit Bonus — Up to $10,000 Extra Capital
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Make your first deposit and receive a bonus of up to 50% on your initial deposit. Trade with more capital and take broader positions from the very start.
                </p>
                <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                  Claim Bonus Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="text-center">
                <div className="font-display font-extrabold text-8xl text-gold leading-none">50%</div>
                <div className="text-xl text-white/70 mt-2">Deposit Bonus</div>
                <div className="text-sm text-white/35 mt-1">Up to $10,000 extra trading capital</div>
              </div>
            </div>
          </div>

          {/* ALL PROMOS */}
          <SectionHeader tag="All Promotions" title={<>Current <span className="text-accent">Offers</span></>} />
          <div className="grid lg:grid-cols-3 gap-6">
            {allPromos.map((promo) => {
              const c = colorMap[promo.color] || colorMap.accent;
              return (
                <div
                  key={promo.id}
                  className="border border-surface-border rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-accent/30 transition-all duration-200"
                >
                  <div className={`h-36 bg-gradient-to-br ${c.header} flex items-center justify-center relative`}>
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {promo.type}
                      </span>
                    </div>
                    <div className="font-display font-extrabold text-3xl text-white">{promo.highlight}</div>
                  </div>
                  <div className="p-6">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>{promo.subtitle}</div>
                    <h3 className="font-display font-extrabold text-lg text-primary mb-3">{promo.title}</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed mb-5">{promo.description}</p>
                    <Link
                      to="/register"
                      className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
                    >
                      Claim Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* T&C */}
          <div className="mt-10 bg-surface border border-surface-border rounded-[12px] px-5 py-4 text-xs text-[#8897A9] leading-relaxed">
            <span className="font-bold text-[#4A5568]">Terms and Conditions Apply: </span>
            All promotions are subject to Vantage Markets terms and conditions. Bonuses may carry trading volume requirements before withdrawal is permitted. Promotions cannot be combined unless explicitly stated. Vantage Markets reserves the right to modify or withdraw any promotion at any time without prior notice. Please read the full terms on each promotion page before participating.
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
