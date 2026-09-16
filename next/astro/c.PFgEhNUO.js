import { c as createAstro, a as createComponent, b as renderTemplate, h as renderScript, d as addAttribute, i as renderSlot, j as renderHead } from './c.kGRaS9uN.js';
import 'piccolore';
import 'clsx';
/* empty css           */

const profile = {
  name: "Aleksandr Razin",
  first: "Aleksandr",
  last: "Razin",
  role: "Research Scientist",
  org: "INSAIT",
  location: "Sofia, Bulgaria",
  email: "razin.x.aleks@gmail.com",
  /** The one-sentence answer to "who is this". */
  tagline: "Generative vision, image restoration and multimodal agents.",
  /**
   * Intro paragraphs. `chip` marks a span that renders as a highlighted
   * entity — organisations, people, venues.
   */
  intro: [
    [
      "I'm a ",
      { chip: "Research Scientist", tone: "accent" },
      " at ",
      { chip: "INSAIT", tone: "green" },
      " in Sofia, working on generative vision and ",
      "image restoration with ",
      { chip: "Dr. Jinjin Gu", tone: "cyan", href: "https://insait.ai/dr-jinjin-gu/" },
      " through the ",
      { chip: "ELLIS", tone: "blue" },
      " programme."
    ],
    [
      "Before that I spent five years shipping this work rather than only writing it: ",
      "video restoration and diffusion at ",
      { chip: "Huawei", tone: "red" },
      " — including the night-HDR network that went out on the ",
      { chip: "Mate 70", tone: "magenta" },
      " — a computer-vision startup I founded and sold, and the agentic AI copilot at ",
      { chip: "TradingView", tone: "cyan" },
      " that serves 2M+ people a month."
    ],
    [
      "My first-author paper on latent upscaling for diffusion models was accepted at ",
      { chip: "ECCV 2026", tone: "red" },
      " and reached ",
      { chip: "#1 on Hugging Face Daily Papers", tone: "oryel", href: "https://huggingface.co/papers/2511.10629" },
      "."
    ]
  ],
  links: {
    github: "https://github.com/RazinAleksandr",
    linkedin: "https://www.linkedin.com/in/a-razin/",
    scholar: "https://scholar.google.com/citations?user=-AsUnsgAAAAJ",
    telegram: "https://t.me/Razin_Aleks",
    card: "https://razinaleksandr.github.io/visitcard/"
  },
  /**
   * The numbers worth leading with. Deliberately NOT citation count:
   * these are where the record is actually strong.
   */
  metrics: [
    { value: "#1", label: "Hugging Face Daily Paper", sub: "14 Nov 2025 · 133 upvotes", tone: "oryel" },
    { value: "ECCV 26", label: "first & corresponding author", sub: "Latent Upscaling Adapter", tone: "red" },
    { value: "2M+", label: "monthly users", sub: "TradingView AI copilot", tone: "cyan" },
    { value: "Mate 70", label: "shipped to production", sub: "night-HDR video restoration", tone: "green" },
    { value: "€100K", label: "raised · acquired 2025", sub: "retail video analytics", tone: "blue" },
    { value: "Patent", label: "granted", sub: "pipeline-inspection robotics", tone: "magenta" }
  ]
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://razinaleksandr.github.io");
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title = profile.name,
    description = `${profile.name} — ${profile.role} at ${profile.org}, ${profile.location}. ${profile.tagline}`,
    bare = false
  } = Astro2.props;
  const base = "/next/";
  const href = (p) => `${base}${p}`.replace(/\/{2,}/g, "/");
  const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230E1113'/%3E%3Crect x='6' y='6' width='8.5' height='8.5' rx='2' fill='%230885A1'/%3E%3Crect x='17.5' y='6' width='8.5' height='8.5' rx='2' fill='%23E0A32E'/%3E%3Crect x='6' y='17.5' width='8.5' height='8.5' rx='2' fill='%23AF363C'/%3E%3Crect x='17.5' y='17.5' width='8.5' height='8.5' rx='2' fill='%23469449'/%3E%3C/svg%3E";
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-5hce7sga> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>', '</title><meta name="description"', '><meta name="theme-color" content="#0E1113" media="(prefers-color-scheme: dark)"><meta name="theme-color" content="#DCDAD3" media="(prefers-color-scheme: light)"><link rel="icon"', '><link rel="sitemap"', '><meta property="og:type" content="profile"><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta name="twitter:card" content="summary"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"><script>\n      // Set the theme before first paint so the page never flashes the wrong one.\n      try {\n        var t = localStorage.getItem("site-theme");\n        if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);\n      } catch (e) {}\n    </script>', '</head> <body data-astro-cid-5hce7sga> <header class="nav" data-astro-cid-5hce7sga> <div class="wrap navin" data-astro-cid-5hce7sga> <a class="home"', " data-astro-cid-5hce7sga> ", ' </a> <nav class="links" data-astro-cid-5hce7sga> <a', " data-astro-cid-5hce7sga>work</a> <a", " data-astro-cid-5hce7sga>papers</a> <a", " data-astro-cid-5hce7sga>projects</a> <a", ' class="blog" data-astro-cid-5hce7sga>blog →</a> </nav> <button class="tgl" id="themeBtn" type="button" aria-pressed="false" data-astro-cid-5hce7sga>Daylight</button> </div> </header> <main data-astro-cid-5hce7sga> ', ' </main> <footer class="foot" data-astro-cid-5hce7sga> <div class="wrap" data-astro-cid-5hce7sga> <p class="tagline" data-astro-cid-5hce7sga>', '</p> <div class="linkrow" data-astro-cid-5hce7sga> <a', ' target="_blank" rel="noopener" data-astro-cid-5hce7sga>GitHub</a> <a', ' target="_blank" rel="noopener" data-astro-cid-5hce7sga>LinkedIn</a> <a', ' target="_blank" rel="noopener" data-astro-cid-5hce7sga>Scholar</a> <a', ' target="_blank" rel="noopener" data-astro-cid-5hce7sga>Telegram</a> <a', ' data-astro-cid-5hce7sga>Email</a> </div> <p class="mono colophon" data-astro-cid-5hce7sga>\nPalette calibrated to an X-Rite ColorChecker · portrait decoded from a latent\n</p> </div> </footer> ', " </body> </html> "])), title, addAttribute(description, "content"), addAttribute(favicon, "href"), addAttribute(href("sitemap-index.xml"), "href"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(href("portrait.jpg"), Astro2.site), "content"), renderHead(), addAttribute(href(""), "href"), bare ? renderTemplate`<span class="mark" data-astro-cid-5hce7sga>A. RAZIN</span>` : renderTemplate`<span class="mark" data-astro-cid-5hce7sga>A. RAZIN</span>`, addAttribute(href("#work"), "href"), addAttribute(href("#papers"), "href"), addAttribute(href("#projects"), "href"), addAttribute(href("blog"), "href"), renderSlot($$result, $$slots["default"]), profile.tagline, addAttribute(profile.links.github, "href"), addAttribute(profile.links.linkedin, "href"), addAttribute(profile.links.scholar, "href"), addAttribute(profile.links.telegram, "href"), addAttribute(`mailto:${profile.email}`, "href"), renderScript($$result, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/layouts/Base.astro?astro&type=script&index=0&lang.ts"));
}, "/home/runner/work/RazinAleksandr.github.io/RazinAleksandr.github.io/src/layouts/Base.astro", void 0);

export { $$Base as $, profile as p };
