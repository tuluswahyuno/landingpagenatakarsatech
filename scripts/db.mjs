#!/usr/bin/env node
/**
 * Alat database Natakarsa Tech.
 *
 *   npm run db:setup            buat tabel + isi konten awal (hanya bila masih kosong)
 *   npm run admin:create        buat akun admin baru (interaktif)
 *   npm run admin:reset         ganti password akun yang sudah ada (interaktif)
 *
 * Membaca DATABASE_URL dari file .env.
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi.');
  process.exit(1);
}

const conn = await mysql.createConnection({ uri: url, multipleStatements: true, timezone: 'Z', charset: 'utf8mb4' });
await conn.query("SET time_zone = '+00:00'");
const cmd = process.argv[2];

try {
  if (cmd === 'setup') await setup();
  else if (cmd === 'create-admin') await createAdmin();
  else if (cmd === 'reset-password') await resetPassword();
  else {
    console.log('Perintah: setup | create-admin | reset-password');
    process.exitCode = 1;
  }
} catch (e) {
  console.error('Gagal:', e.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}

async function setup() {
  await conn.query(await readFile(join(root, 'db/schema.sql'), 'utf8'));
  console.log('✓ Tabel siap');

  const seedDir = join(root, 'db/seed');
  for (const key of ['kontak', 'angka', 'harga', 'testimoni', 'faq']) {
    const [r] = await conn.query('SELECT 1 FROM content WHERE `key` = ?', [key]);
    if (r.length) continue;
    const data = await readFile(join(seedDir, `${key}.json`), 'utf8');
    await conn.query('INSERT INTO content (`key`, data) VALUES (?, ?)', [key, JSON.stringify(JSON.parse(data))]);
    console.log(`✓ Konten awal "${key}" diisi`);
  }

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM portfolio');
  if (n === 0) {
    const files = (await readdir(join(seedDir, 'portfolio'))).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const { data: d, content } = matter(await readFile(join(seedDir, 'portfolio', f), 'utf8'));
      await conn.query(
        `INSERT INTO portfolio (slug, title, client, industry, category, year, summary, result, tags, features, stack, metrics, images,
           mockup, accent, video, demo_url, testimonial, body, sort_order, contoh, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          f.replace(/\.md$/, ''), d.title, d.client ?? '', d.industry ?? '', d.category, d.year, d.summary, d.result ?? '',
          JSON.stringify(d.tags ?? []), JSON.stringify(d.features ?? []), JSON.stringify(d.stack ?? []), JSON.stringify(d.metrics ?? []),
          JSON.stringify(d.images ?? []), d.mockup ?? 'dashboard', d.accent ?? '#6366f1', d.video ?? '', d.demoUrl ?? '',
          d.testimonial ? JSON.stringify(d.testimonial) : null, content.trim(), d.order ?? 99, d.contoh ? 1 : 0,
        ]
      );
    }
    console.log(`✓ ${files.length} portofolio contoh diisi`);
  }

  const [[{ u }]] = await conn.query('SELECT COUNT(*) AS u FROM users');
  if (u === 0) console.log('\nBelum ada akun admin. Jalankan: npm run admin:create');
  console.log('\nSelesai.');
}

function passwordProblem(pw) {
  if (pw.length < 10) return 'Password minimal 10 karakter.';
  if (pw.length > 72) return 'Password maksimal 72 karakter.';
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Password harus berisi huruf dan angka.';
  return '';
}

async function ask(questions) {
  // Bisa juga lewat variabel lingkungan (untuk otomasi): ADMIN_NAME, ADMIN_LOGIN_EMAIL, ADMIN_PASSWORD
  const rl = createInterface({ input: stdin, output: stdout });
  const out = {};
  for (const [k, q, env] of questions) out[k] = (process.env[env] ?? (await rl.question(q))).trim();
  rl.close();
  return out;
}

async function createAdmin() {
  const a = await ask([
    ['name', 'Nama: ', 'ADMIN_NAME'],
    ['email', 'Email login: ', 'ADMIN_LOGIN_EMAIL'],
    ['password', 'Password (min. 10 karakter, huruf + angka): ', 'ADMIN_PASSWORD'],
  ]);
  if (!a.name || !/^\S+@\S+\.\S+$/.test(a.email)) throw new Error('Nama dan email wajib diisi dengan benar.');
  const p = passwordProblem(a.password);
  if (p) throw new Error(p);
  await conn.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [a.name, a.email.toLowerCase(), await bcrypt.hash(a.password, 12), 'admin']);
  console.log(`✓ Akun admin ${a.email} dibuat. Login di /admin`);
}

async function resetPassword() {
  const a = await ask([
    ['email', 'Email akun: ', 'ADMIN_LOGIN_EMAIL'],
    ['password', 'Password baru (min. 10 karakter, huruf + angka): ', 'ADMIN_PASSWORD'],
  ]);
  const p = passwordProblem(a.password);
  if (p) throw new Error(p);
  const [r] = await conn.query('UPDATE users SET password_hash = ?, active = 1 WHERE email = ?', [await bcrypt.hash(a.password, 12), a.email.toLowerCase()]);
  if (!r.affectedRows) throw new Error('Email tidak ditemukan.');
  const [[user]] = await conn.query('SELECT id FROM users WHERE email = ?', [a.email.toLowerCase()]);
  await conn.query('DELETE FROM sessions WHERE user_id = ?', [user.id]);
  console.log('✓ Password diganti, semua sesi lama dikeluarkan.');
}
