# Costume add-on design

Status: draft for review, 2026-10-01. Builds on [design.md](design.md).

## 1. What it is

A costume party for hashface, in three parts:

- **`hashface/costumes`**, an opt-in entry point in the npm package. It works like
  the core library, except that about 1 in 25 avatars wear one of 40 costumes:
  a pirate, a vampire, a pizza slice, a rubber duck and so on.
- **A secret in the demo.** Clicking the logo three times starts costume party
  mode.
- **Four special guests in the demo only**: fan tributes to jacksepticeye,
  VanossGaming, Markiplier and Minecraft, used with permission and summoned by
  typing their names while costume mode is on.

## 2. Goals and non-goals

Goals

- **Core untouched.** `hashface` keeps producing byte-identical avatars and stays
  about 5 KB gzipped. The costume code is never downloaded unless someone imports it.
- **Rare and surprising.** Costumes are easter eggs, not a theme: 4% of seeds
  wear one.
- **Still deterministic.** The same seed and options always give the same
  avatar, costume included.
- **Same look, same rules.** Costumes use the Bold blocks style and the zone
  contract from design.md section 5, so no costume can cover a face or break
  the layout.
- **Every costume is a family.** A costume pins its signature parts and the seed
  picks the rest, so every pirate is a different pirate. The exceptions are the
  golden mascot and the special guests, which are fully pinned on purpose.

Non-goals

- Date-based behavior. Seasonal costumes are available all year; nothing
  changes with the calendar.
- A theme mode where every avatar wears a costume.
- Shipping the special guests in the npm package.

## 3. API

```ts
import { generateAvatar, getTraits, traitNames, costumeParts } from 'hashface/costumes';

generateAvatar('alice');                                     // 1 in 25 seeds wear a costume
generateAvatar('alice', { traits: { costume: 'pirate' } });  // always a pirate
generateAvatar('alice', { traits: { costume: 'none' } });    // never a costume
getTraits('alice');                                          // { shape, eyes, mouth, accessory, palette, pattern, costume }
```

- `generateAvatar(seed, options?)` takes exactly the core options (`size`,
  `traits`, `title`) and throws the same errors. `traits` also accepts
  `costume`: a costume name or `'none'`.
- `getTraits(seed, locks?)` returns the six core traits plus `costume`, which is
  a costume name or `'none'`. The six core traits are always the seed's (or the
  locked) values, even where a costume replaces their drawing.
- `traitNames` is the core catalog plus `costume`: `'none'` followed by the 40
  costume names. Frozen, like the core.
- `costumeParts[name]` lists which core categories a costume replaces, for
  example `['eyes', 'accessory']` for the pirate. UIs can use it to show which
  traits a costume overrides. The mapping from the record fields in section 5:
  `shape`, `eyes`, `mouth` and `pattern` map to themselves, `back` and `front`
  map to `accessory`, `colors` maps to `palette`, and `skin` maps to nothing.
- `toDataUri` and `renderToCanvas` are re-exported from the core, so one import
  covers everything.

Locks and costumes

- Locking `costume` forces it, whatever the seed rolls; `'none'` forces no
  costume.
- Other locks still apply, but a costume's signature parts always win. Locking
  googly eyes on a pirate still shows the eyepatch, and `getTraits` still reports
  `eyes: 'googly'`.
- An unknown costume name throws `RangeError` listing the valid names, exactly
  like the core's locks.

## 4. Selection

All of it reads digest word 6, which design.md section 6 reserved. Word 7 stays
reserved for a future core category. The core's six words are not touched.

1. **Roll.** A seed wears a costume when `word6 < 171798692`, which is
   2<sup>32</sup> / 25 rounded, so exactly 4.00% of words.
2. **Tier.** `tierWord = mix32(word6 ^ 0x6a09e667)`. A wearer gets a legendary
   costume when `tierWord < 85899346` (2<sup>32</sup> / 50), so 1 in 50 wearers and
   about 1 in 1,250 avatars overall.
3. **Pick.** `pickWord = mix32(word6 ^ 0xbb67ae85)`, then the core's rendezvous
   pick (`pickVariant`) over the names in that tier.

The two constants are the first two SHA-256 initial hash values: arbitrary,
fixed, and documented in the code. Steps 2 and 3 run only for wearers, and a
locked costume skips all three.

## 5. The costume model

A costume is a record in `src/costumes/`:

| Field     | Replaces                         | Rules (zone contract, design.md section 5)                      |
| --------- | -------------------------------- | --------------------------------------------------------------- |
| `tier`    |                                  | `'regular'` or `'legendary'`                                     |
| `shape`   | the head silhouette              | one element; contains both face zones; top edge between y 12 and 18 |
| `skin`    | nothing; a new layer             | stays inside the head; drawn under the eyes and mouth           |
| `eyes`    | the eyes                         | inside the eyes zone                                             |
| `mouth`   | the mouth                        | inside the mouth zone                                            |
| `back`    | the accessory's back part        | stays on the canvas                                              |
| `front`   | the accessory's front part       | never touches a face zone; reaches down to y 19                 |
| `pattern` | the background pattern           | a single path                                                    |
| `colors`  | any of the five palette colors   | a partial palette, e.g. `{ body: '#F4F4F4' }` for the panda     |

Anything a costume leaves out comes from the seed. A costume that replaces
`back` or `front` replaces the whole accessory. Colors in costume fragments come
from the palette after the costume's color overrides, plus ink and white.

"Skin" sits on the head, under the eyes and mouth. It holds face coverings: the
ninja's mask band, the mummy's bandages, the panda's eye patches. When the shape
is not pinned, skin must stay inside every head shape. A head-wide covering such
as the mummy's bandages pins its shape.

Layer order, back to front: background, pattern, back, shadow, head, skin, eyes,
mouth, front. Without a costume the skin layer is empty and the output equals the
core's, byte for byte.

The core composer gains an internal override hook for these fields. It is not
public API, and the core's golden snapshots prove its output does not change.

## 6. The 40 costumes

Signature parts in parentheses; the seed picks everything else. Names freeze at
the add-on's first release.

- **Classics:** `pirate` (eyepatch, bandana), `wizard` (starry pointy hat, big
  white beard), `knight` (steel helmet with an eye slit, plume), `ninja` (mask
  band, eyes peeking out), `viking` (horned helmet, braided ginger beard),
  `astronaut` (glass helmet rim with a glare)
- **Spooky:** `vampire` (fangs, widow's peak, high cape collar, pale skin),
  `zombie` (green skin, stitches, mismatched eyes), `mummy` (bandage wraps),
  `witch` (crooked hat with a buckle), `skeleton` (bone-white skull, nose hole,
  stitched teeth), `alien` (green skin, huge black almond eyes, antennae)
- **Animals:** `cat` (pointed ears, whiskers, nose), `frog` (green head with eye
  bumps, wide grin), `panda` (white head, black ears and eye patches), `fox`
  (orange head, white muzzle, pointed ears), `penguin` (dark head, white face,
  orange beak), `bunny` (tall ears, buck teeth, whiskers)
- **Food:** `pizza` (slice-shaped head, crust, pepperoni), `donut` (pink frosting
  with drips, sprinkles), `taco` (shell-shaped head, lettuce fringe), `avocado`
  (green egg shape, pit belly), `cupcake` (frosting dome, striped wrapper, cherry)
- **Gamer tropes:** `pixel-hero` (square head, pixel hair and eyes, sword behind
  the head), `slime` (drippy blob with a shine), `mimic` (treasure chest head with
  jagged teeth), `final-boss` (spiked crown, scar, angry brows), `glitch` (shifted
  color bars, mismatched eyes)
- **Developer jokes:** `rubber-duck` (yellow head, orange beak, hair tuft),
  `coffee-addict` (spiral eyes with bags, steaming mug), `merge-conflict` (two
  halves in different colors), `not-found` (eyes drawn as 4 and 4, mouth as 0),
  `infinite-loop` (spiral eyes)
- **Seasonal:** `snowman` (white round head, carrot nose, coal mouth, top hat),
  `holiday-elf` (green pointy hat with a bell, pointed ears), `birthday` (cake hat
  with a lit candle, blushing cheeks), `valentine` (heart eyes, blush)
- **Legendary:** `golden-mascot` (the crowned, grinning mascot in solid gold, fully
  pinned), `cosmic` (night-sky head with stars and starry eyes), `rainbow`
  (rainbow-striped head)

Drawings may shift during the visual review, as long as every costume keeps its
signature parts and passes the zone tests.

## 7. The demo secret

- **Unlock.** The logo becomes a `<button>` that looks the same. Three
  activations within 1,000 ms of the first (clicks, or Enter presses) toggle
  costume party mode; three more turn it off.
- **On unlock:**
  - the logo does a quick wiggle (skipped with reduced motion)
  - an announcement appears in a `role="status"` region: "Costume party! About 1
    in 25 faces now wear a costume. Psst: some names bring a special guest."
  - the demo loads `../dist/costumes/index.js` with a dynamic `import()`, so the
    costume code is not part of the page's first download
- **While on:**
  - the preview, the samples and both downloads use the costume entry point
  - six sample seeds known to roll costumes join the grid
  - a costume chip joins the trait chips and cycles through `none` and the 40
    costumes
  - chips for categories the current costume replaces (from `costumeParts`) show
    "from costume" instead of the trait value; clicking one still swaps the
    underlying trait, which shows again once the costume is gone
- **Off on reload.** Nothing is stored, so the secret stays a secret.

## 8. Special guests

- **Who:** `jacksepticeye` (his green eyeball character), `vanoss` (his owl
  character: ear tufts, big round eyes, a beak, in his brand colors), `markiplier`
  (a man in a black shirt with his iconic hair and the pink mustache) and
  `minecraft` (a Creeper: the blocky green pixel face, black square eyes and its
  signature mouth).
- **Summoned:** only in costume mode, when the input matches a name, ignoring
  case and surrounding spaces. They never appear in random rolls or in the
  costume chip.
- **Fully pinned:** every part of a special guest is fixed, so it always looks the
  same, true to its creator.
- **Demo only:** they live in `demo/tributes.js`, use the same costume model and
  composer, and are never imported by `src/`, so they are not in the npm package.
- **Credits:** `demo/CREDITS.md` states that they are fan tributes used with
  permission, belong to their creators (the Creeper and Minecraft to Mojang and
  Microsoft), and are not covered by the repository's MIT license. The README's
  License section points to it.
- **README:** does not name them. It carries one teaser line instead: "Rumor has
  it the demo's logo is hiding something."

## 9. Stability

- The core promise from design.md section 2 is unchanged.
- In the add-on, whether a seed wears a costume never changes.
- Adding costumes to the add-on ships as a minor release. Only the wearers the
  new costume wins switch costumes: with 37 regular costumes, adding a 38th
  moves about 1 in 38 regular wearers. Changing an existing costume's drawing,
  or the roll itself, ships as a major release.
- The special guests are demo content and can change at any time.

## 10. Package and size

- `package.json` exports `./costumes` (types and default) next to `.`.
- Layout: `src/costumes/index.ts` (entry point), `select.ts` (roll, tier, pick,
  locks), `catalog.ts` (the 40 names with tier and group), `types.ts` (the costume
  record) and one drawing file per group.
- Budgets in the pack check: the core stays within its 10 KB gzipped budget, and
  the add-on, measured with the core modules it imports, stays within 16 KB.

## 11. Testing

- **Core unchanged:** the existing golden snapshots still pass.
- **Roll:** over 20,000 seeds, 4% ± 0.5 percentage points wear a costume. Over
  2,000,000 sampled words, legendaries are 2% ± 0.5 percentage points of wearers.
  Costumes are evenly spread within each tier (chi-square), and the roll is
  independent of the six core traits. Simulating a 38th regular costume moves
  only the wearers it wins, about 1 in 38 of them.
- **Locks:** forcing a costume, forcing `'none'`, signature parts beating other
  locks, inherited and invalid values rejected like the core.
- **Zone contract:** every field of every costume, in every palette after its
  color overrides, against the rules in section 5, including skin inside the head.
- **Golden snapshots:** every costume locked on a fixed seed, plus seeds that roll
  a costume naturally.
- **Package:** `hashface/costumes` works through `import`, `require` and the
  TypeScript types without DOM lib, within budget.
- **Demo, checked in a browser:** unlocking by clicks and by keyboard, the
  costume chip, all four special guests, downloads, and the 375px layout.

## 12. Milestones

Each milestone ends with a check-in with the owner.

1. **Selection and the composer hook**, no drawings yet: the roll, tier, pick and
   locks, with their tests, and placeholder costumes.
2. **The 40 costumes**, drawn in batches and reviewed on the contact sheet, then
   pinned with golden snapshots.
3. **The package:** the `hashface/costumes` export, the pack check, the README
   section with a generated costume gallery and the teaser.
4. **The demo:** the secret unlock, the costume chip, the four special guests and
   the credits note.

## 13. Decisions

| Decision | Why |
| --- | --- |
| Separate entry point | The core stays untouched and small; costume code is only downloaded on purpose. |
| Always rare (4%) | Costumes are easter eggs, not a theme. |
| Digest word 6 only | Word 7 stays free for the core, and core avatars never move. |
| Signature parts win over locks | A pirate without an eyepatch is not a pirate. |
| A skin layer under the eyes and mouth | Face coverings without ever hiding a feature. |
| Adding costumes is a minor release | Whether a seed wears one never changes, and rendezvous keeps the switches rare. |
| Special guests are demo-only | Their permission covers this page, not reuse by everyone under MIT. |
| Nothing stored | The secret should stay a secret. |
