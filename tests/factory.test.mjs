import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createProject } from '../scripts/new-project.mjs';
import { evaluateGates } from '../scripts/check-gates.mjs';
import { sourceFingerprint, validSlug } from '../scripts/lib.mjs';

async function withProject(fn) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'factory-tests-'));
  try {
    const project = await createProject({
      slug: 'sample-app', name: 'Sample App', jurisdictions: ['EU', 'RO'],
      idea: 'A small CRM handling business contacts.', outputRoot: base
    });
    await fn(project);
  } finally { await fs.rm(base, { recursive: true, force: true }); }
}

test('slug rules reject traversal and other unsafe paths', () => {
  for (const slug of ['../escape', 'a/b', '..', 'A-B', 'abc--def', '.hidden', 'a']) assert.equal(validSlug(slug), false);
  assert.equal(validSlug('crm-app-1'), true);
});

test('bootstrap copies starter and starts with blocked release', async () => {
  await withProject(async project => {
    const profile = JSON.parse(await fs.readFile(path.join(project, 'factory.project.json'), 'utf8'));
    assert.deepEqual(profile.jurisdictions, ['EU', 'RO']);
    assert.match(await fs.readFile(path.join(project, 'apps/web/src/App.tsx'), 'utf8'), /API/);
    const result = await evaluateGates(project);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('Human release approval missing')));
    assert.ok(result.errors.some(e => e.includes('compliance: status')));
  });
});

test('bootstrap refuses to overwrite an existing project', async () => {
  await withProject(async project => {
    await assert.rejects(() => createProject({
      slug: 'sample-app', name: 'Other', jurisdictions: ['EU'],
      idea: 'Overwrite attempt', outputRoot: path.dirname(project)
    }), /already exists/);
  });
});

test('evidence and explicit bound human approval are required, source edits invalidate approval', async () => {
  await withProject(async project => {
    const dir = path.join(project, '.factory');
    const now = new Date().toISOString();
    for (const kind of ['qa', 'security', 'compliance']) {
      const report = {
        kind, status: 'pass', updatedAt: now,
        scope: ['Local starter runtime health endpoint and basic source review'],
        checks: [{ name: 'Observed smoke test', status: 'pass', evidence: 'GET /api/health returned 200 in a local run' }],
        findings: [], sources: []
      };
      if (kind === 'compliance') {
        report.jurisdictions = ['EU', 'RO']; report.humanReviewRequired = false;
        report.sources = [
          { url: 'https://eur-lex.europa.eu/', jurisdiction: 'EU', accessedAt: now, relevance: 'Illustrative citation' },
          { url: 'https://www.dataprotection.ro/', jurisdiction: 'RO', accessedAt: now, relevance: 'Illustrative citation' }
        ];
      }
      await fs.writeFile(path.join(dir, 'reports', `${kind}.json`), JSON.stringify(report));
    }
    const first = await evaluateGates(project);
    assert.equal(first.ok, false);
    assert.ok(first.errors.some(e => e.includes('Human release approval missing')));

    const fingerprint = await sourceFingerprint(project);
    await fs.writeFile(path.join(dir, 'approval.json'), JSON.stringify({ approved: true, approver: 'Manual Test Reviewer', approvedAt: now, fingerprint, note: 'Test-only approval, never a real release' }));
    assert.equal((await evaluateGates(project)).ok, true);

    await fs.appendFile(path.join(project, 'README.md'), '\nNew source change\n');
    assert.ok((await evaluateGates(project)).errors.some(e => e.includes('fingerprint')));
  });
});

test('high severity unresolved security issue blocks release', async () => {
  await withProject(async project => {
    const p = path.join(project, '.factory', 'reports', 'security.json');
    const report = { kind:'security', status:'pass', updatedAt:new Date().toISOString(), scope:['API'], checks:[{name:'Scan',status:'pass',evidence:'Run output'}], findings:[{id:'SEC-1',severity:'high',status:'open',summary:'Authorization missing',evidence:'src/file.ts',remediation:'Add permission checks'}] };
    await fs.writeFile(p, JSON.stringify(report));
    assert.ok((await evaluateGates(project)).errors.some(e => e.includes('unresolved high finding SEC-1')));
  });
});
