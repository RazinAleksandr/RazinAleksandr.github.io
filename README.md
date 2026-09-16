# razinaleksandr.github.io

Personal site — Astro, static, deployed to GitHub Pages by Actions.

It shares its design language with the [LUA project page](https://razinaleksandr.github.io/latent-upscaling-adapter/):
paper and ink, one accent, a text serif for headings and the system sans for
reading. The portrait in the sidebar decodes once on load the way the paper's
pipeline figure is drawn — a coarse channel-mean latent in the figure's
diverging colormap, the ×4 latent, then the photograph — and then simply sits
there. Click it to replay; with reduced motion it is just the photograph.

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
| `/` | About, news, experience, publications, projects |
| `/cv` | The CV as a PDF, embedded, with a download button |
| `/blog` | Posts from `src/content/blog/` |

## Where the content lives

All of it is data, not markup — edit these and the page follows:

| File | What it drives |
| --- | --- |
| `src/data/profile.ts` | name, role, intro paragraphs, interests, links, CV file |
| `src/data/news.ts` | the dated `YYYY.MM` news list |
| `src/data/experience.ts` | the timeline strip, the role list, education |
| `src/data/publications.ts` | papers, thumbnails, links, BibTeX |
| `src/data/projects.ts` | repositories (star counts are fetched live — see below) |

**Intro and news** take inline markdown — `**bold**`, `*italic*`, `` `code` ``,
`[text](href)` — and nothing else; the text is escaped first, so data files
can't inject markup.

**Experience** is written oldest first. The strip renders it in that order,
left to right, so the timeline reads the way time does; the list under it is
reversed to newest first. Each organisation shows an icon: the SVG named in
`logo` (from `public/logos/`), or, without one, the `mark` monogram in the
same tile, so the row stays uniform whether or not a usable logo exists.

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

Company marks for Huawei and TradingView are from
[simple-icons](https://github.com/simple-icons/simple-icons) (CC0); the others
are monograms.
