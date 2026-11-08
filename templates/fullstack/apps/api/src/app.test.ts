import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

async function request(app: ReturnType<typeof createApp>, pathname: string) {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Could not allocate test port');
    const response = await fetch(`http://127.0.0.1:${address.port}${pathname}`);
    return { status: response.status, data: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test('health endpoint is alive and omits sensitive configuration', async () => {
  const result = await request(createApp(async () => true), '/api/health');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, { status: 'ok', service: 'generated-api' });
});

test('database readiness is unavailable on DB failure', async () => {
  const result = await request(createApp(async () => { throw new Error('private connection details'); }), '/api/db-ready');
  assert.equal(result.status, 503);
  assert.deepEqual(result.data, { status: 'unavailable' });
});
