# hashface design

Status: draft for review, 2026-10-01

## 1. What it is

hashface turns any string (a username, an email, a word) into an SVG avatar in one
deliberate art style called **Bold blocks**. The same string always produces the same
avatar, and different strings produce visibly different faces, not just different colors.

The category has strong prior art (DiceBear, Boring Avatars, Multiavatar, GitHub
identicons, Robohash). hashface does not compete on breadth. It does one style well and
stays tiny.

## 2. Goals and non-goals

Goals

- **Deterministic.** Within a major version, the same seed and options always produce
  a byte-identical SVG string, which renders pixel-identically in any given renderer.
  Golden-snapshot tests enforce this, and any change to existing output ships as a major
  release. Rendezvous selection (section 6) keeps such changes small when they happen.
- **Distinct.** Nearby strings such as `user1` and `user2` differ in shape and face,
  not only in color.
- **Clean composition.** Every possible combination of traits renders without
  overlaps or layering glitches.
- **Small.** Zero runtime dependencies, plain ES modules, works in browsers and Node
  without a bundler. A typical avatar is around 1 KB of SVG.
- **Safe to inline.** The output contains no ids, scripts, external references or seed
  text, so any number of avatars can be inlined on one page, and an email used as a seed
  never ends up in the markup.

Non-goals for v1

- More than one art style.
- PNG output from the library itself (a CLI can cover this later).
- Animation, user-supplied trait packs, or per-avatar style knobs such as stroke width.

## 3. Visual style: Bold blocks

- 64 by 64 canvas (`viewBox="0 0 64 64"`).
- Thick near-black outlines (`#111111`, 3 units wide), flat fills, no gradients.
- Every head casts a hard shadow: the same silhouette in ink, offset 3 units right and
  3 units down.
- Colors come from curated palettes. Ink and eye white are constant.
- Round line caps and joins everywhere, set once on the root element.

## 4. Traits

Each avatar picks one variant from each of six categories.

| Category  | v1 variants | Working names                                                       |
| --------- | ----------- | ------------------------------------------------------------------- |
| shape     | 8           | square, circle, hexagon, capsule, arch, octagon, drop, ghost         |
| eyes      | 8           | dots, googly, visor, crosses, happy, sleepy, wink, cyclops           |
| mouth     | 8           | smile, flat, open, zigzag, o, grin, smirk, tongue                    |
| accessory | 8           | none, antenna, party-hat, bow, headphones, crown, sprout, horns      |
| pattern   | 6           | none, dots, stripes, grid, waves, sun                                |
| palette   | 8           | lemon, sky, mint, coral, grape, bubblegum, tangerine, cream          |

That gives 196,608 combinations, 4,096 of which differ in structure (shape, eyes,
mouth, accessory). More variants can be added later without changing the architecture,
and without changing most existing avatars (see section 6).

Variant names are permanent identifiers: they feed into selection and are what users
pass to lock a trait. The names above may still be refined while the variants are drawn;
they are frozen at the first release.

### Trait definitions

A variant is a small function that takes the palette and returns an SVG fragment in
canvas coordinates. Accessories may return two fragments: `back`, drawn behind the head
(an antenna stick, a headphone band), and `front`, drawn over the face layer (a hat).

### Palettes

A palette assigns five color roles. Ink (`#111111`) and eye white (`#FFFFFF`) are shared
by all palettes.

| Role      | Used for                         |
| --------- | -------------------------------- |
| `bg`      | background                       |
| `pattern` | background pattern, a darker bg  |
| `body`    | head fill                        |
| `accent`  | accessories                      |
| `detail`  | small details: tongue, pom-poms  |

A palette *family* is a list of complete palettes that share a character. v1 ships one
family, `pop` (saturated and bright); the hash picks one palette from it. Starting
values, to be tuned while drawing:

| Palette   | bg      | pattern | body    | accent  | detail  |
| --------- | ------- | ------- | ------- | ------- | ------- |
| lemon     | #FFD23F | #EBB920 | #FF6B9A | #3BCEAC | #4EA8F0 |
| sky       | #62B0EC | #4A98D9 | #FF8C42 | #FFD23F | #FF6B9A |
| mint      | #7BDFB5 | #5FC89B | #A675E0 | #FFD23F | #FF6B9A |
| coral     | #FF6F59 | #EE5640 | #F4EFE3 | #62B0EC | #FFD23F |
| grape     | #A675E0 | #8F5BCC | #B8E34F | #FF6B9A | #FFD23F |
| bubblegum | #FF9EC4 | #F282AE | #FFD23F | #3BCEAC | #4EA8F0 |
| tangerine | #FF9F43 | #F08A2A | #4ECDC4 | #F4EFE3 | #FF6B9A |
| cream     | #F4EFE3 | #E2DAC8 | #FF6F59 | #4EA8F0 | #FFD23F |

Later families are opt-in through an option, so adding one never recolors existing
avatars.

## 5. Composition

Layers are drawn in a fixed order, back to front:

1. background (full-canvas rect in `bg`)
2. pattern
3. accessory, back part
4. shadow (head silhouette in ink, offset by 3, 3)
5. head (`body` fill, ink outline)
6. eyes
7. mouth
8. accessory, front part

### Zone contract

Two zones are reserved for the face (canvas units):

- **Eyes zone:** x 19 to 45, y 26 to 39
- **Mouth zone:** x 24 to 40, y 40 to 50

Rules every variant must follow:

1. Eye fragments stay inside the eyes zone. Mouth fragments stay inside the mouth zone.
2. Every shape contains both zones, with at least 1 unit between each zone and the inner
   edge of the shape's outline.
3. Accessory fragments never touch either zone.
4. Accessories that sit on top of the head reach down to at least y 19, so they rest on
   the head instead of floating above it (head tops range from y 12 to y 18).
5. Everything stays on the canvas, except that shapes may bleed off the bottom edge.

Because the zones are disjoint and the layer order is fixed, any combination composes
cleanly. A test checks every rule for every variant by parsing the fragments' geometry
(conservative bounding boxes for features, point sampling for shape containment). A new
variant that breaks the contract fails the test suite instead of producing a broken
avatar for some unlucky seed.

### No ids

Each background pattern is a single `<path>` (dots, for example, are a dashed stroke with
round caps). The output therefore needs no `<defs>`, `<pattern>`, `<clipPath>` or ids, and
avatars can never interfere with each other when inlined on the same page. Round or
circular avatars are made with CSS `border-radius`, for the same reason.

## 6. Hashing and selection

1. Encode the seed as UTF-8, exactly as given (no trimming, no lowercasing).
2. Hash the bytes with FNV-1a (32-bit).
3. Expand the hash into eight 32-bit words with a SplitMix32-style generator: a
   golden-ratio increment followed by the MurmurHash3 finalizer. FNV-1a alone mixes
   poorly; `user1` and `user3` differ in only a handful of output bits. The finalizer
   spreads any input change across every output bit.
4. Each category reads its own fixed word: shape 0, eyes 1, mouth 2, accessory 3,
   palette 4, pattern 5. Words 6 and 7 are reserved, so a future category never changes
   existing selections.
5. Within a category the variant is chosen by rendezvous (highest random weight)
   hashing: every variant gets the score `mix(word XOR hash(name))`, and the highest
   score wins. When variants are added later, only the avatars that the new variant
   wins change, about 1 in (n + 1), instead of nearly all of them as with `word % n`.
6. A locked trait skips selection for its own category only.

A 32-bit FNV collision makes two seeds share an avatar, but that is far rarer than two
seeds landing on the same combination out of 196,608, so the hash is not the limiting
factor.

## 7. Public API

```ts
generateAvatar(seed: string, options?: AvatarOptions): string

interface AvatarOptions {
  size?: number              // width and height in px; default 64. viewBox is always 0 0 64 64
  traits?: Partial<Traits>   // lock traits by name, e.g. { mouth: 'grin', palette: 'mint' }
  title?: string             // adds role="img" and an escaped <title> for accessibility
}

getTraits(seed: string, locked?: Partial<Traits>): Traits  // selection only, no rendering
traitNames                                                 // the catalog of variant names per category
toDataUri(svg: string): string                             // data URI for <img src>
renderToCanvas(canvas: HTMLCanvasElement, svg: string): Promise<void>  // browser-only helper
```

Errors

- A seed that is not a string throws `TypeError`. Convert numeric ids with `String(id)`.
- A `size` that is not a positive finite number throws `RangeError`.
- An unknown trait name throws `RangeError` listing the valid names.

The empty string is a valid seed. Callers who want `Alice` and `alice` to match should
normalize before calling.

Output is a single line. Wrapped here for reading:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"
     stroke-linecap="round" stroke-linejoin="round">
  <rect width="64" height="64" fill="#FFD23F"/>
  ...
</svg>
```

## 8. Package and tooling

- TypeScript compiled by `tsc` to ES modules plus `.d.ts` files in `dist/`. No bundler:
  browsers, Node and every bundler load ES modules directly, so a bundler would add a
  tool without adding anything.
- `package.json`: `"type": "module"`, an `exports` map, `"sideEffects": false`,
  `"files": ["dist"]`, and no `dependencies`.
- Dev dependencies: `typescript` and `@types/node` only. Tests use Node's built-in test
  runner, which runs the `.ts` test files directly. Development needs Node 22.18 or
  newer; consumers need any runtime with ES2020 and `TextEncoder`.
- GitHub Actions runs the type check and the tests on every push.

```
src/
  hash.ts          FNV-1a and digest expansion
  select.ts        word per category, rendezvous pick, trait locks
  palettes.ts      palette families
  traits/          one file per category: shapes, eyes, mouths, accessories, patterns
  compose.ts       layer order and SVG assembly
  index.ts         public API
test/              one test file per module, plus geometry helpers for the zone contract
demo/index.html    static demo page
examples/          saved SVGs used in the README
docs/design.md     this document
```

## 9. Testing

- **Hash:** standard FNV-1a test vectors; avalanche check (a one-character change flips
  about half of the digest bits on average).
- **Determinism:** repeated calls return identical strings. Golden snapshots pin the
  exact SVG for a fixed set of seeds (as SHA-256 digests, computed with `node:crypto` in
  tests only), so any accidental change to the output fails loudly, now or in a later
  version.
- **Distribution:** a chi-square test per category over 20,000 seeds, plus a
  contingency test showing that categories are independent of each other.
- **Distinctness:** over 10,000 neighboring seed pairs (`user-1` and `user-2`, and so
  on), at least 3.3 of the 4 structural traits differ on average, and pairs whose
  structure is identical (only colors or pattern differ) stay under 0.5%.
- **Stability:** simulating one added variant changes no more than about 1 in (n + 1)
  selections in that category.
- **Locks:** locking one category never changes the others.
- **Composition:** the zone contract in section 5, for every variant.
- **Output:** well-formed markup, no `undefined` or `NaN`, no ids, correct size
  attributes, escaped titles.

## 10. Demo page

A static `demo/index.html` with no framework that imports the built ES module:

- a text input with a live preview that updates on every keystroke
- a "Download SVG" button
- a grid of sample avatars from sample strings; clicking one loads it into the input

Browsers refuse to load ES modules from `file://`, so `npm run demo` starts a tiny
dependency-free static server. Publishing the demo on GitHub Pages is an optional extra.

## 11. Milestones

1. **Hash and trait selection, no visuals.** Project scaffolding and CI, `hash.ts`,
   `select.ts` with the variant name lists, and tests for determinism, distribution,
   independence, distinctness and stability.
2. **One complete trait set.** Draw every variant, the `pop` palettes and the patterns;
   compose to SVG; zone contract tests; golden snapshots.
3. **Package.** Public API, options and errors, build to `dist/`, types, README with
   example avatars, and an `npm pack` check that a fresh Node project can import the
   tarball.
4. **Demo page.**

Stretch, after the MVP

- More palette families, chosen with an option such as `family: 'pastel'`.
- Re-rolling a single trait in the demo ("new mouth").
- A CLI: `npx hashface alice -o alice.svg`, with PNG output through an optional
  rasterizer so the library itself stays dependency-free.

## 12. Decisions

| Decision | Why |
| --- | --- |
| Bold blocks style | Most legible at small sizes, composes cleanly, tiny output, and distinct from the styles existing libraries offer. |
| FNV-1a plus a finalizer | Tiny and fast; the finalizer fixes FNV's weak avalanche. |
| One digest word per category | Categories are independent, and new categories never disturb old ones. |
| Rendezvous selection | Adding variants later changes few existing avatars. |
| Lock traits by name | Locks keep working when variants are added or reordered. |
| No ids in the output | Safe to inline any number of avatars on one page. |
| Seed never embedded | Seeds are often emails; they should not leak into markup. |
| ES modules via `tsc`, no bundler | Nothing for a bundler to add; one less tool. |
| Node's built-in test runner | Runs TypeScript directly; no test framework dependency. |
