---
title: Sales Order Distributor
client: Distributor FMCG
industry: Distribusi
category: retail
year: 2025
summary: Sales lapangan input pesanan dari HP, gudang dan admin langsung menerima notifikasi.
result: Pesanan terlewat turun ke nol
tags: [Sales order, Aplikasi mobile, Gudang]
features:
  - Aplikasi sales dengan katalog dan harga per toko
  - Pesanan langsung masuk ke gudang
  - Rute kunjungan dan check-in lokasi
  - Piutang per toko
  - Notifikasi WhatsApp ke admin
stack: [Flutter, Node.js, PostgreSQL]
metrics:
  - { value: "0", label: "pesanan terlewat" }
  - { value: "2x", label: "kunjungan per hari" }
  - { value: "25", label: "sales aktif" }
mockup: mobile
accent: "#ef4444"
order: 5
contoh: true
---

## Masalah

Pesanan dikirim sales lewat chat dan foto nota, sering terlewat atau salah input oleh admin gudang.

## Solusi

Aplikasi Android untuk sales yang terhubung ke sistem gudang. Setiap pesanan punya status dari dibuat sampai terkirim.

## Hasil

Tidak ada lagi pesanan yang hilang, dan manajer bisa memantau performa setiap sales secara harian.
