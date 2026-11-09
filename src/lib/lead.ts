const SITEKEY: string = import.meta.env.PUBLIC_TURNSTILE_SITEKEY ?? '';
export const turnstileEnabled = !!SITEKEY;

export type LeadResult = { ok: true } | { ok: false; error: string };

const utm = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem('nk_utm') || '{}');
  } catch {
    return {};
  }
};

/** Kirim lead ke server (/api/lead): disimpan di database lalu diteruskan ke Telegram/email. */
export async function sendLead(data: Record<string, unknown>): Promise<LeadResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, utm: utm(), halaman: location.pathname }),
      signal: ctrl.signal,
    });
    const out = await res.json().catch(() => ({ ok: false, error: 'Server sedang bermasalah.' }));
    return out.ok ? { ok: true } : { ok: false, error: out.error || 'Gagal mengirim.' };
  } catch {
    return { ok: false, error: 'Koneksi bermasalah. Coba lagi, atau kirim lewat WhatsApp.' };
  } finally {
    clearTimeout(timer);
  }
}

export const getUtm = utm;

/** Muat Cloudflare Turnstile hanya saat dibutuhkan (tidak membebani muatan awal halaman). */
let turnstileLoading: Promise<void> | null = null;
export function loadTurnstile(): Promise<void> {
  if (!SITEKEY) return Promise.resolve();
  if (!turnstileLoading) {
    turnstileLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  return turnstileLoading;
}

/** Pasang widget Turnstile di elemen; mengembalikan fungsi untuk membaca token. */
export async function mountTurnstile(el: HTMLElement): Promise<() => string> {
  if (!SITEKEY) return () => '';
  await loadTurnstile();
  const ts = (window as any).turnstile;
  if (!ts) return () => '';
  if (!el.dataset.widgetId) {
    el.dataset.widgetId = ts.render(el, {
      sitekey: SITEKEY,
      theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      language: 'id',
      appearance: 'interaction-only',
    });
  }
  return () => ts.getResponse(el.dataset.widgetId) || '';
}

export function resetTurnstile(el: HTMLElement) {
  const ts = (window as any).turnstile;
  if (ts && el.dataset.widgetId) ts.reset(el.dataset.widgetId);
}
