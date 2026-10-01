import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CostumeName } from '../src/costumes/catalog.ts';
import { COSTUMES } from '../src/costumes/costumes.ts';
import { costumeParts, type CostumePart } from '../src/costumes/index.ts';

// Each costume's signature parts (docs/costumes.md section 6): which core
// categories it replaces, and whether it draws a skin layer.

type Signature = readonly [readonly CostumePart[], boolean];

const check = (group: string, signatures: Partial<Record<CostumeName, Signature>>) => {
  test(`${group} costumes pin their signature parts`, () => {
    for (const [name, [parts, skin]] of Object.entries(signatures) as [CostumeName, Signature][]) {
      assert.deepEqual(costumeParts[name], parts, `${name} parts`);
      assert.equal(COSTUMES[name].skin !== undefined, skin, `${name} skin`);
    }
  });
};

check('classics', {
  pirate: [['eyes', 'accessory'], false],
  wizard: [['accessory'], true],
  knight: [['shape', 'accessory', 'palette'], true],
  ninja: [['shape', 'mouth', 'palette'], true],
  viking: [['accessory', 'palette'], true],
  astronaut: [['accessory'], false],
});

check('spooky', {
  vampire: [['shape', 'mouth', 'accessory', 'palette'], true],
  zombie: [['eyes', 'palette'], true],
  mummy: [['shape', 'palette'], true],
  witch: [['accessory'], false],
  skeleton: [['eyes', 'mouth', 'palette'], true],
  alien: [['eyes', 'accessory', 'palette'], false],
});

check('animals', {
  cat: [['accessory'], true],
  frog: [['shape', 'mouth', 'palette'], false],
  panda: [['eyes', 'accessory', 'palette'], true],
  fox: [['accessory', 'palette'], true],
  penguin: [['eyes', 'mouth', 'palette'], true],
  bunny: [['mouth', 'accessory'], false],
});

check('food', {
  pizza: [['shape', 'palette'], true],
  donut: [['shape', 'palette'], true],
  taco: [['shape', 'accessory', 'palette'], false],
  avocado: [['shape', 'palette'], true],
  cupcake: [['shape', 'accessory', 'palette'], true],
});

check('gamer', {
  'pixel-hero': [['shape', 'eyes', 'accessory'], true],
  slime: [['shape'], true],
  mimic: [['shape', 'mouth', 'palette'], true],
  'final-boss': [['accessory'], true],
  glitch: [['eyes'], true],
});

check('developer', {
  'rubber-duck': [['shape', 'mouth', 'accessory', 'palette'], false],
  'coffee-addict': [['eyes', 'accessory'], true],
  'merge-conflict': [['shape'], true],
  'not-found': [['eyes', 'mouth'], false],
  'infinite-loop': [['eyes'], true],
});
