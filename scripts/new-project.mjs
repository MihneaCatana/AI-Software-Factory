#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, validSlug, PROJECTS_ROOT, TEMPLATE_ROOT } from './lib.mjs';

export async function createProject({ slug, name, jurisdictions, idea, outputRoot = PROJECTS_ROOT }) {
  if (!validSlug(slug)) throw new Error('Slug must be 3–40 lowercase characters, alphanumeric/hyphens, and begin/end alphanumeric.');
  if (typeof name !== 'string' || !name.trim() || name.length > 120) throw new Error('Name is required and limited to 120 characters.');
  if (typeof idea !== 'string' || !idea.trim() || idea.length > 30000) throw new Error('Idea must be 1–30000 characters.');
  if (!Array.isArray(jurisdictions) || !jurisdictions.length || jurisdictions.some(x => !/^[A-Z]{2,3}$/.test(x))) {
    throw new Error('Jurisdictions must contain country/region codes such as EU,RO.');
  }
  await fs.mkdir(outputRoot, { recursive: true });
  const safeRoot = await fs.realpath(outputRoot);
  const target = path.join(safeRoot, slug);
  try { await fs.lstat(target); throw new Error(`Project already exists: ${target}`); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.cp(TEMPLATE_ROOT, target, { recursive: true, force: false, errorOnExist: true });
  await fs.mkdir(path.join(target, '.factory', 'reports'), { recursive: true });
  await fs.mkdir(path.join(target, 'docs'), { recursive: true });
  const profile = {
    schemaVersion: 1, slug, name: name.trim(), idea: idea.trim(), jurisdictions,
    businessModel: 'unknown', intendedUsers: 'unknown', personalData: 'unknown',
    environment: 'local-preview', createdAt: new Date().toISOString(),
    openQuestions: ['Confirm business model, user categories, data categories and external integrations.']
  };
  const base = { status: 'pending', updatedAt: null, scope: [], checks: [], findings: [], sources: [] };
  const reports = {
    qa: { kind: 'qa', ...base },
    security: { kind: 'security', ...base },
    compliance: { kind: 'compliance', ...base, status: 'needs_review', jurisdictions, humanReviewRequired: true }
  };
  await Promise.all([
    fs.writeFile(path.join(target, 'factory.project.json'), JSON.stringify(profile, null, 2) + '\n'),
    fs.writeFile(path.join(target, '.factory', 'approval.json'), JSON.stringify({ approved: false, approver: null, approvedAt: null, fingerprint: null, note: 'Awaiting explicit human release approval.' }, null, 2) + '\n'),
    ...Object.entries(reports).map(([key, value]) => fs.writeFile(path.join(target, '.factory', 'reports', `${key}.json`), JSON.stringify(value, null, 2) + '\n')),
    fs.writeFile(path.join(target, 'docs', 'idea.md'), `# Original idea\n\n${idea.trim()}\n`),
    fs.writeFile(path.join(target, 'docs', 'product.md'), '# Product specification\n\nPending product agent analysis.\n'),
    fs.writeFile(path.join(target, 'docs', 'architecture.md'), '# Architecture\n\nPending architect agent design.\n'),
    fs.writeFile(path.join(target, 'docs', 'tasks.md'), '# Implementation tasks\n\nPending architect agent breakdown.\n'),
    fs.writeFile(path.join(target, 'docs', 'compliance.md'), '# Compliance assessment\n\nPending source-based, jurisdiction-aware review. Not legal advice.\n'),
    fs.writeFile(path.join(target, 'docs', 'threat-model.md'), '# Threat model\n\nPending security agent threat modeling.\n')
  ]);
  return target;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ['slug', 'name', 'jurisdictions', 'idea-file'];
  for (const key of required) if (!args[key]) throw new Error(`Missing --${key}`);
  const idea = await fs.readFile(path.resolve(args['idea-file']), 'utf8');
  const dest = await createProject({
    slug: args.slug, name: args.name,
    jurisdictions: [...new Set(args.jurisdictions.split(',').map(v => v.trim().toUpperCase()))],
    idea
  });
  console.log(`Created ${dest}\nNext: open the factory in Codex and use the build-application skill; this script does not generate features.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(err => { console.error(`Project creation failed: ${err.message}`); process.exitCode = 1; });
}
