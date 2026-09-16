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
    "I'm Aleksandr Razin, a Research Scientist at [INSAIT](https://insait.ai/) and an ELLIS PhD student, working with [Dr. Jinjin Gu](https://insait.ai/dr-jinjin-gu/). My research focuses on **visual agents and generative world models for embodied AI.**",
    "Prior to this, I worked on video restoration and diffusion models at Huawei, founded a computer-vision startup, and built the agentic copilot at TradingView. I earned my M.Sc. in Machine Learning at ITMO University.",
  ],

  tagline: "Visual agents and generative world models for embodied AI.",

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
  },

  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" },
} as const;
