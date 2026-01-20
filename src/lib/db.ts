import { Pool } from 'pg';

let pool: Pool;

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// In development, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
// In production, a new pool will be created for each serverless function invocation.
// @ts-ignore
if (!global.pgPool) {
  // @ts-ignore
  global.pgPool = new Pool(dbConfig);
}
// @ts-ignore
pool = global.pgPool;

export default pool;
