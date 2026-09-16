/** Short, dated, newest first. `YYYY.MM`; the year alone where the month isn't sourced. */
export type NewsItem = { date: string; body: string };

export const news: NewsItem[] = [
  { date: "2026.09", body: "Joined **INSAIT** as a Research Scientist, with Jinjin Gu." },
  { date: "2026", body: "**LUA** accepted at **ECCV 2026**, Malmö." },
  { date: "2026", body: "Offered a place in the **ELLIS PhD programme**." },
  { date: "2025.11", body: "LUA preprint out: [arXiv:2511.10629](https://arxiv.org/abs/2511.10629), #1 Hugging Face Daily Paper." },
  { date: "2025.09", body: "Joined **TradingView** as a Senior ML Engineer." },
  { date: "2025", body: "The startup I founded was **acquired**." },
];
