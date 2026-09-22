import { e as createAstro, c as createComponent, m as maybeRenderHead, b as addAttribute, d as renderScript, a as renderTemplate, u as unescapeHTML, f as renderSlot, r as renderComponent, g as renderHead, h as defineScriptVars, F as Fragment } from './c.tFMvk9Lp.js';
import 'piccolore';
/* empty css           */
import 'clsx';
import { readFile } from 'node:fs/promises';

const profile = {
  name: "Aleksandr Razin",
  first: "Aleksandr",
  last: "Razin",
  role: "Research Scientist",
  org: "INSAIT",
  orgHref: "https://insait.ai/",
  location: "Sofia",
  email: "razin.x.aleks@gmail.com",
  /**
   * The bio: who, where now and on what (bold), where before, degree.
   * Two short paragraphs, inline markdown, no numbers.
   */
  intro: [
    "I'm Aleksandr Razin, a Research Scientist at [INSAIT](https://insait.ai/) and an ELLIS PhD student, advised by [Dr. Jinjin Gu](https://scholar.google.com/citations?hl=en&user=uMQ-G-QAAAAJ) (INSAIT) and [Prof. Marc Pollefeys](https://scholar.google.com/citations?hl=en&user=YYH0BjEAAAAJ) (ETH Zürich). My research focuses on **visual agents and generative world models for embodied AI.**",
    "Prior to this, I worked on video restoration and diffusion models at Huawei, founded a computer-vision startup, and built the agentic copilot at TradingView. I earned my M.Sc. in Machine Learning at ITMO University."
  ],
  tagline: "Visual agents and generative world models for embodied AI.",
  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    x: "https://x.com/arazinml",
    // sorted newest first, not by citation count
    scholar: "https://scholar.google.com/citations?view_op=list_works&hl=en&user=-AsUnsgAAAAJ&sortby=pubdate",
    telegram: "https://t.me/xalexrazin"
  },
  cv: { file: "cv/Aleksandr_Razin_CV.pdf", updated: "July 2026" }
};

const $$Astro$2 = createAstro("https://razinaleksandr.github.io");
const $$Portrait = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Portrait;
  const { src, alt } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="portrait" id="portrait" data-astro-cid-qa7tv6bf> <img${addAttribute(src, "src")}${addAttribute(alt, "alt")} id="portraitImg" width="900" height="900" fetchpriority="high" data-astro-cid-qa7tv6bf> <canvas id="portraitCv" aria-hidden="true" data-astro-cid-qa7tv6bf></canvas> <span class="step mono" id="portraitT" aria-hidden="true" data-astro-cid-qa7tv6bf></span> </div>  ${renderScript($$result, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/components/Portrait.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/components/Portrait.astro", void 0);

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
    x: `M18.901 2H22l-6.77 7.743L23.2 22h-6.24l-4.89-6.392L6.48 22H3.38l7.24-8.28L3 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.9h1.72L8.47 4.02H6.62L17.8 19.9Z`,
    github: `M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12`,
    scholar: `M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z`,
    linkedin: `M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z`,
    telegram: `M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z`,
    huawei: `M3.67 6.14S1.82 7.91 1.72 9.78v.35c.08 1.51 1.22 2.4 1.22 2.4 1.83 1.79 6.26 4.04 7.3 4.55 0 0 .06.03.1-.01l.02-.04v-.04C7.52 10.8 3.67 6.14 3.67 6.14zM9.65 18.6c-.02-.08-.1-.08-.1-.08l-7.38.26c.8 1.43 2.15 2.53 3.56 2.2.96-.25 3.16-1.78 3.88-2.3.06-.05.04-.09.04-.09zm.08-.78C6.49 15.63.21 12.28.21 12.28c-.15.46-.2.9-.21 1.3v.07c0 1.07.4 1.82.4 1.82.8 1.69 2.34 2.2 2.34 2.2.7.3 1.4.31 1.4.31.12.02 4.4 0 5.54 0 .05 0 .08-.05.08-.05v-.06c0-.03-.03-.05-.03-.05zM9.06 3.19a3.42 3.42 0 00-2.57 3.15v.41c.03.6.16 1.05.16 1.05.66 2.9 3.86 7.65 4.55 8.65.05.05.1.03.1.03a.1.1 0 00.06-.1c1.06-10.6-1.11-13.42-1.11-13.42-.32.02-1.19.23-1.19.23zm8.299 2.27s-.49-1.8-2.44-2.28c0 0-.57-.14-1.17-.22 0 0-2.18 2.81-1.12 13.43.01.07.06.08.06.08.07.03.1-.03.1-.03.72-1.03 3.9-5.76 4.55-8.64 0 0 .36-1.4.02-2.34zm-2.92 13.07s-.07 0-.09.05c0 0-.01.07.03.1.7.51 2.85 2 3.88 2.3 0 0 .16.05.43.06h.14c.69-.02 1.9-.37 3-2.26l-7.4-.25zm7.83-8.41c.14-2.06-1.94-3.97-1.94-3.98 0 0-3.85 4.66-6.67 10.8 0 0-.03.08.02.13l.04.01h.06c1.06-.53 5.46-2.77 7.28-4.54 0 0 1.15-.93 1.21-2.42zm1.52 2.14s-6.28 3.37-9.52 5.55c0 0-.05.04-.03.11 0 0 .03.06.07.06 1.16 0 5.56 0 5.67-.02 0 0 .57-.02 1.27-.29 0 0 1.56-.5 2.37-2.27 0 0 .73-1.45.17-3.14z`,
    tradingview: `M15.8654 8.2789c0 1.3541-1.0978 2.4519-2.452 2.4519-1.354 0-2.4519-1.0978-2.4519-2.452 0-1.354 1.0978-2.4518 2.452-2.4518 1.3541 0 2.4519 1.0977 2.4519 2.4519zM9.75 6H0v4.9038h4.8462v7.2692H9.75Zm8.5962 0H24l-5.1058 12.173h-5.6538z`
  };
  return renderTemplate`${stroke[name] ? renderTemplate`${maybeRenderHead()}<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${unescapeHTML(stroke[name])}</svg>` : renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path${addAttribute(fill[name], "d")}></path></svg>`}`;
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/components/Icon.astro", void 0);

function isPageViews(value) {
  if (!value || typeof value !== "object") return false;
  const data = value;
  return Number.isSafeInteger(data.total) && data.total >= 0 && typeof data.updatedAt === "string" && Number.isFinite(Date.parse(data.updatedAt)) && typeof data.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.startDate);
}

const $$PageViews = createComponent(async ($$result, $$props, $$slots) => {
  let views;
  try {
    const data = JSON.parse(await readFile("public/views.json", "utf8"));
    if (isPageViews(data)) views = data;
  } catch {
  }
  const count = views?.total.toLocaleString("en-US");
  const updated = views?.updatedAt.slice(0, 10);
  return renderTemplate`${views && renderTemplate`${maybeRenderHead()}<span class="page-views"${addAttribute(`Site page views recorded by Google Analytics since ${views.startDate}; updated ${updated}`, "title")} data-astro-cid-p5os5452><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" data-astro-cid-p5os5452><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" data-astro-cid-p5os5452></path><circle cx="12" cy="12" r="3" data-astro-cid-p5os5452></circle></svg><span data-astro-cid-p5os5452>${count}<span class="sr-only" data-astro-cid-p5os5452> site page views, updated ${updated}</span></span></span>`}`;
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/components/PageViews.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro("https://razinaleksandr.github.io");
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title = profile.name,
    description = `${profile.name} — ${profile.role} at ${profile.org}. ${profile.tagline}`,
    current = "home"
  } = Astro2.props;
  const base = "/";
  const href = (p) => `${base}${p}`.replace(/\/{2,}/g, "/");
  const home = current === "home";
  const withSide = home || current === "cv";
  const portrait = href("portrait-900.jpg");
  const productionSite = Astro2.site;
  const route = Astro2.url.pathname;
  const canonical = new URL(`${route.replace(/\/$/, "")}/`, productionSite).href;
  const personId = new URL("/#person", productionSite).href;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": home ? "ProfilePage" : "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    ...home ? {
      mainEntity: {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        givenName: profile.first,
        familyName: profile.last,
        url: productionSite.href,
        image: new URL("/portrait.jpg", productionSite).href,
        jobTitle: profile.role,
        worksFor: { "@type": "Organization", name: profile.org, url: profile.orgHref },
        sameAs: Object.values(profile.links)
      }
    } : { about: { "@id": personId } }
  };
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
  const bingVerification = process.env.BING_SITE_VERIFICATION;
  const GA = "G-QX68KTT819";
  const nav = [
    ["home", "Profile", href("")],
    ["news", "News", home ? "#news" : href("#news")],
    ["awards", "Awards", home ? "#awards" : href("#awards")],
    ["papers", "Papers", home ? "#papers" : href("#papers")],
    ["projects", "Projects", home ? "#projects" : href("#projects")],
    ["cv", "CV", href("cv")]
  ];
  return renderTemplate(_b || (_b = __template(['<html lang="en" data-astro-cid-5hce7sga> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><link rel="canonical"', ">", "", '<script type="application/ld+json">', '</script><meta name="theme-color" content="#120a1c"><link rel="icon" type="image/png" sizes="32x32"', '><link rel="apple-touch-icon" sizes="180x180"', '><link rel="sitemap"', '><meta property="og:type" content="profile"><meta property="og:title"', '><meta property="og:url"', '><meta property="og:description"', '><meta property="og:image"', '><meta name="twitter:card" content="summary"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap">', "", '</head> <body data-astro-cid-5hce7sga> <header class="top" data-astro-cid-5hce7sga> <nav class="wrap topnav label" aria-label="Site" data-astro-cid-5hce7sga> ', ' <button class="theme-toggle" type="button" aria-label="Switch to dark theme" title="Switch theme" data-astro-cid-5hce7sga> <span aria-hidden="true" data-astro-cid-5hce7sga>☾</span> </button> </nav> </header> <div', " data-astro-cid-5hce7sga> ", ' <main class="main" data-astro-cid-5hce7sga> ', ' <footer class="foot label" data-astro-cid-5hce7sga>© ', " ", '</footer> </main> </div> <script>\n  const savedTheme = localStorage.getItem("theme");\n  const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";\n  document.documentElement.dataset.theme = theme;\n  const toggle = document.querySelector(".theme-toggle");\n  const updateThemeButton = () => {\n    const dark = document.documentElement.dataset.theme === "dark";\n    toggle?.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");\n    if (toggle) toggle.innerHTML = `<span aria-hidden="true">${dark ? "☀" : "☾"}</span>`;\n  };\n  updateThemeButton();\n  toggle?.addEventListener("click", () => {\n    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";\n    document.documentElement.dataset.theme = next;\n    localStorage.setItem("theme", next);\n    updateThemeButton();\n  });\n</script> </body></html>'], ['<html lang="en" data-astro-cid-5hce7sga> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><link rel="canonical"', ">", "", '<script type="application/ld+json">', '</script><meta name="theme-color" content="#120a1c"><link rel="icon" type="image/png" sizes="32x32"', '><link rel="apple-touch-icon" sizes="180x180"', '><link rel="sitemap"', '><meta property="og:type" content="profile"><meta property="og:title"', '><meta property="og:url"', '><meta property="og:description"', '><meta property="og:image"', '><meta name="twitter:card" content="summary"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap">', "", '</head> <body data-astro-cid-5hce7sga> <header class="top" data-astro-cid-5hce7sga> <nav class="wrap topnav label" aria-label="Site" data-astro-cid-5hce7sga> ', ' <button class="theme-toggle" type="button" aria-label="Switch to dark theme" title="Switch theme" data-astro-cid-5hce7sga> <span aria-hidden="true" data-astro-cid-5hce7sga>☾</span> </button> </nav> </header> <div', " data-astro-cid-5hce7sga> ", ' <main class="main" data-astro-cid-5hce7sga> ', ' <footer class="foot label" data-astro-cid-5hce7sga>© ', " ", '</footer> </main> </div> <script>\n  const savedTheme = localStorage.getItem("theme");\n  const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";\n  document.documentElement.dataset.theme = theme;\n  const toggle = document.querySelector(".theme-toggle");\n  const updateThemeButton = () => {\n    const dark = document.documentElement.dataset.theme === "dark";\n    toggle?.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");\n    if (toggle) toggle.innerHTML = \\`<span aria-hidden="true">\\${dark ? "☀" : "☾"}</span>\\`;\n  };\n  updateThemeButton();\n  toggle?.addEventListener("click", () => {\n    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";\n    document.documentElement.dataset.theme = next;\n    localStorage.setItem("theme", next);\n    updateThemeButton();\n  });\n</script> </body></html>'])), title, addAttribute(description, "content"), addAttribute(canonical, "href"), googleVerification && renderTemplate`<meta name="google-site-verification"${addAttribute(googleVerification, "content")}>`, bingVerification && renderTemplate`<meta name="msvalidate.01"${addAttribute(bingVerification, "content")}>`, unescapeHTML(JSON.stringify(structuredData).replace(/</g, "\\u003c")), addAttribute(href("icon-32.png"), "href"), addAttribute(href("icon-180.png"), "href"), addAttribute(href("sitemap-index.xml"), "href"), addAttribute(title, "content"), addAttribute(canonical, "content"), addAttribute(description, "content"), addAttribute(new URL(href("portrait.jpg"), Astro2.site), "content"), renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-5hce7sga": true }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["<script async", "></script><script>(function(){", '\n          // define:vars wraps this in a function, so gtag is published on\n          // window by hand — the usual snippet leaves it global, and anything\n          // added later will expect to find it there.\n          window.dataLayer = window.dataLayer || [];\n          window.gtag = function gtag() { window.dataLayer.push(arguments); };\n          window.gtag("js", new Date());\n          window.gtag("config", GA);\n        })();</script>'])), addAttribute(`https://www.googletagmanager.com/gtag/js?id=${GA}`, "src"), defineScriptVars({ GA })) })}`, renderHead(), nav.map(([id, text, url]) => renderTemplate`<a${addAttribute(url, "href")}${addAttribute(current === id ? "page" : void 0, "aria-current")} data-astro-cid-5hce7sga>${text}</a>`), addAttribute(["wrap", "layout", !withSide && "single"], "class:list"), withSide && renderTemplate`<aside class="side" data-astro-cid-5hce7sga> <div class="photo" data-astro-cid-5hce7sga> <a${addAttribute(href(""), "href")} aria-label="Home" data-astro-cid-5hce7sga> ${renderComponent($$result, "Portrait", $$Portrait, { "src": portrait, "alt": `Portrait of ${profile.name}`, "data-astro-cid-5hce7sga": true })} </a> ${renderComponent($$result, "PageViews", $$PageViews, { "data-astro-cid-5hce7sga": true })} </div> <h1 class="name" data-astro-cid-5hce7sga>${profile.name}</h1> <p class="role" data-astro-cid-5hce7sga>${profile.role} · <a${addAttribute(profile.orgHref, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${profile.org}</a></p> <p class="where label" data-astro-cid-5hce7sga>${profile.location}, Bulgaria</p> <ul class="contacts" data-astro-cid-5hce7sga> <li data-astro-cid-5hce7sga><a${addAttribute(`mailto:${profile.email}`, "href")} data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "mail", "size": 15, "data-astro-cid-5hce7sga": true })} ${profile.email}</a></li> <li data-astro-cid-5hce7sga><a${addAttribute(profile.links.scholar, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "scholar", "size": 15, "data-astro-cid-5hce7sga": true })} Google Scholar</a></li> <li data-astro-cid-5hce7sga><a${addAttribute(profile.links.github, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "github", "size": 15, "data-astro-cid-5hce7sga": true })} GitHub</a></li> <li data-astro-cid-5hce7sga><a${addAttribute(profile.links.linkedin, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "linkedin", "size": 14, "data-astro-cid-5hce7sga": true })} LinkedIn</a></li> <li data-astro-cid-5hce7sga><a${addAttribute(profile.links.x, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "x", "size": 15, "data-astro-cid-5hce7sga": true })} X / Twitter</a></li> <li data-astro-cid-5hce7sga><a${addAttribute(profile.links.telegram, "href")} target="_blank" rel="noopener" data-astro-cid-5hce7sga>${renderComponent($$result, "Icon", $$Icon, { "name": "telegram", "size": 15, "data-astro-cid-5hce7sga": true })} Telegram</a></li> </ul> </aside>`, renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear(), profile.name);
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/layouts/Base.astro", void 0);

export { $$Base as $, $$Icon as a, profile as p };
