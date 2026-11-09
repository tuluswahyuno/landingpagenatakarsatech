#!/usr/bin/env bash
# Perbarui website di VPS setelah ada perubahan kode di GitHub.
# Pakai: bash deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
npm ci
npm run build
npm run db:setup          # aman diulang: hanya menambah tabel/konten yang belum ada
pm2 reload natakarsa-web
echo "Website diperbarui."
