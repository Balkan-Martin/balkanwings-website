import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One markdown file per training program per language: src/content/programs/{en,bg}/<slug>.md
// The file name (slug) must be identical in both languages.
const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
  schema: z.object({
    handle: z.string().optional(), // not named 'slug': Astro would use it as the entry id
    title: z.string(),
    order: z.number().default(100),
    summary: z.string().default(''),
    requirements: z.string().default(''),
    duration: z.string().default(''),
    price: z.string().default(''),
    image: z.string().default(''),
    imageAlt: z.string().default(''),
    gallery: z.array(z.object({ image: z.string(), alt: z.string().default('') })).default([]),
    draft: z.boolean().default(false),
  }),
});
export const collections = { programs };
