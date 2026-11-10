# Website Natakarsa Tech

Landing page + portofolio + **panel admin**, dibangun dengan **Astro 5 (Node.js) + Tailwind CSS 4 + MySQL/MariaDB**.

- Situs publik: halaman dirender di server, konten diambil dari database (cache 60 detik, langsung diperbarui saat admin menyimpan).
- Panel admin: `/admin` untuk mengelola lead, portofolio, konten situs, dan pengguna.

## Menjalankan di komputer sendiri

Butuh Node.js 20.12+ dan MySQL/MariaDB (mis. Laragon/XAMPP).

```bash
npm install
cp .env.example .env        # isi DATABASE_URL
npm run db:setup            # buat tabel + isi konten awal
npm run admin:create        # buat akun admin pertama
npm run dev                 # http://localhost:4321  → admin: /admin
```

## Panel admin

| Menu | Isi | Peran |
| --- | --- | --- |
| Dashboard | Jumlah lead, alur status, lead yang belum dihubungi, sumber lead (UTM) | Admin, Sales |
| Lead | Daftar + filter + cari, detail, ubah status (Baru → Dihubungi → Proposal → Deal / Batal), catatan, penugasan, export CSV, hapus data | Admin, Sales (hapus: admin) |
| Portofolio | Tambah/edit/hapus studi kasus, upload screenshot & video, urutan, tampil/sembunyi | Admin |
| Konten situs | Kontak & perusahaan (WA, email, NIB, booking, PDF company profile), angka, paket & harga, testimoni, FAQ | Admin |
| Pengguna | Tambah akun, peran Admin/Sales, nonaktifkan, reset password | Admin |
| Akun saya | Ganti nama & password | Semua |

Lupa password dan tidak ada admin lain? Jalankan `npm run admin:reset` di server.

### Otomatis

- **Lead baru** (formulir brief / unduh company profile) → tersimpan di database, notifikasi ke **Telegram** dan **email** admin.
- **Di luar jam kerja** (Senin–Sabtu 08.00–17.00 WIB) → balasan otomatis ke email calon klien (dan WhatsApp bila Fonnte diisi).
- **Company profile** → link PDF dikirim ke email peminta.
- **Pengingat follow-up** setiap hari pukul 09.00 WIB: lead berstatus Baru/Dihubungi diingatkan di H+3 dan H+7 (WA otomatis via Fonnte, atau link WA siap kirim di Telegram). Lead tanpa respons setelah H+10 otomatis jadi **Batal**. Semua tercatat di riwayat lead.

### Keamanan

- Password di-hash (bcrypt), sesi login disimpan sebagai hash di database, cookie `HttpOnly` + `Secure`.
- Login dibatasi 5 percobaan gagal per email / 20 per IP dalam 15 menit.
- Semua form dan API menolak request dari situs lain (cek `Origin`).
- Upload dicek dari isi file (JPG, PNG, WebP, GIF, AVIF, MP4, WebM, PDF saja; SVG/HTML ditolak).
- Formulir publik: honeypot, validasi server, rate limit per IP/kontak, dan Cloudflare Turnstile (opsional).
- Header keamanan (CSP, HSTS, X-Frame-Options, dll.) dipasang di `src/middleware.ts`. **Bila menambah layanan pihak ketiga** (script, iframe, API), tambahkan domainnya ke `CSP` di file itu.

## Deploy dengan CloudPanel

Situs ini terpasang di CloudPanel sebagai **Node.js Site** (`natakarsa.com`, user `natakarsa`, App Port **3004**).

- Kode: `/home/natakarsa/htdocs/natakarsa.com`, konfigurasi di `.env` (PORT harus sama dengan App Port).
- Database dibuat dari tab **Databases** CloudPanel.
- Proses dijalankan PM2 milik user `natakarsa`; service `pm2-natakarsa` menyalakannya lagi setelah reboot.
- Nginx & SSL diatur CloudPanel (tab **Vhost** dan **SSL/TLS**). `deploy/nginx.conf` tidak dipakai.
- Update: `ssh` sebagai root → `su - natakarsa` → `cd htdocs/natakarsa.com && bash deploy/update.sh`.

## Deploy ke VPS tanpa panel (Ubuntu / Debian)

Contoh di bawah memakai folder `/var/www/natakarsa/web`.

**1. Pasang paket**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx mariadb-server certbot python3-certbot-nginx git
sudo npm install -g pm2
sudo mysql_secure_installation
```

**2. Buat database**

```bash
sudo mysql -e "CREATE DATABASE natakarsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'natakarsa'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT';
GRANT ALL ON natakarsa.* TO 'natakarsa'@'localhost'; FLUSH PRIVILEGES;"
```

**3. Ambil kode, isi `.env`, build**

```bash
sudo mkdir -p /var/www/natakarsa && sudo chown $USER /var/www/natakarsa
git clone https://github.com/tuluswahyuno/landingpagenatakarsatech.git /var/www/natakarsa/web
cd /var/www/natakarsa/web
cp .env.example .env && nano .env      # isi DATABASE_URL, TRUST_PROXY=true, Telegram, dll.
chmod 600 .env
npm ci && npm run build
npm run db:setup
npm run admin:create
```

> Variabel `PUBLIC_...` (Turnstile, analytics) dibaca saat **build**. Setelah mengubahnya, jalankan `npm run build` lalu `pm2 reload natakarsa-web`.

**4. Jalankan dengan PM2** (otomatis hidup lagi setelah crash / reboot)

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save && pm2 startup     # ikuti perintah yang dicetak
```

**5. Nginx + SSL**

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/natakarsa   # sesuaikan domain & folder
sudo ln -s /etc/nginx/sites-available/natakarsa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d natakarsa.com -d www.natakarsa.com
```

**6. Backup harian** (database + upload, disimpan 14 hari)

```bash
chmod +x deploy/backup.sh
crontab -e     # tambahkan baris:
# 30 2 * * * /var/www/natakarsa/web/deploy/backup.sh >> $HOME/natakarsa-backup.log 2>&1
```

Simpan juga salinan backup di luar VPS (mis. Google Drive / komputer kantor).

**Update website** setelah ada perubahan kode: `bash deploy/update.sh`

Log aplikasi: `pm2 logs natakarsa-web`

### Notifikasi Telegram

1. Chat **@BotFather** → `/newbot` → salin token ke `TELEGRAM_BOT_TOKEN`.
2. Kirim pesan apa saja ke bot (atau masukkan bot ke grup tim), lalu buka `https://api.telegram.org/bot<TOKEN>/getUpdates` dan salin angka `chat.id` ke `TELEGRAM_CHAT_ID`.
3. `pm2 reload natakarsa-web`.

## Checklist sebelum rilis

1. Deploy ke VPS sesuai langkah di atas, isi Telegram (dan SMTP bila ingin email).
2. Turnstile: buat site di dashboard Cloudflare → isi `PUBLIC_TURNSTILE_SITEKEY` + `TURNSTILE_SECRET` → build ulang.
3. Konten lewat **/admin**: kontak, NIB, angka, testimoni asli, 6 studi kasus asli + screenshot. Matikan centang *Data contoh* setelah diganti.
4. Bila domain berubah: ganti `natakarsa.com` di `astro.config.mjs`, `public/robots.txt`, dan `site.url` di `src/data/site.ts`.

## Analytics

| Variabel | Alat | Butuh persetujuan cookie? |
| --- | --- | --- |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami (ringan, ramah privasi) | tidak |
| `PUBLIC_GA4_ID` | Google Analytics 4 | ya |
| `PUBLIC_CLARITY_ID` | Microsoft Clarity (heatmap, rekaman sesi) | ya |
| `PUBLIC_META_PIXEL_ID` | Meta Pixel (iklan IG/FB) | ya |

Alat yang butuh persetujuan baru dimuat setelah pengunjung menekan **Terima** di banner cookie.
Semua event (`cta_whatsapp_click`, `form_step_complete`, `lead_submit`, `portfolio_filter`, `case_study_view`, `demo_open`, `pricing_select`, `scroll_depth`, `profile_download`, `booking_open`) terkirim otomatis ke semua alat yang terpasang.

## Struktur

```
src/
  pages/                  ← halaman publik + /admin + /api/lead
  pages/admin/            ← panel admin
  middleware.ts           ← login admin, anti-CSRF, header keamanan, muat konten
  lib/server/             ← database, login, lead & notifikasi, upload
  lib/content-schema.ts   ← struktur & validasi konten yang bisa diedit
  data/site.ts            ← teks statis: layanan, proses, perbandingan, menu
  components/             ← tiap section halaman
  layouts/                ← Base (situs) dan Admin
db/schema.sql             ← struktur tabel
db/seed/                  ← konten awal (dipakai sekali saat db:setup)
scripts/db.mjs            ← db:setup, admin:create, admin:reset
deploy/                   ← PM2, Nginx, backup, update
uploads/                  ← file dari panel admin (tidak masuk git)
```
