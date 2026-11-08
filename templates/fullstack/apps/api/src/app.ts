import express from 'express';
import type { Request, Response } from 'express';

// Dependency injection keeps the API testable without a running database.
export function createApp(checkDatabase: () => Promise<boolean>) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'generated-api' });
  });

  app.get('/api/db-ready', async (_req: Request, res: Response) => {
    try {
      const connected = await checkDatabase();
      res.status(connected ? 200 : 503).json({ status: connected ? 'ready' : 'unavailable' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
