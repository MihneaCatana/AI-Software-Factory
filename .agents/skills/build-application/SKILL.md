---
name: build-application
description: Build a complete full-stack web app from a product idea using a Codex product, architecture, developer, QA, security and compliance workflow. Use for new app generation and subsequent feature revisions.
---

# Build application

1. Read root `AGENTS.md` and `docs/CONTRACTS.md`. Save idea in a UTF-8 file. Create a new project with `node scripts/new-project.mjs --slug <slug> --name "<name>" --jurisdictions EU,RO --idea-file <file>`.
2. Ask product to derive scoped user stories and acceptance criteria (`docs/product.md`). If data/jurisdiction/business model is unknown, mark the limitation rather than invent it.
3. Ask compliance for an *early* official-source jurisdiction assessment (`docs/compliance.md`) and architect for task sequencing. Ask security for a threat model before implementation.
4. Read `docs/tasks.md`. Execute one writing developer at a time, or separate mutually exclusive tasks with real Git worktrees. Do not assume subagents have isolated workspaces.
5. Review generated code with QA/security/compliance independently. Use the actual run logs, not a developer's status claim. If findings appear, assign bounded repair work to developer, then rescan and retest.
6. Keep `projects/<slug>/.factory/reports/{qa,security,compliance}.json` current according to `docs/CONTRACTS.md`. Run `npm run verify`, generated project's `npm run build`, test suite, and `node scripts/check-gates.mjs projects/<slug>` when dependencies are present.
7. Report delivered files, passed/failed/not-run checks, open questions, risk findings, manual approvals needed and precise local run commands. Do not deploy without explicit authorization.

Use `docs/EXAMPLE_PROMPT.md` for a starter request. Never declare a generated system production-ready solely because automated gates pass.
