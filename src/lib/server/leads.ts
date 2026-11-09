/** Penerimaan lead, notifikasi, dan pengingat follow-up otomatis. */
import { exec, one, query } from './db';
import { getContent } from './content';
import { BRAND, SITE_URL, esc, waUrl, sendTelegram, sendEmail, sendWhatsApp, adminEmail } from './notify';

export const STATUSES = ['Baru', 'Dihubungi', 'Proposal', 'Deal', 'Batal'] as const;
export type Status = (typeof STATUSES)[number];
const OPEN_STATUSES: Status[] = ['Baru', 'Dihubungi'];

export type LeadInput = {
  tipe: 'Brief' | 'Company profile';
  nama: string;
  usaha: string;
  wa: string;
  email: string;
  bisnis: string;
  kebutuhan: string;
  paket: string;
  fitur: string;
  budget: string;
  halaman: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
};

const str = (v: unknown, max = 500) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, (c) => (c === '\n' ? '\n' : ' '))
    .trim()
    .slice(0, max);

export function normalizePhone(v: string): string {
  const p = v.replace(/[^\d+]/g, '');
  if (/^\+?62/.test(p)) return '62' + p.replace(/^\+?62/, '');
  if (/^0/.test(p)) return '62' + p.slice(1);
  return p.replace(/\+/g, '');
}

export function cleanLead(d: any): LeadInput {
  const utm = d?.utm && typeof d.utm === 'object' ? d.utm : {};
  return {
    tipe: d?.tipe === 'profile' ? 'Company profile' : 'Brief',
    nama: str(d?.nama, 100),
    usaha: str(d?.usaha, 120),
    wa: normalizePhone(str(d?.wa, 20)),
    email: str(d?.email, 120).toLowerCase(),
    bisnis: str(d?.bisnis, 80),
    kebutuhan: str(d?.kebutuhan, 2000),
    paket: str(d?.paket, 40),
    fitur: str(d?.fitur, 400),
    budget: str(d?.budget, 40),
    halaman: str(d?.halaman, 200),
    utm_source: str(utm.utm_source, 100),
    utm_medium: str(utm.utm_medium, 100),
    utm_campaign: str(utm.utm_campaign, 100),
    utm_content: str(utm.utm_content, 100),
  };
}

export function validateLead(l: LeadInput): string {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email);
  if (l.nama.length < 2) return 'Nama wajib diisi.';
  if (l.tipe === 'Company profile') return emailOk ? '' : 'Email belum valid.';
  if (!/^628\d{7,12}$/.test(l.wa)) return 'Nomor WhatsApp belum valid.';
  if (l.email && !emailOk) return 'Email belum valid.';
  if (!l.bisnis) return 'Jenis bisnis wajib diisi.';
  if (l.kebutuhan.length < 10) return 'Kebutuhan wajib diisi.';
  if (!l.budget) return 'Perkiraan budget wajib diisi.';
  return '';
}

export async function saveLead(l: LeadInput, ip: string): Promise<number> {
  const res = await exec(
    `INSERT INTO leads (tipe, nama, usaha, wa, email, bisnis, kebutuhan, paket, fitur, budget, halaman,
       utm_source, utm_medium, utm_campaign, utm_content, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [l.tipe, l.nama, l.usaha, l.wa, l.email, l.bisnis, l.kebutuhan, l.paket, l.fitur, l.budget, l.halaman, l.utm_source, l.utm_medium, l.utm_campaign, l.utm_content, ip || null]
  );
  return res.insertId;
}

const adminLeadUrl = (id: number) => `${SITE_URL}/admin/leads/${id}`;
const source = (l: LeadInput) => [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ') || 'langsung';

/** Kirim semua notifikasi lead baru. Kegagalan notifikasi tidak mempengaruhi lead yang sudah tersimpan. */
export async function notifyNewLead(id: number, l: LeadInput) {
  const isProfile = l.tipe === 'Company profile';
  const lines = isProfile
    ? ['📄 <b>Unduh company profile</b>', '', `<b>${esc(l.nama)}</b>${l.usaha ? ' · ' + esc(l.usaha) : ''}`, '✉️ ' + esc(l.email)]
    : [
        '🔔 <b>Lead baru</b>',
        '',
        `<b>${esc(l.nama)}</b>${l.usaha ? ' · ' + esc(l.usaha) : ''}`,
        `🏷 ${esc(l.bisnis)} · ${esc(l.paket)} · ${esc(l.budget)}`,
        '🧩 ' + esc(l.fitur || '-'),
        '',
        '📝 ' + esc(l.kebutuhan),
        '',
        `📱 <a href="${esc(waUrl(l.wa, `Halo ${l.nama}, terima kasih sudah mengisi brief di website ${BRAND}. `))}">Balas via WhatsApp (+${l.wa})</a>`,
        l.email ? '✉️ ' + esc(l.email) : '',
      ];
  lines.push('📈 Sumber: ' + esc(source(l)));
  lines.push(`📊 <a href="${adminLeadUrl(id)}">Buka di panel admin</a>`);

  const rows: [string, string][] = (
    [
      ['Tipe', l.tipe], ['Nama', l.nama], ['Usaha', l.usaha], ['WhatsApp', l.wa ? '+' + l.wa : ''], ['Email', l.email],
      ['Jenis bisnis', l.bisnis], ['Kebutuhan', l.kebutuhan], ['Paket', l.paket], ['Fitur', l.fitur], ['Budget', l.budget], ['Sumber', source(l)],
    ] as [string, string][]
  ).filter((r) => r[1]);
  const html =
    '<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">' +
    rows.map((r) => `<tr><td style="color:#666;vertical-align:top">${esc(r[0])}</td><td><b>${esc(r[1]).replace(/\n/g, '<br>')}</b></td></tr>`).join('') +
    '</table>' +
    (l.wa ? `<p><a href="${esc(waUrl(l.wa, `Halo ${l.nama}, `))}">Balas via WhatsApp</a></p>` : '') +
    `<p><a href="${adminLeadUrl(id)}">Buka di panel admin</a></p>`;

  await Promise.allSettled([
    sendTelegram(lines.filter((x) => x !== '').join('\n')),
    sendEmail({ to: adminEmail(), subject: `[${BRAND}] ${l.tipe} baru: ${l.nama}`, html, replyTo: l.email || undefined }),
    replyToLead(l),
  ]);
}

export function isWorkingHours(d = new Date()): boolean {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value])
  );
  const h = Number(p.hour);
  return p.weekday !== 'Sun' && h >= 8 && h < 17;
}

/** Balasan otomatis ke calon klien. */
async function replyToLead(l: LeadInput) {
  if (l.tipe === 'Company profile') {
    const url = (await getContent()).kontak.companyProfileUrl;
    if (!url || !l.email) return;
    const abs = url.startsWith('/') ? SITE_URL + url : url;
    await sendEmail({
      to: l.email,
      subject: `Company profile ${BRAND}`,
      html: `<p>Halo ${esc(l.nama)},</p><p>Terima kasih atas minat Anda. Company profile ${BRAND} bisa diunduh di tautan berikut:</p><p><a href="${esc(abs)}">Unduh company profile (PDF)</a></p><p>Bila ingin berdiskusi atau meminta proposal, cukup balas email ini.</p><p>Salam,<br>${BRAND}</p>`,
      replyTo: adminEmail() || undefined,
    });
    return;
  }
  if (isWorkingHours()) return; // di jam kerja admin membalas langsung
  const msg =
    `Halo ${l.nama}, terima kasih sudah menghubungi ${BRAND}. Brief Anda sudah kami terima. ` +
    'Saat ini di luar jam kerja (Senin–Sabtu, 08.00–17.00 WIB), tim kami akan membalas paling lambat pukul 08.15 WIB di hari kerja berikutnya.';
  await Promise.allSettled([
    l.email ? sendEmail({ to: l.email, subject: `Brief Anda sudah kami terima — ${BRAND}`, text: `${msg}\n\nSalam,\n${BRAND}`, replyTo: adminEmail() || undefined }) : null,
    sendWhatsApp(l.wa, msg),
  ]);
}

/* ------------------------------------------------------------------ */
/*  Pengingat follow-up H+3 / H+7, otomatis Batal di H+10              */
/* ------------------------------------------------------------------ */

export async function addNote(leadId: number, userId: number | null, note: string) {
  await exec('INSERT INTO lead_notes (lead_id, user_id, note) VALUES (?, ?, ?)', [leadId, userId, note.slice(0, 5000)]);
}

function reminderText(nama: string, day: 3 | 7) {
  return day === 3
    ? `Halo ${nama}, ini ${BRAND}. Kami ingin menindaklanjuti brief yang Anda kirim beberapa hari lalu. Apakah ada waktu untuk konsultasi singkat minggu ini? Konsultasi gratis.`
    : `Halo ${nama}, ini ${BRAND}. Kami masih siap membantu kebutuhan sistem Anda. Bila sudah tidak relevan, tidak apa-apa, cukup balas "tidak" dan kami tidak akan menghubungi lagi. Terima kasih!`;
}

export async function runFollowUp(): Promise<{ reminded: number; cancelled: number }> {
  const leads = await query<any>(
    `SELECT id, nama, wa, email, reminded_7_at, reminded_3_at,
            TIMESTAMPDIFF(DAY, created_at, UTC_TIMESTAMP()) AS age
       FROM leads WHERE tipe = 'Brief' AND status IN (?) ORDER BY id`,
    [OPEN_STATUSES]
  );
  const todo: string[] = [];
  let cancelled = 0;
  for (const l of leads) {
    if (l.age >= 10 && l.reminded_7_at) {
      await exec("UPDATE leads SET status = 'Batal' WHERE id = ?", [l.id]);
      await addNote(l.id, null, 'Otomatis Batal: tidak ada respons setelah pengingat H+7.');
      cancelled++;
      continue;
    }
    const day: 3 | 7 | 0 = l.age >= 7 && !l.reminded_7_at ? 7 : l.age >= 3 && !l.reminded_3_at && !l.reminded_7_at ? 3 : 0;
    if (!day) continue;
    const msg = reminderText(l.nama, day);
    const sentWa = await sendWhatsApp(l.wa, msg);
    if (l.email) await sendEmail({ to: l.email, subject: `Tindak lanjut brief Anda — ${BRAND}`, text: `${msg}\n\nSalam,\n${BRAND}`, replyTo: adminEmail() || undefined });
    await exec(`UPDATE leads SET ${day === 7 ? 'reminded_7_at' : 'reminded_3_at'} = UTC_TIMESTAMP() WHERE id = ?`, [l.id]);
    await addNote(l.id, null, `Pengingat H+${day} ${sentWa ? 'terkirim otomatis via WhatsApp' : 'disiapkan (kirim manual dari Telegram)'}${l.email ? ' dan email' : ''}.`);
    todo.push(
      sentWa
        ? `H+${day} · ${esc(l.nama)} (+${l.wa}) — terkirim otomatis`
        : `H+${day} · <b>${esc(l.nama)}</b>: <a href="${esc(waUrl(l.wa, msg))}">kirim pesan WA</a> · <a href="${adminLeadUrl(l.id)}">detail</a>`
    );
  }
  if (todo.length) await sendTelegram(`⏰ <b>Pengingat follow-up hari ini</b>\n\n${todo.join('\n')}`);
  return { reminded: todo.length, cancelled };
}

/** Jadwal harian pukul 09.00 WIB. Dicek tiap 15 menit; tanggal terakhir disimpan di tabel kv. */
let started = false;
export function startScheduler() {
  if (started || import.meta.env.DEV) return;
  started = true;
  const tick = async () => {
    try {
      const p = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', hourCycle: 'h23' })
          .formatToParts(new Date())
          .map((x) => [x.type, x.value])
      );
      if (Number(p.hour) < 9) return;
      const today = `${p.year}-${p.month}-${p.day}`;
      const last = await one<{ value: string }>("SELECT value FROM kv WHERE `key` = 'followup_last'");
      if (last?.value === today) return;
      await exec("INSERT INTO kv (`key`, value) VALUES ('followup_last', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [today]);
      const r = await runFollowUp();
      console.log(`[follow-up] ${today}: ${r.reminded} pengingat, ${r.cancelled} dibatalkan`);
    } catch (e: any) {
      console.error('[follow-up]', e.message);
    }
  };
  setTimeout(tick, 30_000);
  setInterval(tick, 15 * 60_000).unref();
}
