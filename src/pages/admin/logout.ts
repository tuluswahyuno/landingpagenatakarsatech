import type { APIRoute } from 'astro';
import { destroySession } from '../../lib/server/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await destroySession(cookies);
  return redirect('/admin/login', 303);
};
