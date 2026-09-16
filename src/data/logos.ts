/**
 * Where I've worked, oldest first — the strip runs left to right in time and
 * starts over when it reaches the newest. `img` is a file in public/logos/;
 * `icon` is a brand mark from Icon.astro set next to the name; with neither
 * the name is set in the display serif. Dates are `YYYY.MM`; `to` may be "now".
 */
export type Org = {
  name: string;
  from: string;
  to: string;
  role?: string;
  href?: string;
  img?: string;
  /** natural aspect ratio of `img`, for sizing by height */
  ratio?: number;
  icon?: string;
};

export const orgs: Org[] = [
  { name: "Mining University", from: "2021.01", to: "2021.12", href: "https://spmi.ru/" },
  { name: "ITMO University", from: "2022.06", to: "2023.05", href: "https://en.itmo.ru/", img: "logos/itmo.svg", ratio: 317 / 39 },
  { name: "Huawei", from: "2023.05", to: "2025.04", href: "https://www.huawei.com/", icon: "huawei" },
  { name: "Own startup", role: "founder", from: "2025.04", to: "2025.09" },
  { name: "TradingView", from: "2025.09", to: "now", href: "https://www.tradingview.com/", icon: "tradingview" },
  { name: "INSAIT", from: "2026.09", to: "now", href: "https://insait.ai/", img: "logos/insait.png", ratio: 370 / 132 },
];
