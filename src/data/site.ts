/**
 * ============================================================
 *  Teks statis situs. Konten yang sering diubah (kontak, angka, harga,
 *  testimoni, FAQ, portofolio) disimpan di database dan diedit lewat
 *  panel admin (/admin). Di komponen, ambil dari `Astro.locals.content`.
 * ============================================================
 */

export const site = {
  name: "Natakarsa Tech",
  url: "https://natakarsa.tech", // TODO: domain asli (samakan dengan astro.config.mjs)
  title: "Natakarsa Tech — Jasa Pembuatan Sistem & Otomasi Bisnis",
  description:
    "Natakarsa Tech membangun sistem custom yang membuat bisnis Anda berjalan otomatis: aplikasi kasir, stok, laporan, ERP, hingga aplikasi mobile. Harga transparan, mulai Rp1,5 juta.",
  /** Site key Cloudflare Turnstile (anti-spam). Kosongkan untuk menonaktifkan. */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITEKEY ?? "",
};

export const industries = [
  'Retail & Toko', 'Distributor', 'Klinik', 'Sekolah', 'Koperasi', 'F&B', 'Instansi', 'Manufaktur', 'Logistik', 'Properti',
];

export const problems = [
  { area: 'Stok', before: 'Stok dihitung manual, sering selisih', after: 'Stok berkurang otomatis tiap ada penjualan', gain: 'Selisih terdeteksi hari itu' },
  { area: 'Laporan', before: 'Rekap berhari-hari dari banyak file Excel', after: 'Laporan real-time di satu dashboard', gain: '3 hari → 1 klik' },
  { area: 'Pesanan', before: 'Pesanan tercecer di chat WhatsApp', after: 'Semua pesanan masuk satu sistem', gain: 'Tak ada yang terlewat' },
  { area: 'Cabang', before: 'Tak tahu cabang mana yang untung', after: 'Omzet semua cabang dalam 1 klik', gain: 'Putuskan pakai data' },
];

export const services = [
  { icon: 'erp', title: 'Sistem Informasi & ERP', desc: 'Satu sistem terpadu untuk penjualan, stok, keuangan, dan SDM.', points: ['Multi-cabang & multi-user', 'Hak akses per jabatan', 'Laporan konsolidasi'], from: 'Konsultasi', category: 'internal' },
  { icon: 'pos', title: 'Aplikasi Kasir & Inventori', desc: 'Kasir cepat dengan stok yang berkurang otomatis setiap transaksi.', points: ['Barcode & cetak struk', 'Stok minimum & opname', 'Laba harian otomatis'], from: 'Rp7,5 jt', category: 'retail' },
  { icon: 'dash', title: 'Web App & Dashboard', desc: 'Data bisnis tersaji rapi dalam grafik yang mudah dibaca.', points: ['Grafik real-time', 'Export Excel & PDF', 'Akses dari mana saja'], from: 'Rp7,5 jt', category: 'keuangan' },
  { icon: 'mobile', title: 'Aplikasi Mobile', desc: 'Aplikasi Android untuk tim lapangan dan pelanggan Anda.', points: ['Bisa dipakai offline', 'Absensi & lokasi GPS', 'Notifikasi push'], from: 'Rp10 jt', category: 'semua' },
  { icon: 'bot', title: 'Otomasi WhatsApp & Integrasi', desc: 'Notifikasi, pengingat, dan alur kerja yang berjalan sendiri.', points: ['Pengingat tagihan & janji', 'Payment gateway', 'Sinkron ke sistem lain'], from: 'Rp1,5 jt', category: 'semua' },
  { icon: 'shield', title: 'Maintenance & Hosting', desc: 'Sistem tetap aman, cepat, dan selalu bisa diakses.', points: ['Backup harian', 'Pemantauan 24/7', 'Perbaikan prioritas'], from: 'Rp350 rb/bln', category: 'semua' },
];

/** Catatan: jangan beri nama `process` — bentrok dengan variabel bawaan Node di mode dev. */
export const processSteps = [
  { title: 'Konsultasi', time: '1 hari', get: 'Gratis. Kami pahami alur bisnis dan masalah Anda.' },
  { title: 'Analisis & proposal', time: '2–3 hari', get: 'Daftar fitur, harga pasti, dan timeline tertulis.' },
  { title: 'Desain & prototype', time: '1–2 minggu', get: 'Tampilan aplikasi yang bisa Anda klik sebelum dibangun.' },
  { title: 'Development & testing', time: '2–8 minggu', get: 'Progres mingguan, bisa dicoba langsung.' },
  { title: 'Rilis, training & maintenance', time: 'Berkelanjutan', get: 'Tim Anda dilatih, garansi bug, dukungan setelah rilis.' },
];

export const comparison = {
  cols: ['Natakarsa Tech', 'Freelancer', 'Software jadi'],
  rows: [
    { label: 'Sesuai alur bisnis Anda', v: ['yes', 'partial', 'no'] },
    { label: 'Garansi & dukungan setelah rilis', v: ['yes', 'no', 'partial'] },
    { label: 'Source code jadi milik Anda', v: ['yes', 'partial', 'no'] },
    { label: 'Tanpa biaya langganan per user', v: ['yes', 'yes', 'no'] },
    { label: 'Timeline & harga tertulis', v: ['yes', 'partial', 'yes'] },
  ],
};

export const nav = [
  { label: 'Layanan', href: '/#layanan' },
  { label: 'Portofolio', href: '/#portofolio' },
  { label: 'Proses', href: '/#proses' },
  { label: 'Harga', href: '/#harga' },
  { label: 'FAQ', href: '/#faq' },
];

export { categories } from '../lib/content-schema';
