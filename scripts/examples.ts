/**
 * Writes every image the README shows into examples/, replacing what was
 * there. test/examples.test.ts fails when the committed files drift from the
 * current output. Run with: node scripts/examples.ts
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryFiles } from './gallery.ts';

const out = fileURLToPath(new URL('../examples/', import.meta.url));
const files = galleryFiles();

rmSync(out, { recursive: true, force: true });
for (const [path, svg] of files) {
  const file = join(out, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg);
}
console.log(`wrote ${files.size} files to examples/`);
