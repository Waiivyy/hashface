/**
 * Writes the README gallery: examples/<seed>.svg at 96px for a fixed set of
 * seeds. test/examples.test.ts fails when these drift from the current output.
 * Run with: node scripts/examples.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { generateAvatar } from '../src/index.ts';

const SEEDS = ['alice', 'bob', 'carol', 'dave', 'eve', 'mallory', 'trent', 'peggy'];

const out = new URL('../examples/', import.meta.url);
mkdirSync(out, { recursive: true });
for (const seed of SEEDS) writeFileSync(new URL(`${seed}.svg`, out), generateAvatar(seed, { size: 96 }));
console.log(`wrote ${SEEDS.length} examples to examples/`);
