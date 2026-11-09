/**
 * Struktur konten yang bisa diedit dari panel admin.
 * - `schemas`: validasi di server (data dari browser tidak dipercaya begitu saja).
 * - `sections`: definisi form editor di /admin/konten/[bagian].
 */
import { z } from 'astro/zod';

const text = (max = 300) => z.string().trim().max(max).default('');
const url = z.union([z.string().trim().url().max(500), z.literal(''), z.string().trim().regex(/^\/[^\s]*$/).max(500)]).default('');
const lines = (max = 300) => z.array(z.string().trim().min(1).max(max)).default([]);

export const kontakSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, '').replace(/^0/, '62'))
    .refine((v) => /^628\d{7,12}$/.test(v), 'Nomor WhatsApp belum valid (contoh: 6281234567890)'),
  email: z.string().trim().email('Email belum valid'),
  address: text(200),
  hours: text(100),
  legal: text(150),
  nib: text(40),
  socials: z.array(z.object({ label: z.string().trim().min(1, 'Nama media sosial wajib diisi').max(40), href: z.string().trim().url('Link media sosial belum valid') })).default([]),
  bookingUrl: url,
  companyProfileUrl: url,
});

export const angkaSchema = z.object({
  heroProof: lines(80),
  stats: z.array(z.object({ value: z.coerce.number().min(0), suffix: text(10), label: text(60) })).default([]),
});

export const hargaSchema = z.object({
  packages: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Nama paket wajib diisi').max(40),
        price: z.string().trim().min(1, 'Harga wajib diisi').max(40),
        prefix: text(20),
        for: text(120),
        features: lines(200),
        popular: z.coerce.boolean().default(false),
      })
    )
    .default([]),
  addons: z.array(z.object({ name: z.string().trim().min(1).max(80), price: text(60) })).default([]),
});

export const testimoniSchema = z.object({
  items: z
    .array(
      z.object({
        quote: z.string().trim().min(1, 'Isi testimoni wajib diisi').max(600),
        name: text(80),
        role: text(80),
        photo: url,
        video: url,
        contoh: z.coerce.boolean().default(false),
      })
    )
    .default([]),
});

export const faqSchema = z.object({
  items: z.array(z.object({ q: z.string().trim().min(1, 'Pertanyaan wajib diisi').max(200), a: z.string().trim().min(1, 'Jawaban wajib diisi').max(1500) })).default([]),
});

export const schemas = { kontak: kontakSchema, angka: angkaSchema, harga: hargaSchema, testimoni: testimoniSchema, faq: faqSchema };
export type SectionKey = keyof typeof schemas;
export type Kontak = z.infer<typeof kontakSchema>;
export type Angka = z.infer<typeof angkaSchema>;
export type Harga = z.infer<typeof hargaSchema>;
export type Testimoni = z.infer<typeof testimoniSchema>;
export type Faq = z.infer<typeof faqSchema>;

/* ------------------------------------------------------------------ */
/*  Definisi form editor                                               */
/* ------------------------------------------------------------------ */

export type Field = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'bool' | 'lines' | 'url' | 'image' | 'file' | 'list';
  help?: string;
  placeholder?: string;
  /** Untuk type 'list': field di dalam setiap item */
  fields?: Field[];
  /** Untuk type 'list': field yang dipakai sebagai judul item */
  titleField?: string;
  itemName?: string;
};

export const sections: Record<SectionKey, { title: string; desc: string; fields: Field[] }> = {
  kontak: {
    title: 'Kontak & perusahaan',
    desc: 'Nomor WhatsApp, email, alamat, legalitas, dan tautan yang tampil di seluruh situs.',
    fields: [
      { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'text', placeholder: '6281234567890', help: 'Format internasional tanpa tanda +. Angka 0 di depan otomatis diubah ke 62.' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'address', label: 'Alamat', type: 'text' },
      { name: 'hours', label: 'Jam kerja', type: 'text', placeholder: 'Senin–Sabtu, 08.00–17.00 WIB' },
      { name: 'legal', label: 'Nama badan usaha', type: 'text', help: 'Tampil di footer, mis. "PT Natakarsa Teknologi Indonesia".' },
      { name: 'nib', label: 'NIB', type: 'text', help: 'Kosongkan bila belum ada.' },
      { name: 'bookingUrl', label: 'Link booking video call', type: 'url', placeholder: 'https://cal.com/nama-anda/konsultasi', help: 'Kosongkan untuk menyembunyikan tombol "Jadwalkan video call".' },
      { name: 'companyProfileUrl', label: 'Company profile (PDF)', type: 'file', help: 'Unggah PDF. Kosongkan untuk menyembunyikan tombol unduh.' },
      {
        name: 'socials',
        label: 'Media sosial',
        type: 'list',
        itemName: 'media sosial',
        titleField: 'label',
        fields: [
          { name: 'label', label: 'Nama', type: 'text', placeholder: 'Instagram' },
          { name: 'href', label: 'Link', type: 'url', placeholder: 'https://instagram.com/natakarsa' },
        ],
      },
    ],
  },
  angka: {
    title: 'Angka & bukti',
    desc: 'Angka pencapaian di section statistik dan poin bukti di bawah judul utama.',
    fields: [
      { name: 'heroProof', label: 'Poin bukti di hero', type: 'lines', help: 'Satu poin per baris, mis. "30+ aplikasi dibangun".' },
      {
        name: 'stats',
        label: 'Statistik',
        type: 'list',
        itemName: 'angka',
        titleField: 'label',
        fields: [
          { name: 'value', label: 'Angka', type: 'number' },
          { name: 'suffix', label: 'Akhiran', type: 'text', placeholder: '+ atau " th"' },
          { name: 'label', label: 'Keterangan', type: 'text' },
        ],
      },
    ],
  },
  harga: {
    title: 'Paket & harga',
    desc: 'Kartu paket di section harga beserta layanan tambahan.',
    fields: [
      {
        name: 'packages',
        label: 'Paket',
        type: 'list',
        itemName: 'paket',
        titleField: 'name',
        fields: [
          { name: 'name', label: 'Nama paket', type: 'text' },
          { name: 'prefix', label: 'Awalan harga', type: 'text', placeholder: 'Mulai', help: 'Kosongkan bila tidak perlu.' },
          { name: 'price', label: 'Harga', type: 'text', placeholder: 'Rp7,5 jt', help: 'Isi "Konsultasi" untuk paket tanpa harga pasti.' },
          { name: 'for', label: 'Cocok untuk', type: 'text' },
          { name: 'features', label: 'Fitur', type: 'lines', help: 'Satu fitur per baris.' },
          { name: 'popular', label: 'Tandai "Paling populer"', type: 'bool' },
        ],
      },
      {
        name: 'addons',
        label: 'Layanan tambahan',
        type: 'list',
        itemName: 'layanan',
        titleField: 'name',
        fields: [
          { name: 'name', label: 'Nama', type: 'text' },
          { name: 'price', label: 'Harga', type: 'text' },
        ],
      },
    ],
  },
  testimoni: {
    title: 'Testimoni',
    desc: 'Kutipan klien. Pastikan sudah mendapat izin dari klien.',
    fields: [
      {
        name: 'items',
        label: 'Testimoni',
        type: 'list',
        itemName: 'testimoni',
        titleField: 'name',
        fields: [
          { name: 'quote', label: 'Isi testimoni', type: 'textarea' },
          { name: 'name', label: 'Nama / jabatan', type: 'text' },
          { name: 'role', label: 'Usaha / kota', type: 'text' },
          { name: 'photo', label: 'Foto', type: 'image', help: 'Opsional. Foto persegi, mis. 200×200 px.' },
          { name: 'video', label: 'Link video testimoni', type: 'url', help: 'Opsional, mis. link YouTube.' },
          { name: 'contoh', label: 'Data contoh (tampil label "Contoh")', type: 'bool' },
        ],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    desc: 'Pertanyaan yang sering ditanyakan. Juga dipakai Google untuk hasil pencarian.',
    fields: [
      {
        name: 'items',
        label: 'Pertanyaan',
        type: 'list',
        itemName: 'pertanyaan',
        titleField: 'q',
        fields: [
          { name: 'q', label: 'Pertanyaan', type: 'text' },
          { name: 'a', label: 'Jawaban', type: 'textarea' },
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Portofolio                                                         */
/* ------------------------------------------------------------------ */

export const categories = [
  { id: 'semua', label: 'Semua' },
  { id: 'retail', label: 'Retail' },
  { id: 'kesehatan', label: 'Kesehatan' },
  { id: 'pendidikan', label: 'Pendidikan' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'internal', label: 'Internal Tools' },
] as const;

export const portfolioSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya huruf kecil, angka, dan tanda hubung (mis. sistem-kasir-toko)')
    .max(120),
  title: z.string().trim().min(2, 'Judul wajib diisi').max(150),
  client: text(150),
  industry: text(80),
  category: z.enum(['retail', 'kesehatan', 'pendidikan', 'keuangan', 'internal']),
  year: z.coerce.number().int().min(2000).max(2100),
  summary: z.string().trim().min(1, 'Ringkasan wajib diisi').max(400),
  result: text(150),
  tags: lines(40),
  features: lines(200),
  stack: lines(40),
  metrics: z.array(z.object({ value: z.string().trim().max(30), label: z.string().trim().max(60) })).max(6).default([]),
  images: z.array(z.string().trim().max(500)).default([]),
  mockup: z.enum(['dashboard', 'kasir', 'mobile']).default('dashboard'),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Warna aksen harus format #RRGGBB').default('#6366f1'),
  video: url,
  demoUrl: z.union([z.string().trim().url(), z.literal('')]).default(''),
  testimonial: z.object({ quote: text(600), name: text(80), role: text(80) }).default({ quote: '', name: '', role: '' }),
  body: z.string().max(50000).default(''),
  order: z.coerce.number().int().default(99),
  contoh: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
});
export type PortfolioInput = z.infer<typeof portfolioSchema>;

/** Ubah hasil validasi zod jadi pesan singkat berbahasa Indonesia. */
export function zodMessage(err: z.ZodError): string {
  const i = err.issues[0];
  if (!i) return 'Data belum valid.';
  const path = i.path.filter((p) => typeof p === 'string').join(' › ');
  return path ? `${i.message} (${path})` : i.message;
}
