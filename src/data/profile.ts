/**
 * Everything about the person, in one place.
 * Facts come from the CV and independently verified sources — see README.
 * Paragraphs take inline markdown: **bold**, *italic* and [text](href).
 */

export const profile = {
  name: "Aleksandr Razin",
  role: "Research Scientist",
  org: "INSAIT",
  orgHref: "https://insait.ai/",
  location: "Sofia, Bulgaria",
  email: "razin.x.aleks@gmail.com",

  /** The one-sentence answer to "who is this". */
  tagline: "Generative vision, image restoration and multimodal agents.",

  intro: [
    "I am a Research Scientist at [INSAIT](https://insait.ai/) in Sofia, where I work on generative vision and image restoration with [Dr. Jinjin Gu](https://insait.ai/dr-jinjin-gu/) as part of the [ELLIS](https://ellis.eu/) programme. My research asks how diffusion models can produce high-resolution images without paying for every pixel twice.",
    "Before INSAIT I spent five years shipping this kind of work: video restoration and diffusion at Huawei, where I led the post-training of the night-HDR network on the Mate 70; a computer-vision startup I founded and sold; and the evaluation harness behind TradingView's agentic copilot, used by two million people a month.",
    "My first-author paper, the Latent Upscaling Adapter, was accepted at **ECCV 2026** and was the [#1 Hugging Face Daily Paper](https://huggingface.co/papers/2511.10629) on the day it appeared.",
  ],

  interests: ["Diffusion models", "Super-resolution & restoration", "Efficient generation", "Multimodal agents"],

  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
  },

  /** The PDF in public/cv/. `updated` is shown next to the download link. */
  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" },
} as const;
