/**
 * The costume catalog. Names are permanent identifiers, like the core trait
 * names: they feed into selection and are what callers lock.
 */

export const COSTUME_NAMES = Object.freeze([
  'pirate', 'wizard', 'knight', 'ninja', 'viking', 'astronaut',
  'vampire', 'zombie', 'mummy', 'witch', 'skeleton', 'alien',
  'cat', 'frog', 'panda', 'fox', 'penguin', 'bunny',
  'pizza', 'donut', 'taco', 'avocado', 'cupcake',
  'pixel-hero', 'slime', 'mimic', 'final-boss', 'glitch',
  'rubber-duck', 'coffee-addict', 'merge-conflict', 'not-found', 'infinite-loop',
  'snowman', 'holiday-elf', 'birthday', 'valentine',
  'golden-mascot', 'cosmic', 'rainbow',
] as const);

export type CostumeName = (typeof COSTUME_NAMES)[number];
