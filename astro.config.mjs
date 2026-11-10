// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://natakarsa.com',
  // Halaman dirender di server (Node.js) agar perubahan dari panel admin langsung tampil.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  // Pengecekan asal request (anti-CSRF) dilakukan sendiri di src/middleware.ts,
  // karena pengecekan bawaan Astro salah membaca protokol di belakang Nginx.
  security: { checkOrigin: false },
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TRUST_PROXY: envField.boolean({ context: 'server', access: 'secret', default: false }),
      UPLOAD_DIR: envField.string({ context: 'server', access: 'secret', default: './uploads' }),
      TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      FONNTE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: { plugins: [tailwindcss()] },
});
