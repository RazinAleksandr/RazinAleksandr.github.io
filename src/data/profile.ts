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
  headline: ["Visual agents that remember,", "predict and act."],

  /** A few sentences under it. Inline markdown links allowed. No metrics. */
  intro:
    "Research Scientist at [INSAIT](https://insait.ai/) with [Jinjin Gu](https://insait.ai/dr-jinjin-gu/), and an ELLIS PhD student. I work on long-horizon embodied tasks: a generative world model predicts what an action will do, a persistent 3D state of the scene keeps track of what is actually there, and a vision-language-action policy does the low-level control. Before this I worked on diffusion models and image restoration, most recently the Latent Upscaling Adapter.",

  /** Current directions, shown as a short list under the intro. */
  working: [
    "Generative world models for embodied agents",
    "Persistent 3D scene state for planning and recovery",
    "Vision-language-action policies",
    "Efficient diffusion: latent upscaling, restoration",
  ],

  tagline: "Visual agents, generative world models and image restoration.",

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
  },

  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" },
} as const;
