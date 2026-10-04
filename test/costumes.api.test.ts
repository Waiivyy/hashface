import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { composeSvg } from '../src/compose.ts';
import { COSTUME_NAMES } from '../src/costumes/catalog.ts';
import { COSTUMES, costumeOverrides } from '../src/costumes/costumes.ts';
import * as costumes from '../src/costumes/index.ts';
import { MASCOT_SEED, selectCostumeTraits } from '../src/costumes/select.ts';
import * as core from '../src/index.ts';

const PARTS = ['shape', 'eyes', 'mouth', 'accessory', 'pattern', 'palette'];

test('normal seeds match the core byte for byte', () => {
  for (let i = 0; i < 500; i++) {
    const seed = `plain-${i}`;
    assert.equal(costumes.generateAvatar(seed), core.generateAvatar(seed));
    assert.equal(costumes.generateAvatar(seed, { size: 128, title: 'Hi' }), core.generateAvatar(seed, { size: 128, title: 'Hi' }));
  }
});

test('a costume name renders the mascot in that costume, as in the README gallery', () => {
  for (const costume of COSTUME_NAMES) {
    const svg = costumes.generateAvatar(costume);
    assert.equal(svg, costumes.generateAvatar(MASCOT_SEED, { traits: { costume, accessory: 'none' } }), costume);
    assert.equal(svg, composeSvg(selectCostumeTraits(costume), { size: 64 }, costumeOverrides(COSTUMES[costume])), costume);
    assert.notEqual(svg, core.generateAvatar(costume), `${costume} wears its costume`);
  }
  assert.equal(costumes.generateAvatar('  Rubber Duck '), costumes.generateAvatar('rubber-duck'));
});

test('a costume renders through its overrides', () => {
  for (const costume of COSTUME_NAMES) {
    const traits = selectCostumeTraits('golden', { costume });
    assert.equal(
      costumes.generateAvatar('golden', { traits: { costume } }),
      composeSvg(traits, { size: 64 }, costumeOverrides(COSTUMES[costume])),
      costume,
    );
  }
});

test('signature parts win over other locks', () => {
  const locked = selectCostumeTraits('alice', { costume: 'pirate', eyes: 'googly' });
  assert.equal(
    costumes.generateAvatar('alice', { traits: { costume: 'pirate', eyes: 'googly' } }),
    composeSvg(locked, { size: 64 }, costumeOverrides(COSTUMES.pirate)),
  );
  assert.equal(costumes.getTraits('alice', { costume: 'pirate', eyes: 'googly' }).eyes, 'googly');
});

test('options are validated like the core', () => {
  for (const options of [{ size: '64' }, { size: 0 }, { title: 5 }, null, 'big']) {
    const failure = (fn: () => string) => {
      try {
        fn();
      } catch (error) {
        return `${(error as Error).name}: ${(error as Error).message}`;
      }
      return 'no error';
    };
    assert.equal(
      failure(() => costumes.generateAvatar('a', options as never)),
      failure(() => core.generateAvatar('a', options as never)),
      JSON.stringify(options),
    );
  }
});

test('traitNames and costumeParts are frozen and complete', () => {
  const { costume, ...coreNames } = costumes.traitNames;
  assert.deepEqual(coreNames, { ...VARIANTS });
  assert.deepEqual(costume, ['none', ...COSTUME_NAMES]);
  assert.ok(Object.isFrozen(costumes.traitNames) && Object.isFrozen(costume));
  assert.deepEqual(Object.keys(costumes.costumeParts), [...COSTUME_NAMES]);
  assert.ok(Object.isFrozen(costumes.costumeParts));
  for (const name of COSTUME_NAMES) {
    const parts = costumes.costumeParts[name];
    assert.ok(Object.isFrozen(parts), name);
    assert.deepEqual([...parts], PARTS.filter((p) => parts.includes(p as never)), `${name} parts are in canonical order`);
  }
});

test('getTraits includes the costume', () => {
  assert.deepEqual(Object.keys(costumes.getTraits('zombie')), ['shape', 'eyes', 'mouth', 'accessory', 'palette', 'pattern', 'costume']);
  assert.equal(costumes.getTraits('zombie').costume, 'zombie');
  assert.equal(costumes.getTraits('alice').costume, 'none');
  assert.equal(costumes.getTraits('alice', { costume: 'mummy' }).costume, 'mummy');
});

test('the canvas and data uri helpers are the core ones', () => {
  assert.equal(costumes.toDataUri, core.toDataUri);
  assert.equal(costumes.renderToCanvas, core.renderToCanvas);
});
