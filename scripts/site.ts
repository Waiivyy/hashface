/**
 * Assembles the GitHub Pages site in _site/: the demo, the built package it
 * imports (same relative layout as the repo, so ../dist/index.js resolves),
 * and a root page that sends visitors to the demo.
 * Run after `npm run build`, or use `npm run site`.
 */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const site = new URL('_site/', root);

if (!existsSync(new URL('dist/index.js', root))) {
  console.error('dist/ is missing. Build it first with: npm run build');
  process.exit(1);
}

const REDIRECT = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>hashface</title>
<meta http-equiv="refresh" content="0; url=demo/">
<link rel="canonical" href="demo/">
<p><a href="demo/">Open the hashface demo</a></p>
</html>
`;

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(new URL('demo/', root), new URL('demo/', site), { recursive: true });
cpSync(new URL('dist/', root), new URL('dist/', site), { recursive: true, filter: (src) => !src.endsWith('.d.ts') });
writeFileSync(new URL('index.html', site), REDIRECT);
console.log('assembled _site/');
