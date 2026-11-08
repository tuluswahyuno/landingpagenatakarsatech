---
title: Kasir & Stok Toko Bangunan
client: Toko bahan bangunan, 3 cabang
industry: Retail
category: retail
year: 2025
summary: Kasir cepat dengan stok yang berkurang otomatis di 3 cabang dan laporan laba harian.
result: Rekap stok dari 3 hari jadi real-time
tags: [Kasir, Multi-cabang, Laporan laba]
features:
  - Kasir dengan barcode dan cetak struk thermal
  - Stok otomatis berkurang per cabang
  - Transfer stok antar cabang
  - Laporan laba harian dan barang terlaris
  - Peringatan stok menipis via WhatsApp
stack: [Laravel, MySQL, Alpine.js]
metrics:
  - { value: "3 hari → 0", label: "waktu rekap stok" }
  - { value: "-92%", label: "selisih stok" }
  - { value: "3", label: "cabang terhubung" }
mockup: kasir
accent: "#f59e0b"
order: 1
contoh: true
---

## Masalah

Stok dicatat di buku dan Excel terpisah per cabang. Setiap akhir bulan pemilik butuh 3 hari untuk rekap, dan selisih stok sering tidak ketahuan penyebabnya.

## Solusi

Satu sistem kasir berbasis web yang dipakai di ketiga cabang. Setiap transaksi langsung mengurangi stok cabang terkait, dan pemilik bisa memantau omzet serta stok dari HP.

## Hasil

Rekap stok kini real-time, selisih stok turun drastis, dan pemilik bisa memutuskan restock berdasarkan data barang terlaris.
