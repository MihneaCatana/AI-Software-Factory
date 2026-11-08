import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { databaseUrl } from './config.js';

const pool = new Pool({ connectionString: databaseUrl(), max: 1 });
try {
  const source = path.resolve(process.cwd(), '../../database/migrations/0001_initial.sql');
  const sql = await readFile(source, 'utf8');
  await pool.query(sql);
  console.log('Initial migration applied.');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
