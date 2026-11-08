/**
 * ============================================================
 *  SEMUA DATA YANG PERLU ANDA GANTI ADA DI FILE INI
 *  Cari tulisan "TODO" lalu isi dengan data asli Natakarsa Tech.
 *  Portofolio ada di folder src/content/portfolio (1 file = 1 aplikasi).
 * ============================================================
 */

export const site = {
  name: 'Natakarsa Tech',
  url: 'https://natakarsa.tech', // TODO: domain asli
  title: 'Natakarsa Tech — Jasa Pembuatan Sistem & Otomasi Bisnis',
  description:
    'Natakarsa Tech membangun sistem custom yang membuat bisnis Anda berjalan otomatis: aplikasi kasir, stok, laporan, ERP, hingga aplikasi mobile. Harga transparan, mulai Rp1,5 juta.',
  whatsapp: '6281234567890', // TODO: nomor WhatsApp bisnis, format 62xxxxxxxxxx
  email: 'halo@natakarsa.tech', // TODO
  address: 'Indonesia', // TODO: alamat kantor
  hours: 'Senin–Sabtu, 08.00–17.00 WIB',
  legal: 'Natakarsa Tech', // TODO: nama badan usaha + NIB
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' }, // TODO
    { label: 'TikTok', href: 'https://tiktok.com/' }, // TODO
    { label: 'LinkedIn', href: 'https://linkedin.com/' }, // TODO
  ],
  /** Opsional: URL endpoint (mis. Supabase Edge Function / Formspree) untuk menyimpan lead. Kosongkan bila belum ada. */
  leadEndpoint: import.meta.env.PUBLIC_LEAD_ENDPOINT ?? '',
};

export const waLink = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

/** TODO: ganti dengan angka asli. */
export const stats = [
  { value: 30, suffix: '+', label: 'Aplikasi dibangun' },
  { value: 20, suffix: '+', label: 'Klien terlayani' },
  { value: 12000, suffix: '+', label: 'Jam kerja manual dihemat' },
  { value: 5, suffix: ' th', label: 'Pengalaman' },
];

export const heroProof = ['30+ aplikasi dibangun', '20+ klien', 'Garansi bug hingga 6 bulan']; // TODO

export const industries = [
  'Retail & Toko', 'Distributor', 'Klinik', 'Sekolah', 'Koperasi', 'F&B', 'Instansi', 'Manufaktur', 'Logistik', 'Properti',
];

export const problems = [
  { before: 'Stok dicatat manual, sering selisih', after: 'Stok berkurang otomatis setiap ada penjualan' },
  { before: 'Laporan direkap berhari-hari dari banyak file', after: 'Laporan real-time, tinggal buka dashboard' },
  { before: 'Pesanan tercecer di chat WhatsApp', after: 'Semua pesanan masuk satu sistem, ada statusnya' },
  { before: 'Tidak tahu cabang mana yang untung', after: 'Perbandingan omzet per cabang dalam satu klik' },
];

export const services = [
  { icon: 'erp', title: 'Sistem Informasi & ERP', desc: 'Satu sistem untuk penjualan, stok, keuangan, dan SDM.', from: 'Konsultasi', category: 'internal' },
  { icon: 'pos', title: 'Aplikasi Kasir & Inventori', desc: 'Kasir cepat, stok otomatis, laporan laba harian.', from: 'Rp7,5 jt', category: 'retail' },
  { icon: 'dash', title: 'Web App & Dashboard', desc: 'Data bisnis rapi dalam grafik yang mudah dibaca.', from: 'Rp7,5 jt', category: 'keuangan' },
  { icon: 'mobile', title: 'Aplikasi Mobile', desc: 'Aplikasi Android untuk tim lapangan dan pelanggan.', from: 'Rp10 jt', category: 'semua' },
  { icon: 'bot', title: 'Otomasi WhatsApp & Integrasi', desc: 'Notifikasi, pengingat, dan alur kerja berjalan sendiri.', from: 'Rp1,5 jt', category: 'semua' },
  { icon: 'shield', title: 'Maintenance & Hosting', desc: 'Server aman, backup rutin, perbaikan cepat.', from: 'Rp350 rb/bln', category: 'semua' },
];

/** Catatan: jangan beri nama `process` — bentrok dengan variabel bawaan Node di mode dev. */
export const processSteps = [
  { title: 'Konsultasi', time: '1 hari', get: 'Gratis. Kami pahami alur bisnis dan masalah Anda.' },
  { title: 'Analisis & proposal', time: '2–3 hari', get: 'Daftar fitur, harga pasti, dan timeline tertulis.' },
  { title: 'Desain & prototype', time: '1–2 minggu', get: 'Tampilan aplikasi yang bisa Anda klik sebelum dibangun.' },
  { title: 'Development & testing', time: '2–8 minggu', get: 'Progres mingguan, bisa dicoba langsung.' },
  { title: 'Rilis, training & maintenance', time: 'Berkelanjutan', get: 'Tim Anda dilatih, garansi bug, dukungan setelah rilis.' },
];

export const packages = [
  {
    name: 'Starter',
    price: 'Rp1,5 jt',
    prefix: 'Mulai',
    for: 'Usaha yang baru mulai go-digital',
    features: [
      'Landing page / profil usaha 1–5 halaman',
      'atau 1 otomasi sederhana (formulir → Google Sheets + notifikasi WhatsApp)',
      'Domain .com & hosting tahun pertama',
      'Selesai 3–7 hari kerja',
      'Garansi bug 1 bulan',
    ],
    popular: false,
  },
  {
    name: 'Business',
    price: 'Rp7,5 jt',
    prefix: 'Mulai',
    for: 'UMKM yang ingin operasional otomatis',
    features: [
      'Web app 3–5 modul (kasir, stok, pelanggan, laporan)',
      'Dashboard & laporan otomatis',
      'Multi-user dengan hak akses',
      'Export Excel / PDF',
      'Training tim 1 sesi',
      'Selesai 3–6 minggu · garansi bug 3 bulan',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Konsultasi',
    prefix: '',
    for: 'Multi-cabang, instansi, kebutuhan kompleks',
    features: [
      'ERP / sistem custom penuh',
      'Aplikasi mobile',
      'Integrasi payment gateway, WhatsApp API, sistem lain',
      'Dokumentasi teknis',
      'Garansi 6 bulan + SLA',
    ],
    popular: false,
  },
];

export const addons = [
  { name: 'Maintenance & hosting', price: 'mulai Rp350 rb/bulan' },
  { name: 'Modul tambahan', price: 'mulai Rp1,5 jt/modul' },
  { name: 'Aplikasi Android pendamping', price: 'mulai Rp10 jt' },
];

/** Kalkulator estimasi. Angka = perkiraan kasar, harga final via konsultasi. */
export const calculator = {
  bases: [
    { id: 'web', label: 'Website / landing page', min: 1.5, max: 3, weeks: [1, 1] },
    { id: 'app', label: 'Web app / sistem internal', min: 7.5, max: 12, weeks: [3, 5] },
    { id: 'mobile', label: 'Aplikasi mobile (Android)', min: 10, max: 18, weeks: [4, 8] },
  ],
  modules: [
    { id: 'kasir', label: 'Kasir / POS', min: 1.5, max: 3 },
    { id: 'stok', label: 'Stok & gudang', min: 1.5, max: 3 },
    { id: 'pelanggan', label: 'Data pelanggan / CRM', min: 1.5, max: 2.5 },
    { id: 'laporan', label: 'Laporan & dashboard', min: 1.5, max: 3 },
    { id: 'keuangan', label: 'Keuangan & hutang-piutang', min: 2, max: 4 },
    { id: 'sdm', label: 'Absensi & penggajian', min: 2, max: 4 },
    { id: 'wa', label: 'Notifikasi WhatsApp otomatis', min: 1.5, max: 2.5 },
    { id: 'cabang', label: 'Multi-cabang', min: 3, max: 6 },
  ],
};

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

/**
 * TODO: ganti dengan testimoni asli + izin klien, lalu ubah `contoh` menjadi false.
 * Testimoni dengan contoh: true tampil dengan label "Contoh".
 */
export const testimonials = [
  { quote: 'Dulu rekap stok tiap akhir bulan makan 3 hari. Sekarang tinggal buka dashboard.', name: 'Pemilik Toko Bangunan', role: 'Retail, Jawa Tengah', contoh: true },
  { quote: 'Tim lapangan input pesanan dari HP, admin langsung dapat notifikasi. Tidak ada lagi pesanan terlewat.', name: 'Manajer Operasional', role: 'Distributor FMCG', contoh: true },
  { quote: 'Prosesnya jelas dari awal: ada prototype, timeline, dan training. Tim kami cepat terbiasa.', name: 'Kepala Administrasi', role: 'Klinik Pratama', contoh: true },
];

export const faqs = [
  { q: 'Berapa lama pembuatan sistem?', a: 'Starter 3–7 hari kerja, Business 3–6 minggu, Enterprise 2–4 bulan. Timeline pasti tertulis di proposal.' },
  { q: 'Berapa biayanya?', a: 'Mulai Rp1,5 juta untuk Starter dan Rp7,5 juta untuk Business. Proyek besar lewat konsultasi gratis. Coba kalkulator estimasi di atas untuk gambaran awal.' },
  { q: 'Apakah pembayaran bisa bertahap?', a: 'Bisa. Umumnya DP 50% dan pelunasan saat serah terima. Paket Business bisa termin 40/30/30, Enterprise per milestone.' },
  { q: 'Apakah saya mendapat source code?', a: 'Ya. Source code diserahkan setelah pelunasan untuk paket Business dan Enterprise.' },
  { q: 'Bagaimana kalau ada bug setelah rilis?', a: 'Semua paket punya garansi bug gratis: 1 bulan (Starter), 3 bulan (Business), 6 bulan + SLA (Enterprise).' },
  { q: 'Sistemnya di-hosting di mana?', a: 'Di server cloud yang andal. Kami bisa mengurus hosting lewat paket maintenance, atau memasang di server milik Anda.' },
  { q: 'Apakah data bisnis saya aman?', a: 'Data dienkripsi saat dikirim (HTTPS), dibackup rutin, dan akses dibatasi per user. Kami juga siap menandatangani perjanjian kerahasiaan (NDA).' },
  { q: 'Saya belum tahu butuh fitur apa. Bagaimana?', a: 'Tidak masalah. Ceritakan masalah bisnis Anda saat konsultasi gratis, kami bantu susun fitur yang paling berdampak dulu.' },
];

export const nav = [
  { label: 'Layanan', href: '/#layanan' },
  { label: 'Portofolio', href: '/#portofolio' },
  { label: 'Proses', href: '/#proses' },
  { label: 'Harga', href: '/#harga' },
  { label: 'FAQ', href: '/#faq' },
];

export const categories = [
  { id: 'semua', label: 'Semua' },
  { id: 'retail', label: 'Retail' },
  { id: 'kesehatan', label: 'Kesehatan' },
  { id: 'pendidikan', label: 'Pendidikan' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'internal', label: 'Internal Tools' },
] as const;
