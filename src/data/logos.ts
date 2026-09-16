/**
 * Where I've worked, oldest first — the row reads left to right in time.
 * `img` is a file in public/logos/; `icon` is a brand mark from Icon.astro
 * set next to the name; with neither, the name is set in the display serif.
 */
export type Org = {
  name: string;
  years: string;
  href?: string;
  img?: string;
  /** natural aspect ratio of `img`, for sizing by height */
  ratio?: number;
  icon?: string;
};

export const orgs: Org[] = [
  { name: "Mining University", years: "2021", href: "https://spmi.ru/" },
  { name: "ITMO University", years: "2022–2023", href: "https://en.itmo.ru/", img: "logos/itmo.svg", ratio: 317 / 39 },
  { name: "Huawei", years: "2023–2025", href: "https://www.huawei.com/", icon: "huawei" },
  { name: "TradingView", years: "2025–", href: "https://www.tradingview.com/", icon: "tradingview" },
  { name: "INSAIT", years: "2026–", href: "https://insait.ai/", img: "logos/insait.png", ratio: 370 / 132 },
];
