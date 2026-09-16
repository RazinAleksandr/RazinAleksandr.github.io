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
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Astro names chunks after their route file, so [...slug].astro
          // becomes _slug_.css — and Jekyll drops leading-underscore files just
          // like it drops leading-underscore directories. Name them ourselves.
          assetFileNames: "astro/a.[hash][extname]",
          chunkFileNames: "astro/c.[hash].js",
          entryFileNames: "astro/e.[hash].js",
        },
      },
    },
  },
  build: {
    inlineStylesheets: "auto",
    // NOT the default "_astro": GitHub Pages runs Jekyll on a branch without a
    // .nojekyll, and Jekyll drops every directory starting with an underscore,
    // which silently 404s the whole stylesheet and script bundle.
    assets: "astro",
  },
  devToolbar: { enabled: false },
});
