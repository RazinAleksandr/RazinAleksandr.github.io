/**
 * Selected work, in the order it should be read.
 *
 * Most entries are repositories: give `repo` and the card links to GitHub and
 * carries a live star count. `stars` is a fallback snapshot — the real number
 * is fetched from the GitHub API at build time (see src/lib/stars.ts) and
 * falls back to this when the API is unreachable or rate-limited, so a build
 * never fails on it and a stale number never silently looks live.
 *
 * An entry that is not a repository gives `href` and `meta` instead, and may
 * carry a `standing` — where the work placed.
 */

export type Project = {
  name: string;
  blurb: string;
  /** a GitHub repository: the card links there and shows its star count */
  repo?: string;
  owner?: string;
  lang?: string;
  stars?: number;
  /** anything that is not a repository — the card links here */
  href?: string;
  /** the footer line, when there is no owner/repo to print */
  meta?: string;
  /** where it placed, e.g. a Kaggle medal */
  standing?: string;
  /** the first card spans the grid */
  wide?: boolean;
};

export const projects: Project[] = [
  {
    name: "OTTO — Multi-Objective Recommender System",
    blurb:
      "Kaggle competition on session-based recommendation over a billion e-commerce events: predicting the next clicks, carts and orders for each session.",
    standing: "Bronze · top 10% of 2,574 teams",
    href: "https://www.kaggle.com/alexandrrazin/competitions",
    meta: "kaggle.com · 2023",
    wide: true,
  },
  {
    name: "LUA",
    repo: "LUA",
    owner: "vaskers5",
    blurb: "Latent Upscaling Adapter — the ECCV 2026 paper's reference implementation.",
    lang: "Python",
    stars: 62,
  },
  {
    name: "vastkit",
    repo: "vastkit",
    blurb: "Agent skill for renting and running jobs on Vast.ai GPUs.",
    lang: "Python",
    stars: 3,
  },
];
