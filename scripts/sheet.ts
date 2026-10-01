/**
 * Writes preview/sheet.html: every variant of every category over a fixed
 * base avatar, plus a grid of sample seeds at full and small size. A visual
 * check while drawing traits. Run with: node scripts/sheet.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { CATEGORIES, VARIANTS, type TraitLocks } from '../src/catalog.ts';
import { composeSvg } from '../src/compose.ts';
import { selectTraits } from '../src/select.ts';

const cell = (svg: string, label: string): string => `<figure>${svg}<figcaption>${label}</figcaption></figure>`;

const categoryRows = CATEGORIES.map((category) => {
  const names: readonly string[] = VARIANTS[category];
  const cells = names.map((name) => {
    const traits = selectTraits('sheet', { [category]: name } as TraitLocks);
    return cell(composeSvg(traits, { size: 96 }), name);
  });
  return `<h2>${category}</h2><div class="row">${cells.join('')}</div>`;
});

const seeds = Array.from({ length: 48 }, (_, i) => `sample-${i}`);
const samples = seeds.map((seed) => cell(composeSvg(selectTraits(seed), { size: 96 }), seed)).join('');
const smallSamples = seeds.map((seed) => composeSvg(selectTraits(seed), { size: 32 })).join('');

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>hashface sheet</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; background: #fafaf7; color: #111; }
  h2 { font-size: 15px; margin: 28px 0 8px; text-transform: lowercase; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; }
  .row.small { gap: 6px; }
  figure { margin: 0; text-align: center; }
  figcaption { font-size: 12px; color: #555; }
  svg { display: block; border-radius: 10px; }
  .small svg { border-radius: 6px; }
</style>
<h1>hashface contact sheet</h1>
${categoryRows.join('\n')}
<h2>samples</h2><div class="row">${samples}</div>
<h2>samples at 32px</h2><div class="row small">${smallSamples}</div>
</html>
`;

const out = new URL('../preview/', import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL('sheet.html', out), html);
console.log('wrote preview/sheet.html');
