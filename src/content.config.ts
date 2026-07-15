import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const claimLabel = z.enum(['evidence', 'inference', 'proposal', 'open-question']);

const claimMapEntry = z.object({
  claim: z.string(),
  label: claimLabel,
  source: z.string(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    // ── Required fields ──
    title: z.string().min(1, 'title is required'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    labels: z
      .array(claimLabel)
      .min(1, 'at least one claim label is required'),
    sources: z
      .array(z.string().min(1))
      .min(1, 'at least one source is required'),
    status: z.enum(['draft', 'review', 'published']),
    pilot: z.boolean(),
    reviewGate: z.boolean(),

    // ── Optional fields ──
    slug: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    published_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'published_date must be YYYY-MM-DD')
      .optional(),
    published_order: z.number().int().positive().optional(),
    claim_map: z.array(claimMapEntry).optional(),
    reading_time_minutes: z.number().int().positive().optional(),
    featured_image: z.string().optional(),
    featured_image_alt: z.string().min(1).optional(),
  }),
});

export const collections = { posts };
