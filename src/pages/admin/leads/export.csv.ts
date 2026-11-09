import type { APIRoute } from 'astro';
import { query } from '../../../lib/server/db';
import { leadFilter } from '../../../lib/server/lead-filter';

const COLS: [string, string][] = [
  ['created_at', 'Waktu (WIB)'], ['status', 'Status'], ['tipe', 'Tipe'], ['nama', 'Nama'], ['usaha', 'Usaha'], ['wa', 'WhatsApp'],
  ['email', 'Email'], ['bisnis', 'Jenis bisnis'], ['kebutuhan', 'Kebutuhan'], ['paket', 'Paket'], ['fitur', 'Fitur'], ['budget', 'Budget'],
  ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'], ['utm_content', 'utm_content'], ['halaman', 'Halaman'],
];

const wib = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ');

const cell = (v: unknown) => {
  let s = v instanceof Date ? wib(v) : String(v ?? '');
  // Cegah formula injection saat dibuka di Excel / Google Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: APIRoute = async ({ url }) => {
  const f = leadFilter(url.searchParams);
  const rows = await query<any>(`SELECT ${COLS.map((c) => c[0]).join(', ')} FROM leads ${f.sql} ORDER BY id DESC LIMIT 50000`, f.args);
  const csv = '﻿' + [COLS.map((c) => c[1]).join(','), ...rows.map((r) => COLS.map(([k]) => cell(r[k])).join(','))].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="lead-natakarsa-${date}.csv"` },
  });
};
