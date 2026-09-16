import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog posts live in src/content/blog as .md or .mdx.
 *
 * Files whose name starts with an underscore are ignored by the loader, which
 * is why the starter lives at _template.md — copy it to a real name to publish.
 * `draft: true` keeps a post out of production builds while still showing it
 * in `npm run dev`.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
