/** Penyimpanan file upload (gambar, video, PDF) di folder UPLOAD_DIR, diakses lewat /uploads/... */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { randomBytes } from 'node:crypto';
import { UPLOAD_DIR } from 'astro:env/server';

export const uploadRoot = () => resolve(UPLOAD_DIR);

type Kind = { ext: string; mime: string; max: number; test: (b: Buffer) => boolean };
const MB = 1024 * 1024;

/** Jenis file yang diizinkan, dicek dari isi file (bukan dari nama/ekstensi kiriman browser). SVG sengaja tidak diizinkan. */
const KINDS: Kind[] = [
  { ext: 'jpg', mime: 'image/jpeg', max: 8 * MB, test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', mime: 'image/png', max: 8 * MB, test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', mime: 'image/webp', max: 8 * MB, test: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP' },
  { ext: 'gif', mime: 'image/gif', max: 8 * MB, test: (b) => b.toString('latin1', 0, 4) === 'GIF8' },
  { ext: 'avif', mime: 'image/avif', max: 8 * MB, test: (b) => b.toString('latin1', 4, 8) === 'ftyp' && /avi[fs]/.test(b.toString('latin1', 8, 12)) },
  { ext: 'mp4', mime: 'video/mp4', max: 30 * MB, test: (b) => b.toString('latin1', 4, 8) === 'ftyp' && !/avi[fs]/.test(b.toString('latin1', 8, 12)) },
  { ext: 'webm', mime: 'video/webm', max: 30 * MB, test: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  { ext: 'pdf', mime: 'application/pdf', max: 25 * MB, test: (b) => b.toString('latin1', 0, 5) === '%PDF-' },
];

export const MIME: Record<string, string> = Object.fromEntries(KINDS.map((k) => [k.ext, k.mime]));
export const MAX_UPLOAD = 30 * MB;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'file';

export async function saveUpload(file: File, accept: 'image' | 'video' | 'pdf' | 'any' = 'any'): Promise<{ url: string } | { error: string }> {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return { error: 'File kosong.' };
  if (file.size > MAX_UPLOAD) return { error: 'File terlalu besar (maksimal 30 MB).' };
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = KINDS.find((k) => k.test(buf));
  if (!kind) return { error: 'Jenis file tidak didukung. Gunakan JPG, PNG, WebP, GIF, AVIF, MP4, WebM, atau PDF.' };
  if (accept !== 'any' && !kind.mime.startsWith(accept === 'pdf' ? 'application/pdf' : accept)) {
    return { error: accept === 'image' ? 'Harus berupa gambar.' : accept === 'video' ? 'Harus berupa video.' : 'Harus berupa PDF.' };
  }
  if (buf.length > kind.max) return { error: `File ${kind.ext.toUpperCase()} maksimal ${kind.max / MB} MB.` };

  const now = new Date();
  const dir = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const name = `${slugify(file.name)}-${randomBytes(4).toString('hex')}.${kind.ext}`;
  await mkdir(join(uploadRoot(), dir), { recursive: true });
  await writeFile(join(uploadRoot(), dir, name), buf, { flag: 'wx' });
  return { url: `/uploads/${dir}/${name}` };
}

/** Path aman di dalam folder upload, atau null bila mencoba keluar folder. */
export function safeUploadPath(rel: string): string | null {
  if (!/^[a-z0-9/_.-]+$/i.test(rel) || rel.includes('..')) return null;
  const root = uploadRoot();
  const full = resolve(root, rel);
  return full.startsWith(root + sep) ? full : null;
}
