/**
 * Live GitHub star counts, resolved once at build time.
 *
 * One unauthenticated request covers every repo under the account. If it fails
 * — offline, rate-limited, renamed repo — we fall back to the snapshot in
 * projects.ts rather than failing the build or printing a zero, and say so in
 * the build log so a silently stale number is visible to whoever built it.
 */

type StarMap = Record<string, number>;

let cache: StarMap | null = null;

export async function liveStars(user = "RazinAleksandr"): Promise<StarMap> {
  if (cache) return cache;

  const out: StarMap = {};
  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "razin-site-build",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const repos = (await res.json()) as { name: string; stargazers_count: number }[];
    for (const r of repos) out[r.name] = r.stargazers_count;
    console.log(`[stars] fetched ${repos.length} repos from GitHub`);
  } catch (err) {
    console.warn(
      `[stars] falling back to the snapshot in projects.ts — ${(err as Error).message}`
    );
  }

  cache = out;
  return out;
}
