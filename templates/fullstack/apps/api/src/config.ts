import dotenv from 'dotenv';
import path from 'node:path';

// npm workspaces executes scripts with apps/api as the working directory.
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required. Copy root .env.example to .env.');
  return url;
}
