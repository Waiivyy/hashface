# Costume add-on design

Status: approved and implemented 2026-10-01; revised 2026-10-04, when costumes became
secrets summoned by name instead of a 1-in-25 roll. Builds on [design.md](design.md).

## 1. What it is

A costume party for hashface, in three parts:

- **`hashface/costumes`**, an opt-in entry point in the npm package. It works like
  the core library, plus 40 costumes: a pirate, a vampire, a pizza slice, a rubber
  duck and so on. A seed that spells a costume's name wears that costume, and a
  lock dresses up any other seed. Nothing is left to chance.
- **A secret in the demo.** Clicking the logo three times starts costume party
  mode, where typing a secret character's name summons it.
- **Four special guests in the demo only**: fan tributes to jacksepticeye,
  VanossGaming, Markiplier and Minecraft, used with permission and summoned the
  same way.

## 2. Goals and non-goals

Goals

- **Core untouched.** `hashface` keeps producing byte-identical avatars and stays
  about 5 KB gzipped. The costume code is never downloaded unless someone imports it.
- **Secret, not random.** Costumes are easter eggs to find, not a theme: only the
  40 names wear one by themselves, so no avatar changes by chance.
- **Still deterministic.** The same seed and options always give the same
  avatar, costume included.
- **Same look, same rules.** Costumes use the Bold blocks style and the zone
  contract from design.md section 5, so no costume can cover a face or break
  the layout.
- **Every costume is a family.** Locked on a seed, a costume pins its signature
  parts and the seed picks the rest, so every pirate is a different pirate.
  Summoned by its name, a costume is always worn by the mascot: the same picture
  every time. The golden mascot and the special guests are fully pinned on purpose.

Non-goals

- Date-based behavior. Seasonal costumes are available all year; nothing
  changes with the calendar.
- A theme mode where every avatar wears a costume.
- Shipping the special guests in the npm package.

## 3. API

```ts
import { generateAvatar, getTraits, traitNames, costumeParts } from 'hashface/costumes';

generateAvatar('ninja');                                     // the ninja, worn by the mascot
generateAvatar('alice');                                     // exactly the core avatar
generateAvatar('alice', { traits: { costume: 'pirate' } });  // alice dressed as a pirate
generateAvatar('ninja', { traits: { costume: 'none' } });    // the core avatar for "ninja"
getTraits('alice');                                          // { shape, eyes, mouth, accessory, palette, pattern, costume }
```

- `generateAvatar(seed, options?)` takes exactly the core options (`size`,
  `traits`, `title`) and throws the same errors. `traits` also accepts
  `costume`: a costume name or `'none'`.
- `getTraits(seed, locks?)` returns the six core traits plus `costume`, which is
  a costume name or `'none'`. The six core traits are the seed's (or the locked)
  values, even where a costume replaces their drawing; for a costume summoned by
  its name they are the mascot's, with the accessory `'none'`.
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

- A seed that spells a costume's name (section 4) wears it with no lock needed.
- Locking `costume` puts it on any seed, with the seed's own traits; `'none'`
  forces no costume, even on a costume's name.
- Other locks still apply, but a costume's signature parts always win. Locking
  googly eyes on a pirate still shows the eyepatch, and `getTraits` still reports
  `eyes: 'googly'`.
- An unknown costume name throws `RangeError` listing the valid names, exactly
  like the core's locks.

## 4. Selection

Nothing is left to chance, and no digest word is read: design.md section 6 keeps
words 6 and 7 reserved for future core categories.

1. **Lock.** A `costume` lock wins: a costume name dresses up the seed, with the
   seed's own traits, and `'none'` keeps the seed plain.
2. **Name.** Otherwise, a seed that spells a costume's name wears that costume.
   The seed is trimmed and lowercased, and runs of spaces, underscores and hyphens
   become one hyphen, so `" Rubber Duck "` is `rubber-duck`. The mascot (the seed
   `hashface`, as in the README) wears it with its accessory set to `'none'`;
   other locks still apply on top.
3. **Everyone else** wears no costume and renders byte for byte like the core.

## 5. The costume model

A costume is a record in `src/costumes/`:

| Field     | Replaces                         | Rules (zone contract, design.md section 5)                      |
| --------- | -------------------------------- | --------------------------------------------------------------- |
| `shape`   | the head silhouette              | one element; contains both face zones; top edge between y 12 and 18 |
| `skin`    | nothing; a new layer             | stays inside the head; drawn under the eyes and mouth           |
| `eyes`    | the eyes                         | inside the eyes zone                                             |
| `mouth`   | the mouth                        | inside the mouth zone                                            |
| `back`    | the accessory's back part        | stays on the canvas                                              |
| `front`   | the accessory's front part       | never touches a face zone; reaches down to y 19                 |
| `pattern` | the background pattern           | a single path                                                    |
| `colors`  | any of the five palette colors   | a partial palette, e.g. `{ body: '#F4F4F4' }` for the panda     |

Anything a costume leaves out comes from the seed. The tier is not a field: the
catalog lists the legendary names, since names and tiers are permanent selection data. A costume that replaces
`back` or `front` replaces the whole accessory. Colors in costume fragments come
from the palette after the costume's color overrides, plus ink and white.

"Skin" sits on the head, under the eyes and mouth. It holds face coverings: the
ninja's hood, the mummy's bandages, the panda's eye patches. When the shape
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
  white beard), `knight` (steel helmet with an eye slit, plume), `ninja` (dark
  hood, eyes peeking out), `viking` (horned helmet, braided ginger beard),
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
  `infinite-loop` (infinity-sign eyes, a spinning arrow)
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
  - the logo does a quick wiggle (skipped with reduced motion) and turns into the
    golden mascot while the party lasts
  - an announcement appears in a `role="status"` region: "Costume party! There are
    secret characters hiding in here. Try to find them."
  - the demo loads `../dist/costumes/index.js` and `tributes.js` with a dynamic
    `import()`, so the costume code is not part of the page's first download
- **While on:**
  - the preview and both downloads use the costume entry point, so typing a
    costume's name summons it, and the special guests answer to theirs
  - a secret character always looks the same, so while one shows, every trait
    chip reads "secret character" and rests
  - nothing on the page lists the characters: there is no costume chip and there
    are no costume samples
- **Off on reload.** Nothing is stored, so the secret stays a secret.

## 8. Special guests

- **Who:** `jacksepticeye` (his green eyeball character), `vanoss` (his owl mask:
  a brown head with dark ear tufts, pale rings around yellow eyes under angry
  brows, a dark beak, and a black shirt with yellow straps), `markiplier` (a man in
  a black shirt with his iconic hair and the pink mustache) and `minecraft` (a
  Creeper: the blocky green pixel face, black square eyes and its signature mouth,
  on a blocky neck).
- **Summoned:** only in costume mode, when the input matches a name, ignoring
  case and surrounding spaces. Outside costume mode the same names show their
  normal avatars.
- **Fully pinned:** every part of a special guest is fixed, so it always looks the
  same, true to its creator.
- **Demo only:** they live in `demo/tributes.js`, use the same costume model and
  composer, and are never imported by `src/`, so they are not in the npm package.
- **Credits:** `demo/CREDITS.md` states that they are fan tributes used with
  permission, belong to their creators (the Creeper and Minecraft to Mojang and
  Microsoft), and are not covered by the repository's MIT license. The demo's
  footer always shows one small line, "All rights to characters and assets go to
  their owners.", linking to it, and the README's License section points to it.
- **README:** does not name them. It carries one teaser line instead: "Rumor has
  it the demo's logo is hiding something."

## 9. Stability

- The core promise from design.md section 2 is unchanged.
- In the add-on, only the 40 names wear a costume by themselves, and the names
  never change.
- Adding a costume ships as a minor release: it only changes the avatar of its
  own name and that name's spelling variants. Changing an existing costume's
  drawing, or the name matching, ships as a major release.
- The special guests are demo content and can change at any time.

## 10. Package and size

- `package.json` exports `./costumes` (types and default) next to `.`.
- Layout: `src/costumes/index.ts` (entry point), `select.ts` (name matching and
  locks), `catalog.ts` (the 40 names), `types.ts` (the costume record) and one
  drawing file per group.
- Budgets in the pack check: the core stays within its 10 KB gzipped budget, and
  the add-on, measured with the core modules it imports, stays within 16 KB.

## 11. Testing

- **Core unchanged:** the existing golden snapshots still pass.
- **Names:** every costume's name summons it on the mascot; case, spaces and
  underscores match; near misses such as `ni` or `ninjas` don't; 20,000 other
  seeds wear nothing and match the core.
- **Locks:** forcing a costume, forcing `'none'`, signature parts beating other
  locks, inherited and invalid values rejected like the core.
- **Zone contract:** every field of every costume, in every palette after its
  color overrides, against the rules in section 5, including skin inside the head.
- **Golden snapshots:** every costume locked on a fixed seed, and every costume
  summoned by its name.
- **Package:** `hashface/costumes` works through `import`, `require` and the
  TypeScript types without DOM lib, within budget.
- **Demo, checked in a browser:** unlocking by clicks and by keyboard, summoning
  costumes and all four special guests by name, downloads, and the 375px layout.

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
| Names, not chance | The owner wanted secrets to find, not dice: a name always gives the same character. |
| No digest word | Selection reads the seed's text, so words 6 and 7 stay free for the core. |
| Signature parts win over locks | A pirate without an eyepatch is not a pirate. |
| A skin layer under the eyes and mouth | Face coverings without ever hiding a feature. |
| Adding costumes is a minor release | Only the new name's avatar changes. |
| Special guests are demo-only | Their permission covers this page, not reuse by everyone under MIT. |
| Nothing stored | The secret should stay a secret. |
