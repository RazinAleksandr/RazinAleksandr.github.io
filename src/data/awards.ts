/** Awards, newest first. `year` alone — these are points, not spans. */
export type Award = { year: string; title: string; detail: string; href?: string };

export const awards: Award[] = [
  {
    year: "2026",
    title: "ELLIS PhD programme",
    detail: "Selected, top 15% of 6,000+ applicants.",
    href: "https://ellis.eu/student/2026-aleksandr-razin",
  },
  {
    year: "2023",
    title: "Kaggle — OTTO Multi-Objective Recommender System",
    detail: "Bronze medal, top 10% of 2,574 teams.",
    href: "https://www.kaggle.com/alexandrrazin/competitions",
  },
  {
    year: "2023",
    title: "Huawei internship",
    detail: "Offered a full-time position as a CV Engineer on finishing it.",
  },
  {
    year: "2023",
    title: "Russian Student Startup grant",
    detail: "Top 5% of ~10,000 teams, ~€15k in funding.",
  },
  {
    year: "2018",
    title: "Russian Olympiad in Physics & Mathematics, “Star”",
    detail: "Prize holder on the spacecraft track, top 2% of ~8,000 entrants.",
  },
  {
    year: "2018",
    title: "School gold medal",
    detail: "For academic performance across high school.",
  },
];
