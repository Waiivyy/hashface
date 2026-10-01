/**
 * The trait catalog: every category and the names of its variants.
 *
 * Names are permanent identifiers. They feed into selection (see select.ts)
 * and are what callers pass to lock a trait, so renaming one changes avatars
 * and breaks locks. Add new variants instead.
 */

export const CATEGORIES = Object.freeze(['shape', 'eyes', 'mouth', 'accessory', 'palette', 'pattern'] as const);

export type Category = (typeof CATEGORIES)[number];

export const VARIANTS = Object.freeze({
  shape: Object.freeze(['square', 'circle', 'hexagon', 'capsule', 'arch', 'octagon', 'drop', 'ghost'] as const),
  eyes: Object.freeze(['dots', 'googly', 'visor', 'crosses', 'happy', 'sleepy', 'wink', 'cyclops'] as const),
  mouth: Object.freeze(['smile', 'flat', 'open', 'zigzag', 'o', 'grin', 'smirk', 'tongue'] as const),
  accessory: Object.freeze(['none', 'antenna', 'party-hat', 'bow', 'headphones', 'crown', 'sprout', 'horns'] as const),
  palette: Object.freeze(['lemon', 'sky', 'mint', 'coral', 'grape', 'bubblegum', 'tangerine', 'cream'] as const),
  pattern: Object.freeze(['none', 'dots', 'stripes', 'grid', 'waves', 'sun'] as const),
});

/** One variant name per category: everything needed to draw an avatar. */
export type Traits = { [C in Category]: (typeof VARIANTS)[C][number] };

/** Traits to pin instead of deriving them from the seed. `undefined` means "not locked". */
export type TraitLocks = { [C in Category]?: Traits[C] | undefined };

export type ShapeName = Traits['shape'];
export type EyesName = Traits['eyes'];
export type MouthName = Traits['mouth'];
export type AccessoryName = Traits['accessory'];
export type PaletteName = Traits['palette'];
export type PatternName = Traits['pattern'];
