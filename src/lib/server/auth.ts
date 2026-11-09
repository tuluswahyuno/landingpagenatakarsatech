import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { AstroCookies } from 'astro';
import { exec, one } from './db';

export type Role = 'admin' | 'sales';
export type User = { id: number; name: string; email: string; role: Role };

export const SESSION_COOKIE = 'nk_session';
const SESSION_DAYS = 7;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);

/** Hash tiruan agar waktu respons sama untuk email yang tidak terdaftar (cegah tebak email). */
const DUMMY_HASH = '$2b$12$IETpRQIkyG08agmmXbr5SOTUjlgQ2yGRUAKocLRhv4CCl3kTg9uAe';

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  const row = await one<any>('SELECT id, name, email, role, active, password_hash FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !ok || !row.active) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export function passwordProblem(pw: string): string {
  if (pw.length < 10) return 'Password minimal 10 karakter.';
  if (pw.length > 72) return 'Password maksimal 72 karakter.';
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Password harus berisi huruf dan angka.';
  return '';
}

export async function createSession(cookies: AstroCookies, userId: number, ip: string, ua: string, secure: boolean) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await exec('INSERT INTO sessions (id, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)', [sha256(token), userId, expires, ip, ua.slice(0, 255)]);
  await exec('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [userId]);
  // Bersihkan sesi kedaluwarsa sesekali
  if (Math.random() < 0.1) exec('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()').catch(() => {});
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure, sameSite: 'lax', path: '/', expires });
}

export async function getSessionUser(cookies: AstroCookies): Promise<User | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = await one<any>(
    `SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > UTC_TIMESTAMP() AND u.active = 1`,
    [sha256(token)]
  );
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role } : null;
}

export async function destroySession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) await exec('DELETE FROM sessions WHERE id = ?', [sha256(token)]);
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Keluarkan semua sesi milik user (dipakai saat ganti password / user dinonaktifkan). */
export async function destroyUserSessions(userId: number, exceptCookies?: AstroCookies) {
  const keep = exceptCookies?.get(SESSION_COOKIE)?.value;
  if (keep) await exec('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [userId, sha256(keep)]);
  else await exec('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

/** Halaman admin yang boleh dibuka role "sales". Selain ini hanya untuk role "admin". */
export function canAccess(role: Role, path: string): boolean {
  if (role === 'admin') return true;
  return /^\/admin\/?$/.test(path) || /^\/admin\/(leads|akun|logout)(\/|$|\.)/.test(path);
}
