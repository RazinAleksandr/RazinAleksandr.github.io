/**
 * Reverse-chronological news, in the academic `YYYY.MM` convention.
 *
 * `date` is shown verbatim, so an entry whose month I cannot source is written
 * as the year alone rather than guessed. Keep newest first.
 */

export type NewsItem = {
  date: string;
  body: string;
  /** Marks the handful worth pulling the eye to. Use sparingly. */
  highlight?: boolean;
};

export const news: NewsItem[] = [
  {
    date: "2026.09",
    body: "Started as a Research Scientist at **INSAIT** in Sofia, working on generative vision and image restoration with Dr. Jinjin Gu through the ELLIS programme.",
    highlight: true,
  },
  {
    date: "2026",
    body: "**LUA** — *One Small Step in Latent, One Giant Leap for Pixels* — accepted at **ECCV 2026**, Malmö. First and corresponding author.",
    highlight: true,
  },
  {
    date: "2026",
    body: "Offered a place in the **ELLIS PhD programme** — top 15% of more than 6,000 applicants.",
  },
  {
    date: "2025.11",
    body: "LUA preprint released as [arXiv:2511.10629](https://arxiv.org/abs/2511.10629) and ranked **#1 Hugging Face Daily Paper** with 133 upvotes.",
    highlight: true,
  },
  {
    date: "2025.09",
    body: "Joined **TradingView** as a Senior ML Engineer, building the evaluation harness behind an agentic copilot that reads and edits live charts.",
  },
  {
    date: "2025",
    body: "The computer-vision startup I founded was **acquired** by a large IT company, after raising ~€100K and shipping retail video analytics to 3 of the top-5 national retailers.",
  },
  {
    date: "2025.04",
    body: "Founded a computer-vision startup and hired a five-engineer product team.",
  },
  {
    date: "2023.12",
    body: "Joined **Huawei Research Institute** as an AI Researcher, working on image and video restoration and diffusion-based generation.",
  },
];
