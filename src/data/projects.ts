/**
 * Selected repositories.
 *
 * `stars` here is a fallback snapshot; the live count is fetched from the
 * GitHub API at build time (see src/lib/stars.ts) and falls back to this when
 * the API is unreachable or rate-limited, so a build never fails on it and a
 * stale number never silently looks live.
 */

export type Project = {
  name: string;
  repo: string;
  owner?: string;
  blurb: string;
  lang: string;
  stars: number;
  href?: string;
};

export const projects: Project[] = [
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
  {
    name: "visa-agent-skill",
    repo: "visa-agent-skill",
    blurb: "Agent skill for visa application logistics.",
    lang: "Python",
    stars: 4,
  },
  {
    name: "agent-monitor",
    repo: "agent-monitor",
    blurb: "Real-time observability dashboard for fleets of agents.",
    lang: "TypeScript",
    stars: 0,
  },
  {
    name: "latent-upscaling-adapter",
    repo: "latent-upscaling-adapter",
    blurb: "The LUA project page: comparisons and the animated pipeline.",
    lang: "CSS",
    stars: 2,
  },
  {
    name: "polymarket-autonomous-trader",
    repo: "polymarket-autonomous-trader",
    blurb: "Autonomous trading agent for Polymarket.",
    lang: "Python",
    stars: 0,
  },
  {
    name: "support-rag-agent",
    repo: "support-rag-agent",
    blurb: "Retrieval-augmented support agent on FastAPI and LangGraph.",
    lang: "Python",
    stars: 1,
  },
  {
    name: "ISR_With_Depth_Estimation",
    repo: "ISR_With_Depth_Estimation",
    blurb: "MSc thesis: depth maps as a prior for image super-resolution.",
    lang: "Jupyter",
    stars: 1,
  },
];
