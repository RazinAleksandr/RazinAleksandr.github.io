/**
 * Everything about the person, in one place. Kept short on purpose: the page
 * is not the CV — the CV is on /cv.
 */

export const profile = {
  name: "Aleksandr Razin",
  first: "Aleksandr",
  last: "Razin",
  role: "Research Scientist",
  org: "INSAIT",
  orgHref: "https://insait.ai/",
  location: "Sofia",
  email: "razin.x.aleks@gmail.com",

  /** The big line. */
  headline: ["Generative vision", "& image restoration."],

  /** Two sentences under it. Inline markdown links allowed. */
  intro:
    "Research Scientist at [INSAIT](https://insait.ai/) with [Jinjin Gu](https://insait.ai/dr-jinjin-gu/), through the ELLIS programme. Before that: night-HDR on Huawei's Mate 70, a computer-vision startup founded and sold, and TradingView's agentic copilot for 2M people a month.",

  tagline: "Generative vision, image restoration and multimodal agents.",

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
  },

  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" },
} as const;
