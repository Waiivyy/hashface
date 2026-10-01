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
