import { Pool } from 'pg';
import { createApp } from './app.js';
import { databaseUrl } from './config.js';

const pool = new Pool({ connectionString: databaseUrl(), max: 5 });
const app = createApp(async () => {
  await pool.query('SELECT 1');
  return true;
});

const rawPort = Number(process.env.PORT ?? '3000');
if (!Number.isInteger(rawPort) || rawPort < 1 || rawPort > 65535) throw new Error('Invalid PORT');
const server = app.listen(rawPort, '127.0.0.1', () => {
  console.log(`API running on http://127.0.0.1:${rawPort}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => {
      pool.end().finally(() => { process.exitCode = 0; });
    });
  });
}
