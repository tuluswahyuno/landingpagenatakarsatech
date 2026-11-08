# Website Natakarsa Tech

Landing page + portofolio, dibangun dengan **Astro 5 + Tailwind CSS 4**. Sesuai PRD di folder induk.

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:4321 (mode pengembangan)
npm run build     # hasil statis di folder dist/
npm run preview   # cek hasil build
```

## Yang WAJIB diganti sebelum rilis

1. **`src/data/site.ts`** — cari tulisan `TODO`:
   - nomor WhatsApp bisnis, email, alamat, legalitas, link media sosial
   - angka statistik (`stats`, `heroProof`)
   - testimoni asli (lalu ubah `contoh: true` → `false`)
2. **`src/content/portfolio/*.md`** — 6 file ini masih **contoh**. Ganti dengan aplikasi asli Anda:
   - 1 file = 1 aplikasi, nama file = URL (`/portofolio/nama-file/`)
   - ubah `contoh: true` → `false` agar label "Contoh" hilang
   - screenshot asli: simpan di `public/portfolio/` lalu isi `images: ["/portfolio/nama.webp"]` (format WebP/AVIF, lebar ±1200 px)
   - demo publik: isi `demoUrl`
3. **`astro.config.mjs`** dan **`public/robots.txt`** — ganti `natakarsa.tech` dengan domain asli.

## Menyimpan lead ke database (opsional)

Formulir brief saat ini membuka WhatsApp dengan pesan terisi otomatis (tidak butuh server).
Untuk juga menyimpan lead ke database, buat file `.env`:

```
PUBLIC_LEAD_ENDPOINT=https://url-endpoint-anda
```

Endpoint menerima `POST` JSON berisi: bisnis, kebutuhan, paket, fitur, budget, nama, usaha, wa, email, utm, waktu.
Bisa memakai Supabase Edge Function, Formspree, atau Google Apps Script (ke Google Sheets).

## Analytics

Semua event (`cta_whatsapp_click`, `lead_submit`, `portfolio_filter`, `scroll_depth`, dll.) dikirim ke `window.dataLayer`.
Pasang Google Tag Manager / GA4 atau Umami di `src/layouts/Base.astro` dan event otomatis tercatat.

## Deploy (gratis)

- **Cloudflare Pages** atau **Vercel**: hubungkan repo, build command `npm run build`, output `dist`.

## Struktur

```
src/
  data/site.ts            ← semua teks, harga, FAQ, kontak
  content/portfolio/      ← studi kasus (Markdown)
  components/             ← tiap section halaman
  pages/                  ← index, portofolio/[slug], terima-kasih, kebijakan-privasi, 404
  styles/global.css       ← warna, font, animasi
```
