/** Pengiriman notifikasi: Telegram, email (SMTP), WhatsApp (Fonnte). Semuanya opsional. */
import nodemailer from 'nodemailer';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_URL, SMTP_FROM, ADMIN_EMAIL, FONNTE_TOKEN } from 'astro:env/server';

export const BRAND = 'Natakarsa Tech';
export const SITE_URL = (import.meta.env.SITE || 'http://localhost:4321').replace(/\/$/, '');

export const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const waUrl = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

const withTimeout = (ms: number) => AbortSignal.timeout(ms);

export async function sendTelegram(html: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: withTimeout(10_000),
    });
    if (!res.ok) console.error('[telegram]', res.status, await res.text());
    return res.ok;
  } catch (e: any) {
    console.error('[telegram]', e.message);
    return false;
  }
}

let transport: nodemailer.Transporter | null = null;
export const emailEnabled = () => !!SMTP_URL;

export async function sendEmail(opts: { to: string; subject: string; html?: string; text?: string; replyTo?: string }): Promise<boolean> {
  if (!SMTP_URL || !opts.to) return false;
  try {
    transport ??= nodemailer.createTransport(SMTP_URL);
    await transport.sendMail({ from: SMTP_FROM || `${BRAND} <${ADMIN_EMAIL || 'no-reply@localhost'}>`, ...opts });
    return true;
  } catch (e: any) {
    console.error('[email]', e.message);
    return false;
  }
}

export const adminEmail = () => ADMIN_EMAIL || '';

/** Kirim WA otomatis lewat Fonnte. Tanpa FONNTE_TOKEN tidak melakukan apa-apa. */
export async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  if (!FONNTE_TOKEN || !phone) return false;
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: FONNTE_TOKEN },
      body: new URLSearchParams({ target: phone, message: text }),
      signal: withTimeout(15_000),
    });
    return res.ok;
  } catch (e: any) {
    console.error('[fonnte]', e.message);
    return false;
  }
}
