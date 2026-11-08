#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { FACTORY_ROOT, TEMPLATE_ROOT } from './lib.mjs';

async function main() {
  const errors = [];
  const requireFile = async rel => {
    try { return await fs.readFile(path.join(FACTORY_ROOT, rel), 'utf8'); }
    catch { errors.push(`Missing ${rel}`); return ''; }
  };
  await requireFile('AGENTS.md');
  const config = await requireFile('.codex/config.toml');
  if (!config.includes('[agents]') || !config.includes('enabled = true')) errors.push('Codex agent delegation configuration missing');
  for (const role of ['product', 'architect', 'developer', 'qa', 'security', 'compliance']) {
    const value = await requireFile(`.codex/agents/${role}.toml`);
    for (const field of [`name = "${role}"`, 'description =', 'developer_instructions =']) if (!value.includes(field)) errors.push(`${role}: missing ${field}`);
  }
  for (const skill of ['build-application', 'security-audit', 'compliance-review']) {
    const value = await requireFile(`.agents/skills/${skill}/SKILL.md`);
    if (!value.startsWith('---\n') || !value.includes(`name: ${skill}`) || !value.includes('description:')) errors.push(`${skill}: invalid skill frontmatter`);
  }
  for (const rel of ['package.json', 'apps/api/package.json', 'apps/web/package.json', 'apps/api/src/index.ts', 'apps/web/src/App.tsx', 'database/migrations/0001_initial.sql', 'docker-compose.yml', '.env.example']) {
    try { await fs.access(path.join(TEMPLATE_ROOT, rel)); } catch { errors.push(`Starter template missing ${rel}`); }
  }
  if (errors.length) { console.error(`Factory verification failed:\n- ${errors.join('\n- ')}`); process.exitCode = 1; }
  else console.log('Factory structure verified: 6 Codex agents, 3 skills, starter files and configuration. (Not an agent execution test.)');
}
main().catch(e => { console.error(e); process.exitCode = 2; });
