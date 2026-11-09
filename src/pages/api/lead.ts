import type { APIRoute } from 'astro';
import { TURNSTILE_SECRET } from 'astro:env/server';
import { cleanLead, validateLead, saveLead, notifyNewLead } from '../../lib/server/leads';
import { clientIp, hit, jsonResponse } from '../../lib/server/http';

const HOUR = 3600_000;

async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: TURNSTILE_SECRET!, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    return (await res.json()).success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async (ctx) => {
  const ip = clientIp(ctx);
  let d: any;
  try {
    const raw = await ctx.request.text();
    if (raw.length > 20_000) return jsonResponse({ ok: false, error: 'Data terlalu panjang.' }, 413);
    d = JSON.parse(raw || '{}');
  } catch {
    return jsonResponse({ ok: false, error: 'Format data tidak valid.' }, 400);
  }

  // 1. Honeypot: bot biasanya mengisi semua field. Dibalas "berhasil" agar bot tidak mencoba cara lain.
  if (d?.website) return jsonResponse({ ok: true });

  // 2. Validasi di server
  const lead = cleanLead(d);
  const err = validateLead(lead);
  if (err) return jsonResponse({ ok: false, error: err }, 422);

  // 3. Rate limit: per IP, per kontak, dan total (rem darurat saat diserang bot)
  const keys: [string, number][] = [
    [`lead:ip:${ip}`, 10],
    ...(lead.wa ? ([[`lead:wa:${lead.wa}`, 5]] as [string, number][]) : []),
    ...(lead.email ? ([[`lead:em:${lead.email}`, 5]] as [string, number][]) : []),
    ['lead:all', 100],
  ];
  if (!keys.every(([k, n]) => hit(k, n, HOUR))) {
    return jsonResponse({ ok: false, error: 'Terlalu banyak kiriman. Coba lagi dalam 1 jam, atau hubungi kami via WhatsApp.' }, 429);
  }

  // 4. Cloudflare Turnstile (bila diaktifkan)
  if (TURNSTILE_SECRET && !(await verifyTurnstile(d.turnstile, ip))) {
    return jsonResponse({ ok: false, error: 'Verifikasi anti-spam gagal. Muat ulang halaman lalu coba lagi.' }, 400);
  }

  // 5. Simpan, lalu kirim notifikasi di belakang layar (pengunjung tidak perlu menunggu)
  try {
    const id = await saveLead(lead, ip);
    notifyNewLead(id, lead).catch((e) => console.error('[lead notify]', e));
    return jsonResponse({ ok: true });
  } catch (e) {
    console.error('[lead save]', e);
    return jsonResponse({ ok: false, error: 'Terjadi kesalahan di server.' }, 500);
  }
};
