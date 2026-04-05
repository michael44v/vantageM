import { tickerData } from "../../data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Ticker() {
  const doubled = [...tickerData, ...tickerData];

  return (
    <div className="bg-primary/95 border-b border-white/10 overflow-hidden py-2.5">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: "ticker 40s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2.5 px-6 border-r border-white/10"
          >
            <span className="text-xs font-bold text-white tracking-wide">{item.pair}</span>
            <span className="text-xs font-semibold text-white/80">{item.price}</span>
            <span
              className={`text-xs font-semibold flex items-center gap-0.5 ${
                item.up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {item.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
