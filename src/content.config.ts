import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.string(),
    category: z.enum(['retail', 'kesehatan', 'pendidikan', 'keuangan', 'internal']),
    year: z.number(),
    summary: z.string(),
    result: z.string(),
    tags: z.array(z.string()),
    features: z.array(z.string()),
    stack: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    mockup: z.enum(['dashboard', 'kasir', 'mobile']).default('dashboard'),
    accent: z.string().default('#6366f1'),
    /** Daftar path screenshot di folder public/, mis. /portfolio/kasir-1.webp */
    images: z.array(z.string()).default([]),
    demoUrl: z.string().url().optional(),
    order: z.number().default(99),
    /** true = data contoh, tampil dengan label "Contoh". Ubah ke false setelah diganti data asli. */
    contoh: z.boolean().default(false),
    testimonial: z
      .object({ quote: z.string(), name: z.string(), role: z.string() })
      .optional(),
  }),
});

export const collections = { portfolio };
