/** Short, dated, newest first. `YYYY.MM`; link whatever has somewhere to go. */
export type NewsItem = { date: string; body: string };

export const news: NewsItem[] = [
  { date: "2026.09", body: "Joined [**INSAIT**](https://insait.ai/) as a Research Scientist, in the **visual cognition and intelligence** group with [Dr. Jinjin Gu](https://insait.ai/dr-jinjin-gu/)." },
  { date: "2026.07", body: "[**LUA**](https://razinaleksandr.github.io/latent-upscaling-adapter/) accepted at [**ECCV 2026**](https://eccv.ecva.net/), Malmö." },
  { date: "2026.03", body: "Offered a place in the [**ELLIS PhD programme**](https://ellis.eu/research/phd-postdoc)." },
  { date: "2025.11", body: "[**LUA**](https://arxiv.org/abs/2511.10629) preprint became the [**#1 Hugging Face Daily Paper**](https://huggingface.co/papers/2511.10629)." },
  { date: "2025.09", body: "Joined [**TradingView**](https://www.tradingview.com/) as a Senior ML Engineer." },
  { date: "2025.09", body: "The startup I founded was **acquired**." },
];
