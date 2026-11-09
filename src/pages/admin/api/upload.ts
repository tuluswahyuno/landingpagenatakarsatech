import type { APIRoute } from 'astro';
import { saveUpload, MAX_UPLOAD } from '../../../lib/server/uploads';
import { jsonResponse } from '../../../lib/server/http';

export const POST: APIRoute = async ({ request }) => {
  if (Number(request.headers.get('content-length') || 0) > MAX_UPLOAD + 100_000) {
    return jsonResponse({ ok: false, error: 'File terlalu besar (maksimal 30 MB).' }, 413);
  }
  try {
    const form = await request.formData();
    const file = form.get('file');
    const accept = String(form.get('accept') || 'any') as 'image' | 'video' | 'pdf' | 'any';
    if (!(file instanceof File)) return jsonResponse({ ok: false, error: 'Tidak ada file.' }, 400);
    const r = await saveUpload(file, ['image', 'video', 'pdf'].includes(accept) ? accept : 'any');
    return 'error' in r ? jsonResponse({ ok: false, error: r.error }, 400) : jsonResponse({ ok: true, url: r.url });
  } catch (e) {
    console.error('[upload]', e);
    return jsonResponse({ ok: false, error: 'Gagal mengunggah file.' }, 500);
  }
};
