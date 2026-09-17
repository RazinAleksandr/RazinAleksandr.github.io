/**
 * Where I've worked, oldest first — the strip runs left to right in time and
 * starts over when it reaches the newest. `img` is a file in public/logos/;
 * `icon` is a brand mark from Icon.astro and `emblem` a square file in the
 * same folder, both set next to the name; with none of the three the name is
 * set in the display serif.
 *
 * Dates are stored `YYYY.MM` and printed `MM.YYYY`; `to` may be "now".
 */
export type Org = {
  name: string;
  from: string;
  to: string;
  /** the title I held there, printed under the dates */
  role?: string;
  href?: string;
  /** a wordmark, which carries the name and so replaces it */
  img?: string;
  /** a square mark — a crest or seal — which stands beside the name */
  emblem?: string;
  /** natural aspect ratio of `img`, for sizing by height */
  ratio?: number;
  icon?: string;
};

export const orgs: Org[] = [
  { name: "Mining University", role: "Software Engineer", from: "2021.01", to: "2021.12", href: "https://spmi.ru/", emblem: "logos/mining.png" },
  { name: "ITMO University", role: "Deep Learning Engineer", from: "2022.06", to: "2023.05", href: "https://en.itmo.ru/", img: "logos/itmo.svg", ratio: 317 / 39 },
  { name: "Huawei", role: "AI Researcher", from: "2023.05", to: "2025.04", href: "https://www.huawei.com/", icon: "huawei" },
  { name: "Own startup", role: "Founder", from: "2025.04", to: "2025.09" },
  { name: "TradingView", role: "Senior ML Engineer", from: "2025.09", to: "2026.09", href: "https://www.tradingview.com/", icon: "tradingview" },
  { name: "INSAIT", role: "Research Scientist", from: "2026.09", to: "now", href: "https://insait.ai/", img: "logos/insait.png", ratio: 370 / 132 },
];
