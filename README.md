# hashface

[![CI](https://github.com/Waiivyy/hashface/actions/workflows/ci.yml/badge.svg)](https://github.com/Waiivyy/hashface/actions/workflows/ci.yml)

Deterministic, dependency-free SVG avatars in a bold-blocks style. Same string in, same face out.

<p>
  <img src="examples/alice.svg" width="96" height="96" alt="Avatar for alice: a lime circle with a wink, a smirk and an antenna, on purple">
  <img src="examples/bob.svg" width="96" height="96" alt="Avatar for bob: a lime drop with horns, a wink and a round mouth, on purple">
  <img src="examples/carol.svg" width="96" height="96" alt="Avatar for carol: a pink one-eyed octagon with a crown and a smile, on yellow">
  <img src="examples/dave.svg" width="96" height="96" alt="Avatar for dave: a yellow square with googly eyes, an open mouth and a sprout, on pink">
  <img src="examples/eve.svg" width="96" height="96" alt="Avatar for eve: a coral octagon with googly eyes and an antenna, on cream">
  <img src="examples/mallory.svg" width="96" height="96" alt="Avatar for mallory: a teal capsule with googly eyes and headphones, on orange">
  <img src="examples/trent.svg" width="96" height="96" alt="Avatar for trent: a purple drop with sleepy eyes and a zigzag mouth, on mint">
  <img src="examples/peggy.svg" width="96" height="96" alt="Avatar for peggy: a coral one-eyed arch with horns and a zigzag mouth, on cream">
</p>

<sub>The avatars for <code>alice</code>, <code>bob</code>, <code>carol</code>, <code>dave</code>, <code>eve</code>, <code>mallory</code>, <code>trent</code> and <code>peggy</code>.</sub>

Give hashface any string (a username, an email, a word) and it draws a small character for it: thick black outlines, flat bold colors and a hard offset shadow. The same string always gets the same character. Nearby strings like `user1` and `user2` get different shapes and faces, not just different colors.

- **Deterministic.** The same input gives a byte-identical SVG, pinned by golden tests.
- **Tiny.** No dependencies, about 6 KB gzipped, about 1 KB of SVG per avatar.
- **Safe to inline.** No ids, scripts or external references, and the seed never appears in the output.
- **Runs anywhere.** Plain ES modules for browsers, Node and bundlers, with TypeScript types included.

## Install

```bash
npm install github:Waiivyy/hashface
```

hashface is not on the npm registry yet, so this installs it straight from GitHub.

## Usage

```js
import { generateAvatar } from 'hashface';

const svg = generateAvatar('alice@example.com');
// '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" ...>...</svg>'
```

### Options

| Option   | Type     | Default | Description                                                                         |
| -------- | -------- | ------- | ----------------------------------------------------------------------------------- |
| `size`   | `number` | `64`    | Width and height in pixels. The drawing scales; the viewBox is always `0 0 64 64`. |
| `traits` | `object` | none    | Traits to lock by name instead of deriving them from the seed, e.g. `{ mouth: 'grin' }`. |
| `title`  | `string` | none    | Accessible title. Adds `role="img"` and an escaped `<title>`.                       |

```js
generateAvatar('alice', { size: 128, title: 'Avatar for Alice' });
```

### Lock or re-roll a trait

`getTraits` tells you what an avatar is made of, and `traitNames` lists every variant. Together they let you keep an avatar and swap one part, for example behind a "new mouth" button:

```js
import { generateAvatar, getTraits, traitNames } from 'hashface';

const current = getTraits('alice'); // { shape: 'circle', eyes: 'wink', mouth: 'smirk', ... }
const mouths = traitNames.mouth;
const nextMouth = mouths[(mouths.indexOf(current.mouth) + 1) % mouths.length];

generateAvatar('alice', { traits: { mouth: nextMouth } });
```

Locking one trait never changes the others.

### In the browser

```js
import { generateAvatar, renderToCanvas, toDataUri } from 'hashface';

// As an image
img.src = toDataUri(generateAvatar('alice', { size: 96 }));

// Inline. Safe: the output has no scripts, no ids and no seed text.
container.innerHTML = generateAvatar('alice', { size: 96 });

// On a canvas, scaled to the canvas size
await renderToCanvas(canvas, generateAvatar('alice'));
```

For round avatars, add `border-radius: 50%` in CSS.

### In Node

```js
import { writeFileSync } from 'node:fs';
import { generateAvatar } from 'hashface';

writeFileSync('alice.svg', generateAvatar('alice', { size: 256 }));
```

CommonJS works too on Node versions that can `require` ES modules (20.19+ and 22.12+): `const { generateAvatar } = require('hashface')`.

## API

| Export                          | What it does                                                         |
| ------------------------------- | -------------------------------------------------------------------- |
| `generateAvatar(seed, options?)` | Returns the avatar as an SVG string.                                 |
| `getTraits(seed, locks?)`        | Returns the trait names the avatar is drawn from.                    |
| `traitNames`                     | Every variant name per category, frozen.                             |
| `toDataUri(svg)`                 | Wraps an SVG string in a `data:image/svg+xml` URI for `<img src>` or CSS. |
| `renderToCanvas(canvas, svg)`    | Draws an SVG string onto a canvas. Returns a promise. Browser only.   |

Mistakes fail loudly instead of drawing the wrong avatar:

- A seed that is not a string throws `TypeError`. Convert numeric ids with `String(id)`.
- A `size` that is not a positive finite number throws `RangeError`.
- An unknown trait name throws `RangeError` listing the valid names.

Seeds are hashed exactly as given. If `Alice` and `alice` should share an avatar, normalize before calling, for example with `seed.trim().toLowerCase()`.

## Traits

| Category  | Variants                                                         |
| --------- | ---------------------------------------------------------------- |
| shape     | square, circle, hexagon, capsule, arch, octagon, drop, ghost     |
| eyes      | dots, googly, visor, crosses, happy, sleepy, wink, cyclops       |
| mouth     | smile, flat, open, zigzag, o, grin, smirk, tongue                |
| accessory | none, antenna, party-hat, bow, headphones, crown, sprout, horns  |
| pattern   | none, dots, stripes, grid, waves, sun                            |
| palette   | lemon, sky, mint, coral, grape, bubblegum, tangerine, cream      |

That is 196,608 combinations, 4,096 of which differ in shape or face.

## How it works

1. The seed is encoded as UTF-8, hashed with FNV-1a, and expanded into eight 32-bit words by a SplitMix-style mixer, so every input bit affects every output bit.
2. Each trait category reads its own word, so categories are independent of each other.
3. Within a category, the variant is picked by rendezvous hashing: every variant name gets a score and the highest wins. Adding a variant later only changes the avatars the new variant wins.
4. The chosen traits are drawn into fixed layers: background, pattern, shadow, head, eyes, mouth, accessory. Each variant stays inside a reserved zone, and the tests check every one, so no combination overlaps.

The full design is in [docs/design.md](docs/design.md).

## Stability

Within a major version, the same seed and options always produce the same SVG. Golden-snapshot tests enforce this, and any change to existing avatars ships as a new major version.

## Development

```bash
npm install
npm test               # unit, zone, golden and API tests
npm run typecheck
npm run pack:check     # builds, packs and test-installs the package
node scripts/sheet.ts  # writes preview/sheet.html with every variant
```

Development needs Node 22.18 or newer, which runs the TypeScript sources and tests directly.

## License

[MIT](LICENSE)
