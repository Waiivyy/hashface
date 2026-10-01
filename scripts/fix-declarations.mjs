/**
 * tsc rewrites relative `.ts` imports to `.js` in the JavaScript it emits, but
 * not in declaration files. TypeScript 4.x rejects `.ts` paths there, so this
 * post-build step applies the same rewrite to dist/**\/*.d.ts. It is plain
 * JavaScript because it runs in `prepare`, which git installs run too, on
 * whatever Node version the installer has.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const RELATIVE_TS = /((?:from|import)\s*\(?\s*['"])(\.{1,2}\/[^'"]*?)\.ts(['"])/g;

for (const file of readdirSync(dist, { recursive: true })) {
  if (!file.endsWith('.d.ts')) continue;
  const path = join(dist, file);
  const text = readFileSync(path, 'utf8');
  const fixed = text.replace(RELATIVE_TS, '$1$2.js$3');
  if (fixed !== text) writeFileSync(path, fixed);
}
