# razinaleksandr.github.io

Personal site — Astro, static, deployed to GitHub Pages by Actions.

Bone paper, ink and one cobalt accent; a display serif for the few big words,
a plain grotesk for the rest, mono for labels. One theme. The portrait is a
loop of two states — noise, as a latent before sampling, and the photograph,
as its decode — drawn in the page's own two tones so the photograph stays the
only colour on the page. It pauses off-screen and in a hidden tab; with
reduced motion it is just the photograph.

## Running it

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the built output
```

Node 22+. No other setup.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Name, statement, where I've worked (logos), news, papers, projects |
| `/cv` | The CV as a PDF, embedded, with a download button |
| `/blog` | Posts from `src/content/blog/` |

## Where the content lives

All of it is data, not markup — edit these and the page follows:

| File | What it drives |
| --- | --- |
| `src/data/profile.ts` | name, role, headline, intro, current directions, links, CV file |
| `src/data/news.ts` | the dated `YYYY.MM` news list |
| `src/data/logos.ts` | the running "Previously" strip: organisations with `YYYY.MM` dates, oldest first |
| `src/data/publications.ts` | papers, thumbnails, links; `bibtex` is required on every entry |
| `src/data/projects.ts` | repositories (star counts are fetched live — see below) |

**Intro and news** take inline markdown — `**bold**`, `*italic*`, `` `code` ``,
`[text](href)` — and nothing else; the text is escaped first, so data files
can't inject markup.

**Logos** are written oldest first. The strip runs left to right in time and
starts over after the newest; it pauses under the pointer and becomes a plain
wrapping row with reduced motion. Each stop shows the mark, the name and
`from — to`.
Each entry uses `img` (a file in `public/logos/`), or `icon` (a brand mark
from `Icon.astro`, set next to the name), or neither, in which case the name
is set in the display serif. Marks are drawn in ink and take their own colour
back on hover. The CV carries the roles and dates; the page only says where.

**Paper thumbnails** are paths relative to `public/` (e.g. `pubs/lua.jpg`)
and get the site's base path at render time, so they work at the domain root
and under `/next/` alike. A paper without an image gets a plain panel with
its venue.

**The CV** is `public/cv/Aleksandr_Razin_CV.pdf`. Replace the file and update
`cv.updated` in `profile.ts`.

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

`draft: true` shows a post in `npm run dev` but keeps it out of production.
Reading time is computed from the body at 200 wpm. With no posts, `/blog`
shows a short note rather than a blank page.

## Deploying

`.github/workflows/deploy-astro.yml` builds on every push. From `main` it
publishes to the root of `gh-pages`; from any other branch it publishes to
`gh-pages/next`, live at `/next/`, so a redesign can be checked in place
before it replaces the main page. Locally, `BASE_PATH=/next/ npm run build`
reproduces the subpath build.

## Sources

Content comes from the CV. These were verified independently:

| Claim | Source |
| --- | --- |
| ECCV 2026, `arXiv:2511.10629` | [arxiv.org/abs/2511.10629](https://arxiv.org/abs/2511.10629) |
| #1 Hugging Face Daily Paper, 14 Nov 2025 | HF daily-papers API |
| LUA code | [github.com/vaskers5/LUA](https://github.com/vaskers5/LUA) |
| *Infrastructures* 2022 | DOI `10.3390/infrastructures7060075` |
| Dr. Jinjin Gu at INSAIT | [insait.ai/dr-jinjin-gu](https://insait.ai/dr-jinjin-gu/) |

Marks for Huawei and TradingView are from
[simple-icons](https://github.com/simple-icons/simple-icons) (CC0). The ITMO
wordmark is the university's own, recoloured to ink; the INSAIT wordmark is
the institute's own. Mining University has no logo file here yet — drop one
into `public/logos/` and point `img` at it.
