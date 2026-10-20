import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  // src/content/blog/<lang>/<slug>.md  →  id "<lang>/<slug>"
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Same value in both languages links a post to its translation. */
    translationKey: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
