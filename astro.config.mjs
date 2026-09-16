// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// BASE_PATH lets the same build serve from a project subpath (/site/) during
// preview and from the domain root once this replaces the main page.
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site: "https://razinaleksandr.github.io",
  base,
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],
  build: { inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
});
