/**
 * Where I've worked, oldest first — the timeline reads left to right the way
 * time does. The list under it is rendered newest first.
 *
 * `logo` points at an SVG in public/logos/; without one the tile shows `mark`
 * as a serif monogram, so every organisation gets an icon of the same size.
 */

export type Role = {
  org: string;
  /** Short name for the timeline strip. */
  short: string;
  mark: string;
  logo?: string;
  role: string;
  from: string;
  to: string;
  href?: string;
  /** One line. The CV has the bullets. */
  summary: string;
};

export const experience: Role[] = [
  {
    org: "Mining University",
    short: "Mining Univ.",
    mark: "MU",
    role: "Research Intern, Robotics Lab",
    from: "2021",
    to: "2021",
    summary: "On-device perception for pipeline-inspection robots at oil and gas plants; patent granted.",
  },
  {
    org: "ITMO University",
    short: "ITMO",
    mark: "IT",
    href: "https://en.itmo.ru/",
    role: "Deep Learning Engineer, Industry AI Lab",
    from: "2022",
    to: "2023",
    summary: "End-to-end data and model pipelines for industrial vision: distillation, contrastive learning.",
  },
  {
    org: "Huawei Research Institute",
    short: "Huawei",
    mark: "H",
    logo: "logos/huawei.svg",
    href: "https://www.huawei.com/",
    role: "AI Researcher",
    from: "2023",
    to: "2025",
    summary: "Video restoration and diffusion for camera pipelines; led post-training of the Mate 70 night-HDR network.",
  },
  {
    org: "Own startup",
    short: "Startup",
    mark: "S",
    role: "Founder, Lead ML Engineer",
    from: "2025",
    to: "2025",
    summary: "Retail computer vision for 3 of the top-5 national retailers; raised ~€100K, acquired within the year.",
  },
  {
    org: "TradingView",
    short: "TradingView",
    mark: "TV",
    logo: "logos/tradingview.svg",
    href: "https://www.tradingview.com/",
    role: "Senior ML Engineer",
    from: "2025",
    to: "now",
    summary: "Evaluation harness and multimodal search for an agentic chart-analysis copilot with 2M+ monthly users.",
  },
  {
    org: "INSAIT",
    short: "INSAIT",
    mark: "IN",
    href: "https://insait.ai/",
    role: "Research Scientist",
    from: "2026",
    to: "now",
    summary: "Generative vision and image restoration with Dr. Jinjin Gu, through the ELLIS programme.",
  },
];

export const education = [
  {
    degree: "M.Sc. Machine Learning",
    org: "ITMO University",
    mark: "IT",
    years: "2022–2024",
    note: "Thesis: enhancing image super-resolution through depth estimation.",
  },
  {
    degree: "B.Sc. Engineering",
    org: "Mining University",
    mark: "MU",
    years: "2018–2022",
    note: "Thesis: real-time obstacle detection for robotic exploration with LiDAR.",
  },
];
