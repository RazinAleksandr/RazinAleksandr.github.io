# razinaleksandr.github.io

Personal site — Astro, static, deployed to GitHub Pages by Actions.

The hero runs my portrait through the pipeline from my own paper: a noisy
channel-mean **latent**, the **×4 upscaled latent**, then one **decode** to RGB,
with the same mono captions as the figure in the LUA paper. It plays once on
load and rests on `decoded`; every stage stays reachable by clicking the rail,
and clicking the image replays it.

The palette is an X-Rite ColorChecker — the same system as the
[visit card](https://razinaleksandr.github.io/visitcard/), so the two read as
one identity.

## Running it

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the built output
```

Node 22+. No other setup.

## Where the content lives

All of it is data, not markup — edit these and the page follows:

| File | What it drives |
| --- | --- |
| `src/data/profile.ts` | name, role, intro paragraphs, the six metric tiles |
| `src/data/news.ts` | the dated `YYYY.MM` news list |
| `src/data/experience.ts` | the company strip, the role timeline, education |
| `src/data/publications.ts` | papers, badges, links, BibTeX |
| `src/data/projects.ts` | repositories (star counts are fetched live — see below) |

**Intro chips.** In `profile.ts`, the intro is an array of spans; a span written
as `{ chip: "INSAIT", tone: "green" }` renders as a highlighted entity, and
adding `href` makes it a link. Tones map to ColorChecker patches: `cyan`,
`oryel`, `red`, `green`, `blue`, `magenta`, `accent`.

**News.** `date` is printed verbatim, so an entry whose month I can't source is
written as the year alone rather than guessed. Bodies take inline markdown —
`**bold**`, `*italic*`, `` `code` ``, `[text](href)` — and nothing else; the
text is escaped before that, so data files can't inject markup.

**Company logos.** The strip uses typographic wordmarks rather than logo files,
which keeps it visually consistent and ships no third-party trademarks. To use
real logos, drop them in `public/logos/` and add `logo: "/logos/huawei.svg"` to
that role — the component prefers it when present.

**Star counts** come from the GitHub API at build time. If the API is
unreachable or rate-limited the build falls back to the `stars` snapshot in
`projects.ts` and says so in the build log, so it never fails and never
silently shows a stale zero.

## Blog

Posts are Markdown or MDX in `src/content/blog/`, typed by the schema in
`src/content.config.ts` (`title`, `description`, `date`, optional `updated`,
`draft`, `tags`).

`src/content/blog/_template.md` is a starting point. Files beginning with an
underscore are ignored by the loader, so nothing there is ever built — copy it
to a real name to publish:

```sh
cp src/content/blog/_template.md src/content/blog/latent-upscaling.md
```

`draft: true` shows a post in `npm run dev` but keeps it out of production, so
you can work on one without hiding it from yourself. Reading time is computed
from the body at 200 wpm — you don't set it. With no posts, `/blog` shows a
deliberate empty state rather than a blank page.

## Deploying

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Set **Settings → Pages → Source** to **GitHub Actions**.

The workflow works out the base path itself: a repo named `<user>.github.io`
builds for the domain root, anything else builds for `/<repo>/`. So the same
commit is correct whether this lives at `razinaleksandr.github.io` or at
`razinaleksandr.github.io/site/`, with nothing to remember. Locally you can
reproduce a subpath build with `BASE_PATH=/site/ npm run build`.

## Sources

Content comes from `CV.pdf`. These were verified independently:

| Claim | Source |
| --- | --- |
| ECCV 2026, `arXiv:2511.10629` | [arxiv.org/abs/2511.10629](https://arxiv.org/abs/2511.10629) |
| #1 Hugging Face Daily Paper, 14 Nov 2025, 133 upvotes | HF daily-papers API |
| LUA code | [github.com/vaskers5/LUA](https://github.com/vaskers5/LUA) |
| *Infrastructures* 2022, 27 citations | DOI `10.3390/infrastructures7060075` |
| Dr. Jinjin Gu at INSAIT | [insait.ai/dr-jinjin-gu](https://insait.ai/dr-jinjin-gu/) |

LinkedIn (HTTP 999) and Google Scholar (CAPTCHA) both refuse automated fetches,
so anything attributed to them comes from the CV.

**On metrics:** there is deliberately no citation chart. That block works on a
page with hundreds of citations; here it would take the weakest number on the
page and put it in the middle of the screen. The six tiles carry the numbers
that are actually strong instead.
