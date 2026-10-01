import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { sep } from 'node:path';
import { test } from 'node:test';

// The core never pulls in the costume add-on, and nothing in src/ reaches into
// the demo (docs/costumes.md sections 2 and 8). An import across either line
// would ship code to people who never asked for it, and the core's size budget
// in the pack check would not notice.

const SRC = new URL('../src/', import.meta.url);
const SOURCES = (readdirSync(SRC, { recursive: true }) as string[])
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.split(sep).join('/'));

const importsOf = (file: string): string[] =>
  [...readFileSync(new URL(file, SRC), 'utf8').matchAll(/\b(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map(
    (match) => match[1] as string,
  );

test('the scan sees the imports it guards', () => {
  assert.ok(importsOf('index.ts').includes('./compose.ts'));
  assert.ok(importsOf('costumes/index.ts').includes('../compose.ts'));
});

test('core modules never import the costume add-on', () => {
  for (const file of SOURCES.filter((f) => !f.startsWith('costumes/'))) {
    for (const specifier of importsOf(file)) assert.ok(!specifier.includes('costumes'), `${file} imports ${specifier}`);
  }
});

test('nothing in src imports from the demo', () => {
  for (const file of SOURCES) {
    for (const specifier of importsOf(file)) assert.ok(!specifier.includes('demo/'), `${file} imports ${specifier}`);
  }
});
