import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    updatedDate: z.coerce.date().optional(),
    contactTitle: z.string().optional(),
    contactContent: z.string().optional(),
  }),
});

const faqs = defineCollection({
  loader: file("./src/content/faqs.json"),
  schema: z.object({
    category: z.string(),
    question: z.string(),
    answer: z.string(),
    sort: z.number(),
  }),
});

export const collections = { pages, faqs };
