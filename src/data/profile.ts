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

  /**
   * The bio: who, where now and on what (bold), where before, degree.
   * Two short paragraphs, inline markdown, no numbers.
   */
  intro: [
    "I'm Aleksandr Razin, a Research Scientist at [INSAIT](https://insait.ai/) and an ELLIS PhD student, advised by [Dr. Jinjin Gu](https://scholar.google.com/citations?hl=en&user=uMQ-G-QAAAAJ) (INSAIT) and [Prof. Marc Pollefeys](https://scholar.google.com/citations?hl=en&user=YYH0BjEAAAAJ) (ETH Zürich). My research focuses on **visual agents and generative world models for embodied AI.**",
    "Prior to this, I worked on video restoration and diffusion models at Huawei, founded a computer-vision startup, and built the agentic copilot at TradingView. I earned my M.Sc. in Machine Learning at ITMO University.",
  ],

  tagline: "Visual agents and generative world models for embodied AI.",

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    // sorted newest first, not by citation count
    scholar: "https://scholar.google.com/citations?view_op=list_works&hl=en&user=-AsUnsgAAAAJ&sortby=pubdate",
    telegram: "https://t.me/xalexrazin",
  },

  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" },
} as const;
