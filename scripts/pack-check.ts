/**
 * Builds and packs hashface the way npm would publish it, then checks the
 * tarball from a consumer's point of view: the right files, ESM import,
 * CommonJS require, TypeScript types without DOM lib, and bundle size, for
 * both entry points: hashface and hashface/costumes.
 * Run with: npm run pack:check
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tsc = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const CORE_BUDGET = 10 * 1024;
const COSTUMES_BUDGET = 16 * 1024;

const failures: string[] = [];
const check = (ok: boolean, message: string): void => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (!ok) failures.push(message);
};

const run = (command: string, args: string[], cwd: string): string =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const attempt = (label: string, fn: () => void): void => {
  try {
    fn();
  } catch (error) {
    const err = error as { stderr?: string; stdout?: string; message: string };
    check(false, `${label}: ${(err.stderr || err.stdout || err.message).trim()}`);
  }
};

const temp = mkdtempSync(join(tmpdir(), 'hashface-pack-'));
try {
  run(npm, ['run', 'build'], root);

  // 1. The tarball holds the build and the docs, and nothing else.
  const [packed] = JSON.parse(run(npm, ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], root)) as {
    filename: string;
    files: { path: string }[];
  }[];
  if (!packed) throw new Error('npm pack produced no tarball');
  const paths = packed.files.map((f) => f.path);
  for (const required of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/costumes/index.js',
    'dist/costumes/index.d.ts',
    'LICENSE',
    'README.md',
    'package.json',
  ]) {
    check(paths.includes(required), `tarball contains ${required}`);
  }
  const forbidden = ['src/', 'test/', 'scripts/', 'demo/', 'docs/', 'examples/', 'preview/', '.github/'];
  const stray = paths.filter((p) => forbidden.some((prefix) => p.startsWith(prefix)));
  check(stray.length === 0, `tarball has no source, tests or tooling${stray.length ? `: ${stray.join(', ')}` : ''}`);

  // 2. A fresh project can install it, then import and require it.
  const consumer = join(temp, 'consumer');
  run('node', ['-e', `require('node:fs').mkdirSync(${JSON.stringify(consumer)})`], temp);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  run(npm, ['install', join(temp, packed.filename), '--no-audit', '--no-fund'], consumer);

  let esm = '';
  attempt('ESM import', () => {
    esm = run('node', ['--input-type=module', '-e', "import { generateAvatar } from 'hashface'; process.stdout.write(generateAvatar('alice'));"], consumer);
    check(esm.startsWith('<svg'), 'ESM import renders an avatar');
  });
  attempt('CommonJS require', () => {
    const cjs = run('node', ['-e', "const { generateAvatar } = require('hashface'); process.stdout.write(generateAvatar('alice'));"], consumer);
    check(cjs === esm && cjs.startsWith('<svg'), 'CommonJS require renders the same avatar');
  });

  let pirate = '';
  attempt('costumes ESM import', () => {
    const out = run(
      'node',
      [
        '--input-type=module',
        '-e',
        "import { generateAvatar } from 'hashface/costumes'; process.stdout.write(generateAvatar('alice') + '\\n' + generateAvatar('alice', { traits: { costume: 'pirate' } }));",
      ],
      consumer,
    );
    const [plain = '', dressed = ''] = out.split('\n');
    pirate = dressed;
    check(plain === esm, 'hashface/costumes renders a seed without a costume exactly like hashface');
    check(pirate.startsWith('<svg') && pirate !== esm, 'hashface/costumes renders a locked costume');
  });
  attempt('costumes CommonJS require', () => {
    const cjs = run(
      'node',
      ['-e', "const { generateAvatar } = require('hashface/costumes'); process.stdout.write(generateAvatar('alice', { traits: { costume: 'pirate' } }));"],
      consumer,
    );
    check(cjs === pirate && cjs.startsWith('<svg'), 'CommonJS require of hashface/costumes renders the same costume');
  });

  // 3. The published types compile in a project without DOM lib or skipLibCheck.
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2022',
        lib: ['ES2022'],
        types: [],
        strict: true,
        skipLibCheck: false,
        noEmit: true,
      },
      files: ['check.ts'],
    }),
  );
  writeFileSync(
    join(consumer, 'check.ts'),
    [
      "import { generateAvatar, getTraits, renderToCanvas, toDataUri, traitNames } from 'hashface';",
      "import type { AvatarOptions, CanvasDrawTarget, CanvasTarget, Category, TraitLocks, Traits } from 'hashface';",
      "const options: AvatarOptions = { size: 128, traits: { mouth: 'grin' }, title: 'Alice' };",
      "const svg: string = generateAvatar('alice', options);",
      "const traits: Traits = getTraits('alice');",
      'const locks: TraitLocks = { eyes: traits.eyes };',
      "const category: Category = 'shape';",
      'const names: readonly string[] = traitNames[category];',
      'const uri: string = toDataUri(svg);',
      'const context: CanvasDrawTarget = { clearRect() {}, drawImage() {} };',
      'const canvas: CanvasTarget = { width: 64, height: 64, getContext: () => context };',
      'const done: Promise<void> = renderToCanvas(canvas, svg);',
      '// @ts-expect-error unknown trait names are rejected at compile time',
      "generateAvatar('alice', { traits: { mouth: 'Grin' } });",
      'void [locks, names, uri, done];',
      "import { costumeParts, generateAvatar as dressUp, getTraits as costumeTraits, renderToCanvas as drawCostume, toDataUri as costumeUri, traitNames as costumeNames } from 'hashface/costumes';",
      "import type { CanvasDrawTarget as CostumeDrawTarget, CanvasTarget as CostumeCanvas, Category as CostumeCategory, CostumeAvatarOptions, CostumeLocks, CostumeName, CostumePart, CostumeTraits } from 'hashface/costumes';",
      "const party: CostumeAvatarOptions = { size: 96, traits: { costume: 'pirate', eyes: 'googly' }, title: 'Alice' };",
      "const pirate: string = dressUp('alice', party);",
      "const worn: CostumeTraits = costumeTraits('alice');",
      'const wish: CostumeLocks = { costume: worn.costume, mouth: worn.mouth };',
      "const costume: CostumeName = 'wizard';",
      'const parts: readonly CostumePart[] = costumeParts[costume];',
      'const costumes: readonly string[] = costumeNames.costume;',
      "const costumeCategory: CostumeCategory = 'eyes';",
      'const drawTarget: CostumeDrawTarget = context;',
      'const costumeCanvas: CostumeCanvas = canvas;',
      'const pirateUri: string = costumeUri(pirate);',
      'const drawn: Promise<void> = drawCostume(costumeCanvas, pirate);',
      '// @ts-expect-error unknown costume names are rejected at compile time',
      "dressUp('alice', { traits: { costume: 'Pirate' } });",
      'void [wish, parts, costumes, costumeCategory, drawTarget, pirateUri, drawn];',
      '',
    ].join('\n'),
  );
  attempt('TypeScript consumer', () => {
    run(tsc, ['-p', consumer], consumer);
    check(true, 'types compile without DOM lib and with skipLibCheck off');
  });

  const distDir = join(consumer, 'node_modules', 'hashface', 'dist');

  // TypeScript 4.x rejects relative imports ending in .ts inside declaration files.
  const declarations = (readdirSync(distDir, { recursive: true }) as string[]).filter((f) => f.endsWith('.d.ts'));
  const tsSpecifiers = declarations.filter((f) => /['"]\.{1,2}\/[^'"]*\.ts['"]/.test(readFileSync(join(distDir, f), 'utf8')));
  check(tsSpecifiers.length === 0, `declaration files import .js paths only${tsSpecifiers.length ? `: ${tsSpecifiers.join(', ')}` : ''}`);

  // 4. Size: everything a bundler could pull in, gzipped together. The core
  //    never imports the add-on, so its budget leaves dist/costumes/ out.
  const jsFiles = (readdirSync(distDir, { recursive: true }) as string[]).filter((f) => f.endsWith('.js'));
  const coreFiles = jsFiles.filter((f) => f.split(/[\\/]/)[0] !== 'costumes');
  const gzipped = (files: string[]): number => gzipSync(Buffer.concat(files.map((f) => readFileSync(join(distDir, f))))).length;
  const core = gzipped(coreFiles);
  const all = gzipped(jsFiles);
  console.log(`size: core ${coreFiles.length} files, ${core} bytes gzipped; with costumes ${jsFiles.length} files, ${all} bytes gzipped`);
  check(coreFiles.length < jsFiles.length, 'the build has costume files to leave out of the core budget');
  check(core <= CORE_BUDGET, `core gzipped size ${core} bytes is within ${CORE_BUDGET}`);
  check(all <= COSTUMES_BUDGET, `core plus costumes gzipped size ${all} bytes is within ${COSTUMES_BUDGET}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\npack check failed: ${failures.length} problem(s)`);
  process.exit(1);
}
console.log('\npack check passed');
