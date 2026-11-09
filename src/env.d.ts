/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** User yang sedang login (hanya di halaman /admin) */
    user?: import('./lib/server/auth').User;
    /** Konten situs dari database (hanya di halaman publik) */
    content: import('./lib/server/content').SiteContent;
  }
}
