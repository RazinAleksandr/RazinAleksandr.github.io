import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, u as unescapeHTML, b as renderTemplate, i as renderHead, j as renderSlot, r as renderComponent } from './c.CCTiTH7s.js';
import 'piccolore';
/* empty css           */
import 'clsx';

const profile = {
  name: "Aleksandr Razin",
  first: "Aleksandr",
  last: "Razin",
  role: "Research Scientist",
  org: "INSAIT",
  orgHref: "https://insait.ai/",
  location: "Sofia",
  email: "razin.x.aleks@gmail.com",
  /** The big line. */
  headline: ["Generative vision", "& image restoration."],
  /** Two sentences under it. Inline markdown links allowed. */
  intro: "Research Scientist at [INSAIT](https://insait.ai/) with [Jinjin Gu](https://insait.ai/dr-jinjin-gu/), through the ELLIS programme. Before that: night-HDR on Huawei's Mate 70, a computer-vision startup founded and sold, and TradingView's agentic copilot for 2M people a month.",
  tagline: "Generative vision, image restoration and multimodal agents.",
  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks"
  },
  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" }
};

const $$Astro$1 = createAstro("https://razinaleksandr.github.io");
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Icon;
  const { name, size = 14, class: cls } = Astro2.props;
  const stroke = {
    mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`,
    file: `<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>`,
    download: `<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>`,
    star: `<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>`,
    arrow: `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
    arrowl: `<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>`
  };
  const fill = {
    github: `M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12`,
    scholar: `M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z`,
    linkedin: `M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z`,
    telegram: `M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z`,
    huawei: `M3.67 6.14S1.82 7.91 1.72 9.78v.35c.08 1.51 1.22 2.4 1.22 2.4 1.83 1.79 6.26 4.04 7.3 4.55 0 0 .06.03.1-.01l.02-.04v-.04C7.52 10.8 3.67 6.14 3.67 6.14zM9.65 18.6c-.02-.08-.1-.08-.1-.08l-7.38.26c.8 1.43 2.15 2.53 3.56 2.2.96-.25 3.16-1.78 3.88-2.3.06-.05.04-.09.04-.09zm.08-.78C6.49 15.63.21 12.28.21 12.28c-.15.46-.2.9-.21 1.3v.07c0 1.07.4 1.82.4 1.82.8 1.69 2.34 2.2 2.34 2.2.7.3 1.4.31 1.4.31.12.02 4.4 0 5.54 0 .05 0 .08-.05.08-.05v-.06c0-.03-.03-.05-.03-.05zM9.06 3.19a3.42 3.42 0 00-2.57 3.15v.41c.03.6.16 1.05.16 1.05.66 2.9 3.86 7.65 4.55 8.65.05.05.1.03.1.03a.1.1 0 00.06-.1c1.06-10.6-1.11-13.42-1.11-13.42-.32.02-1.19.23-1.19.23zm8.299 2.27s-.49-1.8-2.44-2.28c0 0-.57-.14-1.17-.22 0 0-2.18 2.81-1.12 13.43.01.07.06.08.06.08.07.03.1-.03.1-.03.72-1.03 3.9-5.76 4.55-8.64 0 0 .36-1.4.02-2.34zm-2.92 13.07s-.07 0-.09.05c0 0-.01.07.03.1.7.51 2.85 2 3.88 2.3 0 0 .16.05.43.06h.14c.69-.02 1.9-.37 3-2.26l-7.4-.25zm7.83-8.41c.14-2.06-1.94-3.97-1.94-3.98 0 0-3.85 4.66-6.67 10.8 0 0-.03.08.02.13l.04.01h.06c1.06-.53 5.46-2.77 7.28-4.54 0 0 1.15-.93 1.21-2.42zm1.52 2.14s-6.28 3.37-9.52 5.55c0 0-.05.04-.03.11 0 0 .03.06.07.06 1.16 0 5.56 0 5.67-.02 0 0 .57-.02 1.27-.29 0 0 1.56-.5 2.37-2.27 0 0 .73-1.45.17-3.14z`,
    tradingview: `M15.8654 8.2789c0 1.3541-1.0978 2.4519-2.452 2.4519-1.354 0-2.4519-1.0978-2.4519-2.452 0-1.354 1.0978-2.4518 2.452-2.4518 1.3541 0 2.4519 1.0977 2.4519 2.4519zM9.75 6H0v4.9038h4.8462v7.2692H9.75Zm8.5962 0H24l-5.1058 12.173h-5.6538z`
  };
  return renderTemplate`${stroke[name] ? renderTemplate`${maybeRenderHead()}<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${unescapeHTML(stroke[name])}</svg>` : renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path${addAttribute(fill[name], "d")}></path></svg>`}`;
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/components/Icon.astro", void 0);

const $$Astro = createAstro("https://razinaleksandr.github.io");
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title = profile.name,
    description = `${profile.name} — ${profile.role} at ${profile.org}. ${profile.tagline}`,
    current = "home"
  } = Astro2.props;
  const base = "/next/";
  const href = (p) => `${base}${p}`.replace(/\/{2,}/g, "/");
  const home = current === "home";
  const nav = [
    ["papers", "Papers", home ? "#papers" : href("#papers")],
    ["projects", "Projects", home ? "#projects" : href("#projects")],
    ["news", "News", home ? "#news" : href("#news")],
    ["cv", "CV", href("cv")],
    ["blog", "Blog", href("blog")]
  ];
  const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f3f0e8'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%231f3bd6'/%3E%3C/svg%3E";
  return renderTemplate`<html lang="en" data-astro-cid-5hce7sga> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#f3f0e8"><link rel="icon"${addAttribute(favicon, "href")}><link rel="sitemap"${addAttribute(href("sitemap-index.xml"), "href")}><meta property="og:type" content="profile"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(new URL(href("portrait.jpg"), Astro2.site), "content")}><meta name="twitter:card" content="summary"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">${renderHead()}</head> <body data-astro-cid-5hce7sga> <header class="top" data-astro-cid-5hce7sga> <div class="wrap bar" data-astro-cid-5hce7sga> <a class="label home"${addAttribute(href(""), "href")} data-astro-cid-5hce7sga>${profile.name}</a> <nav class="label" aria-label="Site" data-astro-cid-5hce7sga> ${nav.map(([id, text, url]) => renderTemplate`<a${addAttribute(url, "href")}${addAttribute(current === id ? "page" : void 0, "aria-current")} data-astro-cid-5hce7sga>${text}</a>`)} </nav> </div> </header> <main class="wrap" data-astro-cid-5hce7sga> ${renderSlot($$result, $$slots["default"])} </main> <footer class="wrap foot" data-astro-cid-5hce7sga> <div class="row" data-astro-cid-5hce7sga> <a class="mail"${addAttribute(`mailto:${profile.email}`, "href")} data-astro-cid-5hce7sga>${profile.email}</a> <div class="social" data-astro-cid-5hce7sga> <a${addAttribute(profile.links.scholar, "href")} target="_blank" rel="noopener" aria-label="Google Scholar" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "scholar", "size": 15, "data-astro-cid-5hce7sga": true })}</a> <a${addAttribute(profile.links.github, "href")} target="_blank" rel="noopener" aria-label="GitHub" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "github", "size": 15, "data-astro-cid-5hce7sga": true })}</a> <a${addAttribute(profile.links.linkedin, "href")} target="_blank" rel="noopener" aria-label="LinkedIn" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "linkedin", "size": 14, "data-astro-cid-5hce7sga": true })}</a> <a${addAttribute(profile.links.telegram, "href")} target="_blank" rel="noopener" aria-label="Telegram" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "telegram", "size": 15, "data-astro-cid-5hce7sga": true })}</a> </div> </div> <p class="label" data-astro-cid-5hce7sga>© ${(/* @__PURE__ */ new Date()).getFullYear()} ${profile.name} · ${profile.location}</p> </footer> </body></html>`;
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/layouts/Base.astro", void 0);

export { $$Base as $, $$Icon as a, profile as p };
