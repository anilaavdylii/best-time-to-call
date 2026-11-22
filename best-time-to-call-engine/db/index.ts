import { Pool } from "pg";

// Next.js dev mode reloads files often. Keep one pool so it doesn't open a new one each time.
const g = globalThis as unknown as { pool?: Pool };

export const pool =
  g.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") g.pool = pool;
