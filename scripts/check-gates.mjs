#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sourceFingerprint, isIsoDate } from './lib.mjs';

const severities = ['critical', 'high', 'medium', 'low'];
const findingStatuses = ['open', 'resolved', 'accepted_risk'];

async function readJson(file, errors) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (e) { errors.push(`Cannot read ${path.basename(file)}: ${e.message}`); return null; }
}

export async function evaluateGates(projectDir) {
  const errors = [];
  const config = await readJson(path.join(projectDir, 'factory.project.json'), errors);
  const reportsDir = path.join(projectDir, '.factory', 'reports');
  const reports = {};
  for (const kind of ['qa', 'security', 'compliance']) {
    const r = await readJson(path.join(reportsDir, `${kind}.json`), errors);
    if (!r) continue;
    reports[kind] = r;
    if (r.kind !== kind) errors.push(`${kind}: unexpected report kind`);
    if (r.status !== 'pass') errors.push(`${kind}: status is ${r.status ?? 'missing'}, not pass`);
    if (!isIsoDate(r.updatedAt)) errors.push(`${kind}: updatedAt missing or invalid`);
    if (!Array.isArray(r.scope) || r.scope.length === 0 || r.scope.some(x => typeof x !== 'string' || !x.trim())) errors.push(`${kind}: review scope required`);
    if (!Array.isArray(r.checks) || !r.checks.some(c => c.status === 'pass' && typeof c.name === 'string' && typeof c.evidence === 'string' && c.evidence.trim())) errors.push(`${kind}: an evidenced passing check is required`);
    if (Array.isArray(r.checks) && r.checks.some(c => !['pass', 'fail', 'not_run'].includes(c.status))) errors.push(`${kind}: invalid check status`);
    if (Array.isArray(r.checks) && r.checks.some(c => c.status === 'fail')) errors.push(`${kind}: failing checks present`);
    if (!Array.isArray(r.findings)) errors.push(`${kind}: findings must be an array`);
    else for (const f of r.findings) {
      if (!severities.includes(f.severity) || !findingStatuses.includes(f.status) || !f.id || !f.summary || !f.evidence) errors.push(`${kind}: malformed finding ${f.id || '?'}`);
      if (['critical', 'high'].includes(f.severity) && f.status !== 'resolved') errors.push(`${kind}: unresolved ${f.severity} finding ${f.id}`);
    }
  }
  if (!config || !Array.isArray(config.jurisdictions) || !config.jurisdictions.length) errors.push('Project jurisdictions missing');
  const legal = reports.compliance;
  if (legal) {
    if (legal.humanReviewRequired !== false) errors.push('compliance: specialist/human review still required');
    for (const country of config?.jurisdictions ?? []) if (!legal.jurisdictions?.includes(country)) errors.push(`compliance: missing jurisdiction ${country}`);
    const validSource = s => typeof s.url === 'string' && /^https:\/\//.test(s.url) && typeof s.jurisdiction === 'string' && isIsoDate(s.accessedAt) && typeof s.relevance === 'string' && s.relevance.trim();
    if (!Array.isArray(legal.sources) || !legal.sources.some(validSource)) errors.push('compliance: cited sources with jurisdiction and access date required');
    for (const jurisdiction of config?.jurisdictions ?? []) {
      if (!Array.isArray(legal.sources) || !legal.sources.some(s => validSource(s) && s.jurisdiction === jurisdiction)) errors.push(`compliance: no cited source for jurisdiction ${jurisdiction}`);
    }
  }
  const approval = await readJson(path.join(projectDir, '.factory', 'approval.json'), errors);
  let fingerprint = null;
  try { fingerprint = await sourceFingerprint(projectDir); }
  catch (e) { errors.push(`Could not fingerprint source: ${e.message}`); }
  if (!approval?.approved) errors.push('Human release approval missing');
  else {
    if (typeof approval.approver !== 'string' || !approval.approver.trim() || !isIsoDate(approval.approvedAt)) errors.push('Approval metadata missing');
    if (!fingerprint || approval.fingerprint !== fingerprint) errors.push('Approval fingerprint does not match current source');
  }
  return { ok: errors.length === 0, errors, fingerprint };
}

async function main() {
  const target = process.argv[2];
  if (!target) throw new Error('Usage: node scripts/check-gates.mjs projects/<slug>');
  const result = await evaluateGates(path.resolve(target));
  if (result.ok) console.log('All required gates are satisfied for the current source fingerprint. Human release approval recorded. This is not a legal or security certification.');
  else { console.error(`Release BLOCKED (${result.errors.length} issue(s)):\n- ${result.errors.join('\n- ')}`); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(err => { console.error(err.message); process.exitCode = 2; });
}
