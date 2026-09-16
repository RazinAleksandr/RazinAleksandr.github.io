/**
 * Everything about the person, in one place.
 * Facts come from CV.pdf and independently verified sources — see README.
 */

export const profile = {
  name: "Aleksandr Razin",
  first: "Aleksandr",
  last: "Razin",
  role: "Research Scientist",
  org: "INSAIT",
  location: "Sofia, Bulgaria",
  timezone: "Europe/Sofia",
  email: "razin.x.aleks@gmail.com",

  /** The one-sentence answer to "who is this". */
  tagline: "Generative vision, image restoration and multimodal agents.",

  /**
   * Intro paragraphs. `chip` marks a span that renders as a highlighted
   * entity — organisations, people, venues.
   */
  intro: [
    [
      "I'm a ", { chip: "Research Scientist", tone: "accent" }, " at ",
      { chip: "INSAIT", tone: "green" }, " in Sofia, working on generative vision and ",
      "image restoration with ", { chip: "Dr. Jinjin Gu", tone: "cyan", href: "https://insait.ai/dr-jinjin-gu/" },
      " through the ", { chip: "ELLIS", tone: "blue" }, " programme.",
    ],
    [
      "Before that I spent five years shipping this work rather than only writing it: ",
      "video restoration and diffusion at ", { chip: "Huawei", tone: "red" },
      " — including the night-HDR network that went out on the ", { chip: "Mate 70", tone: "magenta" },
      " — a computer-vision startup I founded and sold, and the agentic AI copilot at ",
      { chip: "TradingView", tone: "cyan" }, " that serves 2M+ people a month.",
    ],
    [
      "My first-author paper on latent upscaling for diffusion models was accepted at ",
      { chip: "ECCV 2026", tone: "red" }, " and reached ",
      { chip: "#1 on Hugging Face Daily Papers", tone: "oryel", href: "https://huggingface.co/papers/2511.10629" }, ".",
    ],
  ],

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
    card: "https://razinaleksandr.github.io/visitcard/",
  },

  /**
   * The numbers worth leading with. Deliberately NOT citation count:
   * these are where the record is actually strong.
   */
  metrics: [
    { value: "#1", label: "Hugging Face Daily Paper", sub: "14 Nov 2025 · 133 upvotes", tone: "oryel" },
    { value: "ECCV 26", label: "first & corresponding author", sub: "Latent Upscaling Adapter", tone: "red" },
    { value: "2M+", label: "monthly users", sub: "TradingView AI copilot", tone: "cyan" },
    { value: "Mate 70", label: "shipped to production", sub: "night-HDR video restoration", tone: "green" },
    { value: "€100K", label: "raised · acquired 2025", sub: "retail video analytics", tone: "blue" },
    { value: "Patent", label: "granted", sub: "pipeline-inspection robotics", tone: "magenta" },
  ],
} as const;

export type IntroSpan = string | { chip: string; tone: string; href?: string };
