/**
 * Where I've worked. Drives both the logo strip and the timeline.
 *
 * `mark` is a typographic wordmark rather than a company logo file: it keeps
 * the strip visually consistent and avoids shipping third-party trademarks.
 * Swap in real logos by adding `logo: "/logos/x.svg"` — the component prefers
 * it when present.
 */

export type Role = {
  org: string;
  mark: string;
  role: string;
  from: string;
  to: string;
  where?: string;
  tone: string;
  summary: string;
  /** Concrete outcomes. Keep each one to a single measurable claim. */
  points: string[];
  href?: string;
  logo?: string;
};

export const experience: Role[] = [
  {
    org: "INSAIT",
    mark: "INSAIT",
    role: "Research Scientist",
    from: "2026",
    to: "now",
    where: "Sofia, Bulgaria",
    tone: "green",
    href: "https://insait.ai/",
    summary:
      "Generative vision and image restoration with Dr. Jinjin Gu, through the ELLIS programme.",
    points: [
      "Offered a place in the ELLIS programme — top 15% of 6,000+ applicants",
    ],
  },
  {
    org: "TradingView",
    mark: "TradingView",
    role: "Senior ML Engineer",
    from: "2025",
    to: "now",
    tone: "cyan",
    href: "https://www.tradingview.com/",
    summary:
      "The harness and full offline/online evaluation behind an agentic AI copilot for real-time chart analysis — thousands of tools, hundreds of agents.",
    points: [
      "2M+ monthly users on the copilot",
      "Production multimodal search over text, charts and video at ~80% precision per modality",
      "Cut existing LLM costs ~20% per month by blending third-party APIs with local inference",
    ],
  },
  {
    org: "Own startup",
    mark: "Startup",
    role: "Founder · Lead ML Engineer",
    from: "2025",
    to: "2025",
    tone: "blue",
    summary:
      "Founded a retail computer-vision company, hired the team, and sold it inside a year.",
    points: [
      "Raised ~€100K and hired a five-engineer product team",
      "Shipped detection, segmentation and tracking to 3 of the top-5 national retailers, saving ~€20K+/month",
      "Post-trained text-to-image and image-to-image ad generation, lifting client ad CTR ~15%",
      "Acquired by a large IT company in 2025",
    ],
  },
  {
    org: "Huawei Research Institute",
    mark: "Huawei",
    role: "AI Researcher",
    from: "2023",
    to: "2025",
    tone: "red",
    summary:
      "Image and video restoration, and diffusion-based generation, for shipping camera pipelines.",
    points: [
      "Led quantized post-training for the Mate 70 night-HDR restoration network — shipped weekly to production",
      "Redesigned video-restoration architectures, improving perceptual quality and detail reconstruction",
      "Optimized diffusion training for high-frequency texture synthesis — ~10% over baselines on FID/PSNR",
    ],
  },
  {
    org: "ITMO University",
    mark: "ITMO",
    role: "Deep Learning Engineer · Industry AI Lab",
    from: "2022",
    to: "2023",
    tone: "oryel",
    summary: "End-to-end data and model pipelines for industrial vision.",
    points: [
      "Distilled banknote segmentation models — 20% fewer FLOPs at no accuracy cost",
      "Contrastive learning lifted fake-stamp detection by +10% F1",
    ],
  },
  {
    org: "Mining University",
    mark: "Mining Univ.",
    role: "Research Intern · Robotics Lab",
    from: "2021",
    to: "2021",
    tone: "magenta",
    summary:
      "On-device perception for pipeline-inspection robots at oil and gas plants.",
    points: [
      "Replaced ~€56K/year of manual inspection",
      "Patent granted",
    ],
  },
];

export const education = [
  {
    degree: "M.Sc.",
    field: "Machine Learning",
    org: "ITMO University",
    years: "2022–2024",
    note: "GPA 4.9/5. Thesis: enhancing image super-resolution through depth estimation.",
  },
  {
    degree: "B.Sc.",
    field: "Engineering",
    org: "Mining University",
    years: "2018–2022",
    note: "GPA 4.9/5. Thesis: real-time obstacle detection for robotic exploration with LiDAR.",
  },
];
