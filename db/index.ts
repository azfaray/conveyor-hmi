// File: src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_POSTGRES_URL,
  // --- INI KUNCINYA ---
  ssl: {
    rejectUnauthorized: false // Memaksa Node.js menerima sertifikat apa aja
  }
});

export const db = drizzle(pool, { schema });