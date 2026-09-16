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
  /** Pulls it out of the grid into the wide, featured slot. */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "LUA",
    repo: "LUA",
    owner: "vaskers5",
    blurb:
      "Latent Upscaling Adapter — super-resolution on the diffusion latent before the single VAE decode. The ECCV 2026 paper's reference implementation.",
    lang: "Python",
    stars: 62,
    featured: true,
  },
  {
    name: "vastkit",
    repo: "vastkit",
    blurb:
      "An agent skill for renting and managing Vast.ai GPUs — search offers by effective session cost, rent under a cap, run jobs, pull results, stop billing.",
    lang: "Python",
    stars: 3,
  },
  {
    name: "visa-agent-skill",
    repo: "visa-agent-skill",
    blurb: "An agent skill for navigating visa application logistics.",
    lang: "Python",
    stars: 4,
  },
  {
    name: "agent-monitor",
    repo: "agent-monitor",
    blurb:
      "Real-time observability dashboard for agentic systems — watch what a fleet of agents is actually doing.",
    lang: "TypeScript",
    stars: 0,
  },
  {
    name: "latent-upscaling-adapter",
    repo: "latent-upscaling-adapter",
    blurb:
      "The LUA project page: interactive comparisons, the animated pipeline figure, and the numbers behind the paper.",
    lang: "CSS",
    stars: 2,
  },
  {
    name: "polymarket-autonomous-trader",
    repo: "polymarket-autonomous-trader",
    blurb:
      "An autonomous trading agent for Polymarket prediction markets.",
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
    blurb:
      "MSc thesis code: depth maps as a structural prior for image super-resolution, reducing blur and spatial inconsistency.",
    lang: "Jupyter",
    stars: 1,
  },
];
