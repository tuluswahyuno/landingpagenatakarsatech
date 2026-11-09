import { STATUSES } from './leads';

/** Bangun WHERE untuk daftar lead dari parameter URL (dipakai halaman daftar dan export CSV). */
export function leadFilter(params: URLSearchParams) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  const status = params.get('status') || '';
  const tipe = params.get('tipe') || '';
  const q = (params.get('q') || '').trim().slice(0, 100);
  const from = params.get('dari') || '';
  const to = params.get('sampai') || '';

  if ((STATUSES as readonly string[]).includes(status)) {
    where.push('status = ?');
    args.push(status);
  }
  if (tipe === 'Brief' || tipe === 'Company profile') {
    where.push('tipe = ?');
    args.push(tipe);
  }
  if (q) {
    where.push('(nama LIKE ? OR usaha LIKE ? OR wa LIKE ? OR email LIKE ? OR kebutuhan LIKE ?)');
    const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    args.push(like, like, like, like, like);
  }
  // Tanggal dalam WIB → UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    where.push('created_at >= ?');
    args.push(new Date(`${from}T00:00:00+07:00`).toISOString().slice(0, 19).replace('T', ' '));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    where.push('created_at < ?');
    args.push(new Date(new Date(`${to}T00:00:00+07:00`).getTime() + 86400_000).toISOString().slice(0, 19).replace('T', ' '));
  }
  return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', args, status, tipe, q, from, to };
}
