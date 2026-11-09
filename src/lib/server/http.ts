import type { APIContext } from 'astro';
import { TRUST_PROXY } from 'astro:env/server';

/** IP pengunjung. Di belakang Nginx (TRUST_PROXY=true) dibaca dari header X-Real-IP. */
export function clientIp(ctx: Pick<APIContext, 'request' | 'clientAddress'>): string {
  if (TRUST_PROXY) {
    const h = ctx.request.headers;
    const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0];
    if (ip) return ip.trim().slice(0, 45);
  }
  try {
    return ctx.clientAddress.slice(0, 45);
  } catch {
    return '';
  }
}

/** true bila koneksi asli pengunjung memakai HTTPS (untuk cookie Secure). */
export function isHttps(ctx: Pick<APIContext, 'request' | 'url'>): boolean {
  if (TRUST_PROXY && ctx.request.headers.get('x-forwarded-proto') === 'https') return true;
  return ctx.url.protocol === 'https:';
}

/* ------------------------------------------------------------------ */
/*  Rate limit sederhana di memori (cukup untuk 1 proses Node)         */
/* ------------------------------------------------------------------ */

const buckets = new Map<string, { n: number; reset: number }>();

/** Catat 1 percobaan. Mengembalikan false bila sudah melewati batas dalam jendela waktu. */
export function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n++;
  return b.n <= limit;
}

/** Cek tanpa menambah hitungan. */
export function blocked(key: string, limit: number): boolean {
  const b = buckets.get(key);
  return !!b && b.reset > Date.now() && b.n >= limit;
}

export function clearHits(key: string) {
  buckets.delete(key);
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
}, 10 * 60_000).unref();

/* ------------------------------------------------------------------ */

export const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/** Format tanggal untuk tampilan admin, zona WIB. */
export function fmtDate(d: Date | string | null | undefined, withTime = true): string {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}
