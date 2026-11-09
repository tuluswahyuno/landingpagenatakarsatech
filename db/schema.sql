-- Struktur database Natakarsa Tech (MySQL 8 / MariaDB 10.5+).
-- Dijalankan otomatis oleh `npm run db:setup`. Aman dijalankan berulang.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          ENUM('admin', 'sales') NOT NULL DEFAULT 'sales',
  active        TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id         CHAR(64) PRIMARY KEY,          -- SHA-256 dari token cookie (token asli tidak disimpan)
  user_id    INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip         VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  INDEX (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Konten situs per bagian: kontak, angka, harga, testimoni, faq
CREATE TABLE IF NOT EXISTS content (
  `key`      VARCHAR(50) PRIMARY KEY,
  data       JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  title       VARCHAR(150) NOT NULL,
  client      VARCHAR(150) NOT NULL DEFAULT '',
  industry    VARCHAR(80)  NOT NULL DEFAULT '',
  category    VARCHAR(30)  NOT NULL,
  year        SMALLINT     NOT NULL,
  summary     TEXT         NOT NULL,
  result      VARCHAR(150) NOT NULL DEFAULT '',
  tags        JSON NOT NULL,
  features    JSON NOT NULL,
  stack       JSON NOT NULL,
  metrics     JSON NOT NULL,
  images      JSON NOT NULL,
  mockup      VARCHAR(20)  NOT NULL DEFAULT 'dashboard',
  accent      VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  video       VARCHAR(500) NOT NULL DEFAULT '',
  demo_url    VARCHAR(500) NOT NULL DEFAULT '',
  testimonial JSON NULL,
  body        MEDIUMTEXT   NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 99,
  contoh      TINYINT(1)   NOT NULL DEFAULT 0,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status        ENUM('Baru', 'Dihubungi', 'Proposal', 'Deal', 'Batal') NOT NULL DEFAULT 'Baru',
  tipe          ENUM('Brief', 'Company profile') NOT NULL,
  nama          VARCHAR(100) NOT NULL,
  usaha         VARCHAR(120) NOT NULL DEFAULT '',
  wa            VARCHAR(20)  NOT NULL DEFAULT '',
  email         VARCHAR(120) NOT NULL DEFAULT '',
  bisnis        VARCHAR(80)  NOT NULL DEFAULT '',
  kebutuhan     TEXT NOT NULL,
  paket         VARCHAR(40)  NOT NULL DEFAULT '',
  fitur         VARCHAR(400) NOT NULL DEFAULT '',
  budget        VARCHAR(40)  NOT NULL DEFAULT '',
  utm_source    VARCHAR(100) NOT NULL DEFAULT '',
  utm_medium    VARCHAR(100) NOT NULL DEFAULT '',
  utm_campaign  VARCHAR(100) NOT NULL DEFAULT '',
  utm_content   VARCHAR(100) NOT NULL DEFAULT '',
  halaman       VARCHAR(200) NOT NULL DEFAULT '',
  ip            VARCHAR(45)  NULL,
  assigned_to   INT UNSIGNED NULL,
  reminded_3_at DATETIME NULL,
  reminded_7_at DATETIME NULL,
  INDEX (status),
  INDEX (created_at),
  CONSTRAINT fk_leads_user FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Riwayat lead: catatan tim + perubahan status
CREATE TABLE IF NOT EXISTS lead_notes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NULL,
  note       TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (lead_id),
  CONSTRAINT fk_notes_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Penanda kecil sistem, mis. tanggal terakhir pengingat follow-up dijalankan
CREATE TABLE IF NOT EXISTS kv (
  `key` VARCHAR(50) PRIMARY KEY,
  value VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
