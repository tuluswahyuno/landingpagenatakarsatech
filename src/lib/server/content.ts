/**
 * Membaca konten situs dari database, disimpan sementara di memori.
 * Cache dibersihkan setiap kali admin menyimpan perubahan, dan kedaluwarsa sendiri
 * setelah 60 detik (jaga-jaga bila aplikasi dijalankan lebih dari satu proses).
 */
import { Marked } from 'marked';
import { query, json } from './db';
import { schemas, type Kontak, type Angka, type Harga, type Testimoni, type Faq } from '../content-schema';

export type Portfolio = {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  category: string;
  year: number;
  summary: string;
  result: string;
  tags: string[];
  features: string[];
  stack: string[];
  metrics: { value: string; label: string }[];
  images: string[];
  mockup: 'dashboard' | 'kasir' | 'mobile';
  accent: string;
  video: string;
  demoUrl: string;
  testimonial?: { quote: string; name: string; role: string };
  body: string;
  bodyHtml: string;
  order: number;
  contoh: boolean;
  published: boolean;
};

export type SiteContent = {
  kontak: Kontak;
  angka: Angka;
  harga: Harga;
  testimoni: Testimoni;
  faq: Faq;
  /** Hanya yang dipublikasikan, urut sesuai kolom urutan */
  portfolio: Portfolio[];
  waLink: (message: string) => string;
};

const TTL = 60_000;
let cache: { at: number; data: SiteContent } | null = null;
let loading: Promise<SiteContent> | null = null;

export function invalidateContent() {
  cache = null;
}

export async function getContent(): Promise<SiteContent> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  if (!loading) {
    loading = load()
      .then((data) => {
        cache = { at: Date.now(), data };
        return data;
      })
      .catch((e) => {
        // Database sedang bermasalah: tetap tampilkan konten terakhir yang berhasil dimuat
        if (cache) {
          console.error('[content] gagal memuat, memakai cache lama:', e.message);
          return cache.data;
        }
        throw e;
      })
      .finally(() => (loading = null));
  }
  return loading;
}

async function load(): Promise<SiteContent> {
  const rows = await query<{ key: string; data: unknown }>('SELECT `key`, data FROM content');
  const raw = Object.fromEntries(rows.map((r) => [r.key, json(r.data, {})]));
  // Data lama yang tidak lolos validasi tidak membuat situs error: pakai nilai bawaan schema
  const parse = <K extends keyof typeof schemas>(k: K) => {
    const r = schemas[k].safeParse(raw[k] ?? {});
    if (!r.success) console.error(`[content] data "${k}" tidak valid:`, r.error.issues[0]?.message);
    return (r.success ? r.data : schemas[k].parse({ ...(k === 'kontak' ? { whatsapp: '6289673393833', email: 'halo@natakarsa.tech' } : {}) })) as any;
  };
  const kontak: Kontak = parse('kontak');
  const portfolio = (await query('SELECT * FROM portfolio WHERE published = 1 ORDER BY sort_order, id')).map(toPortfolio);
  return {
    kontak,
    angka: parse('angka'),
    harga: parse('harga'),
    testimoni: parse('testimoni'),
    faq: parse('faq'),
    portfolio,
    waLink: (message: string) => `https://wa.me/${kontak.whatsapp}?text=${encodeURIComponent(message)}`,
  };
}

/* ------------------------------------------------------------------ */

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Markdown studi kasus. HTML mentah tidak dirender (ditampilkan sebagai teks) agar aman. */
const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
  },
});
const safeHref = (h: string) => /^(https?:|mailto:|\/|#)/i.test(h.trim());
md.use({
  walkTokens(token: any) {
    if ((token.type === 'link' || token.type === 'image') && !safeHref(token.href)) token.href = '#';
  },
});

export function renderMarkdown(src: string): string {
  return md.parse(src, { async: false }) as string;
}

export function toPortfolio(r: any): Portfolio {
  const t = json<{ quote?: string; name?: string; role?: string } | null>(r.testimonial, null);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    client: r.client,
    industry: r.industry,
    category: r.category,
    year: r.year,
    summary: r.summary,
    result: r.result,
    tags: json(r.tags, []),
    features: json(r.features, []),
    stack: json(r.stack, []),
    metrics: json(r.metrics, []),
    images: json<string[]>(r.images, []).filter(Boolean),
    mockup: r.mockup,
    accent: r.accent,
    video: r.video,
    demoUrl: r.demo_url,
    testimonial: t?.quote ? { quote: t.quote, name: t.name ?? '', role: t.role ?? '' } : undefined,
    body: r.body,
    bodyHtml: renderMarkdown(r.body ?? ''),
    order: r.sort_order,
    contoh: !!r.contoh,
    published: !!r.published,
  };
}
