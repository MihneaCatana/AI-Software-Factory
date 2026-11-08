# Generated Full-Stack Starter

Functional, small local-only React/Vite + Express/TypeScript + PostgreSQL baseline. It provides a browser UI and an API health check, plus a database connection check and a no-PII migration. Application-specific features and secure authentication are generated *after* project specification by the Codex factory.

## Run locally

Requires Node.js >=20, npm and Docker Compose.

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:5173 (API on http://localhost:3000). Vite proxies requests starting `/api` to the API. `GET /api/health` is public and checks API liveness. `GET /api/db-ready` returns 200 only when a database connection works. Do not put sensitive data in health responses.

Verify with `npm run typecheck`, `npm run build` and `npm test` after installation. For production, configure real authentication, least-privilege databases, HTTPS, secret management and approved deployment resources; the local-only Docker credentials must be replaced.
