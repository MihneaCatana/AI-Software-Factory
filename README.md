# Codex AI Software Factory

A **minimal, Codex-native software factory**: six specialist agents, three reusable skills, a functional React + Express + PostgreSQL starter, and local validation/release-gate scripts. No orchestration server, database for the factory, Redis, dashboard, or paid automation service is required.

## Requirements

- Node.js >=20 (for local scripts)
- Git and a recent Codex CLI/app with project-local agents / skills support
- Docker Compose (for the generated template's Postgres)
- npm for generated app dependencies

## Quick start

1. Open the **root of this repository** in Codex. Codex reads `AGENTS.md`; `.codex/config.toml` configures multi-agent concurrency, and `.codex/agents/*.toml` defines six roles.
2. Tell Codex to use the `build-application` skill. Example in `docs/EXAMPLE_PROMPT.md`.
3. Or bootstrap a project manually:

   ```sh
   node scripts/new-project.mjs --slug demo-crm --name "Demo CRM" --jurisdictions EU,RO --idea-file docs/sample-idea.txt
   ```

   The factory CLI copies a **starter project only**; it does not call any LLM. Codex must generate the application-specific requirements, architecture, features and reviews.
4. In `projects/demo-crm`, run:

   ```sh
   cp .env.example .env
   docker compose up -d db
   npm install
   npm run db:migrate
   npm run dev
   ```

   Then open `http://localhost:5173`. The app displays its API connection status. Port `3000` serves the API; PostgreSQL listens on `127.0.0.1:5432` in local development.
5. Verify the factory harness:

   ```sh
   npm run verify
   npm test
   ```

6. Once QA, security and compliance agents perform reviews, inspect `.factory/reports/*.json`. Run:

   ```sh
   node scripts/check-gates.mjs projects/demo-crm
   ```

   This intentionally **fails initially**. Review reports and a human approval are mandatory. See `docs/CONTRACTS.md`.

## Six Codex agents

| Role | Artifact | May change app code? |
|---|---|---|
| Product | `docs/product.md` | No |
| Architect | `docs/architecture.md`, `docs/tasks.md` | No |
| Developer | Source + tests | Yes |
| QA | `.factory/reports/qa.json` | No, reviewer only |
| Security | Threat model + `security.json` | No, reviewer only |
| Compliance / Legal | Design constraints + `compliance.json` | No, reviewer only |

**Codex subagents share the workspace by default.** Run only one writing agent at a time, or explicitly provide separate Git worktrees. Reviewer agents should provide independent findings; a prompt instructing them to stay read-only is not itself a filesystem permission boundary.

## MVP limitations

- The starter is a **functional local skeleton** (React UI, Express health routes, database migration), **not a completed CRM**. Application-specific CRUD, authentication and other requirements are implemented by Codex after you provide a prompt.
- No Codex invocation happens when `new-project` runs. This repository contains instructions/configuration rather than a standalone background agent runner.
- A local report validator cannot verify the truth of an LLM-generated report or certify compliance. Independent evidence and human scrutiny remain necessary.
- No auth credentials, hosting account, private repository, live payment integration or production deployment is provisioned automatically.
- For stronger isolation of arbitrary generated code, use separate VMs or hardened sandboxes; normal local workspaces are not a sufficient security boundary against intentionally hostile code.

## References

- Codex subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
- Codex skills: https://developers.openai.com/blog/skills-agents-sdk
- OWASP ASVS: https://asvs.owasp.org/
- EU legislation: https://eur-lex.europa.eu/
