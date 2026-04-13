export const spreadsData = [
  { pair: "EUR/USD", category: "Forex", ours: "0.0", market: "0.8", type: "major" },
  { pair: "XAU/USD", category: "Gold", ours: "0.75", market: "0.89", type: "commodity" },
  { pair: "GBP/USD", category: "Forex", ours: "0.5", market: "1.2", type: "major" },
  { pair: "GBP/CHF", category: "Forex", ours: "0.90", market: "1.30", type: "minor" },
  { pair: "GBP/NZD", category: "Forex", ours: "2.65", market: "3.31", type: "minor" },
  { pair: "HK50", category: "Indices", ours: "0.41", market: "1.99", type: "index" },
  { pair: "US500", category: "Indices", ours: "0.4", market: "1.2", type: "index" },
  { pair: "UKOUSD", category: "Energy", ours: "2.30", market: "3.34", type: "energy" },
];

export const instruments = [
  {
    id: "forex",
    label: "Forex",
    title: "Forex Trading",
    description:
      "Trade the world's most popular forex and currency pairs with a trusted broker. Access 40+ major, minor, and exotic forex pairs with spreads from 0.0 pips.",
    details:
      "Whether you are based in South Africa, Kenya, Nigeria, Botswana or anywhere across Africa, you can trade the leading currencies including EUR/USD, GBP/USD, USD/JPY, and more.",
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "USD/CHF", "GBP/JPY", "NZD/USD"],
    spread: "From 0.0 pips",
    leverage: "Up to 500:1",
    instruments: "40+",
  },
  {
    id: "indices",
    label: "Indices",
    title: "Stock Indices",
    description:
      "Gain broad market exposure by trading global stock market indices. Track entire economies through a single instrument.",
    details:
      "Trade the US500, UK100, GER40, JP225, HK50, AUS200 and more. Indices offer excellent diversification without the need to pick individual stocks.",
    pairs: ["US500", "UK100", "GER40", "JP225", "HK50", "AUS200", "NAS100", "FTSE100"],
    spread: "From 0.4 pts",
    leverage: "Up to 200:1",
    instruments: "20+",
  },
  {
    id: "gold",
    label: "Gold & Silver",
    title: "Precious Metals",
    description:
      "Trade gold and silver as CFDs without physical delivery. Gold (XAU/USD) and Silver (XAG/USD) are among the most traded instruments globally.",
    details:
      "Precious metals provide a safe-haven hedge during market uncertainty. Trade them with tight spreads and deep liquidity available around the clock.",
    pairs: ["XAU/USD", "XAG/USD", "XPT/USD", "XPD/USD"],
    spread: "From 0.75 pips",
    leverage: "Up to 200:1",
    instruments: "4+",
  },
  {
    id: "energy",
    label: "Energy",
    title: "Energy CFDs",
    description:
      "Trade oil and energy CFDs including Brent Crude, WTI, and Natural Gas with competitive spreads and deep liquidity.",
    details:
      "Energy markets are highly liquid and driven by supply-demand fundamentals. Trade them long or short with full flexibility.",
    pairs: ["UKOUSD (Brent)", "USOUSD (WTI)", "Natural Gas", "Heating Oil"],
    spread: "From 2.30 pips",
    leverage: "Up to 100:1",
    instruments: "6+",
  },
  {
    id: "etfs",
    label: "ETFs",
    title: "ETF CFDs",
    description:
      "Trade Exchange-Traded Fund CFDs for broad diversified market exposure across sectors, commodities, and geographies.",
    details:
      "ETFs allow you to track the performance of entire sectors or indices through a single trade, with no need to manage a portfolio of individual stocks.",
    pairs: ["SPY", "QQQ", "GLD", "VTI", "ARKK", "XLF"],
    spread: "From 0.15 pts",
    leverage: "Up to 100:1",
    instruments: "50+",
  },
  {
    id: "shares",
    label: "Shares",
    title: "Share CFDs",
    description:
      "Trade CFDs on global company stocks including Apple, Tesla, Amazon, NVIDIA, and 300+ other companies without owning the underlying asset.",
    details:
      "Go long or short on the world's most liquid equities. No stamp duty, no need to open a broker account — just trade the price movement.",
    pairs: ["AAPL", "TSLA", "AMZN", "GOOGL", "NVDA", "META", "MSFT", "NFLX"],
    spread: "From 0.08 pts",
    leverage: "Up to 20:1",
    instruments: "300+",
  },
];

export const accountTypes = [
  {
    name: "Standard",
    minDeposit: "$50",
    spread: "From 1.0 pips",
    commission: "$0",
    leverage: "Up to 500:1",
    platforms: "MT4, MT5, App",
    featured: false,
  },
  {
    name: "Raw ECN",
    minDeposit: "$50",
    spread: "From 0.0 pips",
    commission: "$3 / lot",
    leverage: "Up to 500:1",
    platforms: "MT4, MT5, App",
    featured: true,
  },
  {
    name: "Pro ECN",
    minDeposit: "$10,000",
    spread: "From 0.0 pips",
    commission: "$1.50 / lot",
    leverage: "Up to 500:1",
    platforms: "MT4, MT5, App",
    featured: false,
  },
];

export const platforms = [
  {
    id: "mt5",
    name: "MetaTrader 5",
    tag: "Desktop / Web / Mobile",
    badge: "Recommended",
    description:
      "The industry's most advanced multi-asset platform. Superior charting, EA support, hedging and netting — the professional's choice.",
    features: [
      "21 timeframes",
      "Expert Advisors (EAs)",
      "Algorithmic & automated trading",
      "Economic calendar built-in",
      "Multi-currency strategy tester",
      "Copy trading via signals",
    ],
  },
  {
    id: "mt4",
    name: "MetaTrader 4",
    tag: "Desktop / Web / Mobile",
    badge: null,
    description:
      "The world's most trusted forex trading platform. Fast, reliable, and packed with tools that traders have relied on for two decades.",
    features: [
      "9 timeframes",
      "Expert Advisors (EAs)",
      "Custom indicators & scripts",
      "One-click trading",
      "Strategy Tester",
      "30+ built-in indicators",
    ],
  },
  {
    id: "tv",
    name: "TradingView",
    tag: "Web / Desktop",
    badge: "New",
    description:
      "Trade directly from TradingView's world-class charting platform. Access all your instruments with the charts you already use and love.",
    features: [
      "Best-in-class charting",
      "Pine Script strategy automation",
      "Social trading community",
      "100+ technical indicators",
      "Real-time data",
      "Cross-platform sync",
    ],
  },
  {
    id: "app",
    name: "vāntãgeCFD App",
    tag: "iOS / Android",
    badge: null,
    description:
      "Our proprietary mobile app built for modern traders. Execute trades, analyse markets, and manage your account from anywhere.",
    features: [
      "One-tap trade execution",
      "Advanced mobile charting",
      "Real-time push notifications",
      "Copy trading built-in",
      "Biometric login",
      "Account management",
    ],
  },
];

export const regulations = [
  { region: "Australia", authority: "ASIC", number: "AFS Licence No. 428901", flag: "AU" },
  { region: "United Kingdom", authority: "FCA", number: "Reg. No. 590299", flag: "GB" },
  { region: "Cayman Islands", authority: "CIMA", number: "Licence No. 1383491", flag: "KY" },
  { region: "Vanuatu", authority: "VFSC", number: "Reg. No. 40538", flag: "VU" },
];

export const promotions = [
  {
    id: "deposit-bonus",
    title: "Deposit Bonus",
    subtitle: "Up to 50% on first deposit",
    highlight: "50% Bonus",
    description:
      "Make your first deposit and receive up to 50% bonus on your initial capital. Trade with more and explore wider markets from day one.",
    color: "accent",
    type: "New Account",
  },
  {
    id: "cashback-prime",
    title: "Cashback Prime",
    subtitle: "Up to $5 per lot traded",
    highlight: "$5 / Lot",
    description:
      "Earn cashback on every lot you trade. The more active you are, the more you earn back — credited automatically to your account monthly.",
    color: "teal",
    type: "Active Traders",
  },
  {
    id: "bumper-bonus",
    title: "Bumper Bonus",
    subtitle: "Triple rewards, limited time",
    highlight: "3x Rewards",
    description:
      "Our biggest promotion of the year. Triple cashback rates, enhanced rebates, and exclusive gifts for qualifying traders.",
    color: "gold",
    type: "Limited Time",
  },
  {
    id: "refer-friend",
    title: "Refer a Friend",
    subtitle: "$100 per qualified referral",
    highlight: "$100 / Referral",
    description:
      "Refer a friend who funds and trades an account, and you both earn. No limit on the number of referrals you can make.",
    color: "accent",
    type: "Refer & Earn",
  },
];

export const tickerData = [
  { pair: "EUR/USD", price: "1.08521", change: "+0.42%", up: true },
  { pair: "GBP/USD", price: "1.27834", change: "-0.18%", up: false },
  { pair: "XAU/USD", price: "2341.50", change: "+1.02%", up: true },
  { pair: "USD/JPY", price: "149.230", change: "+0.26%", up: true },
  { pair: "US500", price: "5248.40", change: "+0.58%", up: true },
  { pair: "BTC/USD", price: "68450.00", change: "-1.34%", up: false },
  { pair: "GBP/JPY", price: "190.540", change: "+0.09%", up: true },
  { pair: "UKOUSD", price: "83.42", change: "-0.45%", up: false },
  { pair: "AUD/USD", price: "0.65210", change: "+0.31%", up: true },
  { pair: "NAS100", price: "18320.00", change: "+0.74%", up: true },
];

export const earningsChartData = [
  { month: "Apr", value: 18200 },
  { month: "May", value: 19800 },
  { month: "Jun", value: 17400 },
  { month: "Jul", value: 22100 },
  { month: "Aug", value: 21000 },
  { month: "Sep", value: 25324 },
];

export const adminStats = {
  totalUsers: 5248,
  activeTraders: 1832,
  totalDeposits: "$4,821,300",
  pendingWithdrawals: 14,
  monthlyVolume: "$128.4M",
  openTickets: 6,
};

export const adminUsers = [
  { id: 1, name: "James Okonkwo", email: "j.okonkwo@email.com", country: "Nigeria", account: "Raw ECN", balance: "$12,450", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Fatima Al-Rashid", email: "fatima.r@email.com", country: "UAE", account: "Standard", balance: "$3,200", status: "Active", joined: "2024-02-08" },
  { id: 3, name: "David Mensah", email: "d.mensah@email.com", country: "Ghana", account: "Pro ECN", balance: "$45,000", status: "Active", joined: "2023-11-20" },
  { id: 4, name: "Sarah Kimani", email: "s.kimani@email.com", country: "Kenya", account: "Standard", balance: "$820", status: "Pending", joined: "2024-03-01" },
  { id: 5, name: "Mikael Johansson", email: "m.johansson@email.com", country: "Sweden", account: "Raw ECN", balance: "$8,750", status: "Active", joined: "2024-01-30" },
  { id: 6, name: "Priya Nair", email: "p.nair@email.com", country: "India", account: "Standard", balance: "$1,500", status: "Suspended", joined: "2023-12-10" },
];

export const adminTransactions = [
  { id: "TXN-00421", user: "James Okonkwo", type: "Deposit", amount: "$5,000", method: "Bank Wire", status: "Completed", date: "2024-04-02" },
  { id: "TXN-00420", user: "Fatima Al-Rashid", type: "Withdrawal", amount: "$1,200", method: "Credit Card", status: "Pending", date: "2024-04-02" },
  { id: "TXN-00419", user: "David Mensah", type: "Deposit", amount: "$20,000", method: "Bank Wire", status: "Completed", date: "2024-04-01" },
  { id: "TXN-00418", user: "Sarah Kimani", type: "Deposit", amount: "$500", method: "Mobile Money", status: "Processing", date: "2024-04-01" },
  { id: "TXN-00417", user: "Mikael Johansson", type: "Withdrawal", amount: "$3,000", method: "Bank Wire", status: "Completed", date: "2024-03-31" },
];
