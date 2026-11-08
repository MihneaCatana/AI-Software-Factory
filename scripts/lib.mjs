import { createHash } from 'node:crypto';
import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FACTORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TEMPLATE_ROOT = path.join(FACTORY_ROOT, 'templates', 'fullstack');
export const PROJECTS_ROOT = path.join(FACTORY_ROOT, 'projects');

export function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/.test(slug) && !slug.includes('--');
}

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (!key || key in out) throw new Error(`Invalid or repeated option: ${arg}`);
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
    out[key] = argv[++i];
  }
  return out;
}

export async function sourceFingerprint(root) {
  const hash = createHash('sha256');
  const ignoredDirs = new Set(['.git', '.factory', 'node_modules', 'dist', 'coverage', '.cache', '.vite']);
  async function walk(dir, rel = '') {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) continue;
      const nextRel = path.posix.join(rel, entry.name);
      const nextPath = path.join(dir, entry.name);
      const stat = await lstat(nextPath);
      if (stat.isSymbolicLink()) throw new Error(`Symlink not supported in release fingerprint: ${nextRel}`);
      if (stat.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) await walk(nextPath, nextRel);
      } else if (stat.isFile()) {
        hash.update(`file:${nextRel}\0`);
        hash.update(await readFile(nextPath));
        hash.update('\0');
      }
    }
  }
  await walk(root);
  return hash.digest('hex');
}

export function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /\d{4}-\d{2}-\d{2}T/.test(value);
}
