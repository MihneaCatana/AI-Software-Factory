#!/usr/bin/env node
import path from 'node:path';
import { sourceFingerprint } from './lib.mjs';
const target = process.argv[2];
if (!target) { console.error('Usage: node scripts/fingerprint.mjs <project-directory>'); process.exit(2); }
sourceFingerprint(path.resolve(target))
  .then(hash => console.log(hash))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
