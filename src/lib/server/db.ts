import mysql from 'mysql2/promise';
import { DATABASE_URL } from 'astro:env/server';

let pool: mysql.Pool | null = null;

/** Koneksi database (dibuat sekali, dipakai ulang). Semua waktu disimpan dalam UTC. */
export function db(): mysql.Pool {
  if (pool) return pool;
  if (!DATABASE_URL) throw new Error('DATABASE_URL belum diisi di file .env');
  pool = mysql.createPool({
    uri: DATABASE_URL,
    connectionLimit: 10,
    timezone: 'Z',
    charset: 'utf8mb4',
    supportBigNumbers: true,
  });
  // Pastikan CURRENT_TIMESTAMP di database juga UTC, apa pun zona waktu server MySQL
  pool.on('connection', (conn) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return pool;
}

type Params = (string | number | boolean | null | Date)[] | Record<string, unknown>;

export async function query<T = any>(sql: string, params: Params = []): Promise<T[]> {
  const [rows] = await db().query(sql, params);
  return rows as T[];
}

export async function one<T = any>(sql: string, params: Params = []): Promise<T | undefined> {
  return (await query<T>(sql, params))[0];
}

export async function exec(sql: string, params: Params = []): Promise<mysql.ResultSetHeader> {
  const [res] = await db().execute(sql, params as any);
  return res as mysql.ResultSetHeader;
}

/** Kolom JSON dari MySQL bisa datang sebagai string (MariaDB) atau objek (MySQL 8). */
export function json<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}
