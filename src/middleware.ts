import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, canAccess } from './lib/server/auth';
import { getContent } from './lib/server/content';
import { startScheduler } from './lib/server/leads';
import { isHttps } from './lib/server/http';

/**
 * Bila menambah layanan pihak ketiga (script, iframe, API), tambahkan domainnya di sini,
 * kalau tidak layanan itu akan diblokir browser.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://connect.facebook.net https://cloud.umami.is",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://cloud.umami.is https://api-gateway.umami.dev https://www.facebook.com https://challenges.cloudflare.com",
  'frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://www.youtube.com https://cal.com https://app.cal.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Tolak request pengubah data yang datang dari situs lain (anti-CSRF). */
function sameOrigin(request: Request): boolean {
  const h = request.headers;
  const host = h.get('host');
  const from = h.get('origin') || h.get('referer');
  if (!host || !from || from === 'null') return false;
  try {
    return new URL(from).host === host;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  startScheduler();

  if (!SAFE_METHODS.has(ctx.request.method) && !sameOrigin(ctx.request)) {
    return new Response('Permintaan ditolak (asal tidak dikenal).', { status: 403 });
  }

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAsset = pathname.startsWith('/uploads/') || pathname.startsWith('/api/') || pathname === '/sitemap.xml';

  let res: Response;
  if (isAdmin) {
    const user = await getSessionUser(ctx.cookies);
    ctx.locals.user = user ?? undefined;
    const isLogin = /^\/admin\/login\/?$/.test(pathname);
    if (!user && !isLogin) {
      if (pathname.startsWith('/admin/api/')) return new Response(JSON.stringify({ ok: false, error: 'Sesi berakhir, silakan login lagi.' }), { status: 401 });
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(pathname + ctx.url.search)}`);
    }
    if (user && !canAccess(user.role, pathname)) {
      return new Response('Akses ditolak: halaman ini khusus admin.', { status: 403 });
    }
    res = await next();
    try {
      res.headers.set('Cache-Control', 'no-store');
    } catch {
      res = new Response(res.body, res);
      res.headers.set('Cache-Control', 'no-store');
    }
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else {
    if (!isAsset) ctx.locals.content = await getContent();
    res = await next();
    const type = res.headers.get('content-type') || '';
    if (type.includes('text/html') && !res.headers.has('Cache-Control')) {
      // HTML selalu dicek ulang agar perubahan dari admin langsung terlihat
      res.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }

  // Header beberapa response (mis. redirect) tidak bisa diubah: salin dulu
  try {
    res.headers.set('X-Content-Type-Options', 'nosniff');
  } catch {
    res = new Response(res.body, res);
  }
  const h = res.headers;
  h.set('Content-Security-Policy', CSP + (isHttps(ctx) ? '; upgrade-insecure-requests' : ''));
  h.set('X-Frame-Options', 'DENY');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (isHttps(ctx)) h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return res;
});
