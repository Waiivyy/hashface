/**
 * Stacks the trait fragments into one SVG string, always in the same order:
 * background, pattern, accessory back, shadow, head, skin, eyes, mouth,
 * accessory front. The output is a single line with no ids, so any number of
 * avatars can be inlined on one page.
 */

import type { Traits } from './catalog.ts';
import { INK, PALETTES, type Palette } from './palettes.ts';
import { ACCESSORIES } from './traits/accessories.ts';
import { EYES } from './traits/eyes.ts';
import { MOUTHS } from './traits/mouths.ts';
import { PATTERNS } from './traits/patterns.ts';
import { SHAPES } from './traits/shapes.ts';
import type { AccessoryDraw, Draw, ShapeDraw } from './traits/types.ts';

export interface ComposeOptions {
  /** Width and height in px. The viewBox is always 0 0 64 64. */
  readonly size: number;
  /** Accessible title. An empty string means no title. */
  readonly title?: string | undefined;
}

/**
 * Internal: lets the costume add-on replace layers. Not public API. Without
 * overrides the output is exactly the core avatar (pinned by the golden tests).
 */
export interface LayerOverrides {
  readonly shape?: ShapeDraw | undefined;
  /** A layer of its own, between the head and the eyes. Empty without a costume. */
  readonly skin?: Draw | undefined;
  readonly eyes?: Draw | undefined;
  readonly mouth?: Draw | undefined;
  /** Replaces both the back and the front part of the accessory. */
  readonly accessory?: AccessoryDraw | undefined;
  readonly pattern?: Draw | undefined;
  readonly colors?: Partial<Palette> | undefined;
}

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  '\t': '&#9;',
  '\n': '&#10;',
  '\r': '&#13;',
};

// A valid surrogate pair matches first and is kept. A lone surrogate, or a
// character XML forbids, becomes U+FFFD. (No lookbehind: older Safari can't parse it.)
const XML_UNSAFE =
  /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[&<>"'\t\n\r]/g;

/** Escapes text for XML content, keeping the output well-formed and on one line. */
export const escapeXml = (text: string): string =>
  text.replace(XML_UNSAFE, (c) => (c.length === 2 ? c : (XML_ESCAPES[c] ?? '\uFFFD')));

export function composeSvg(traits: Traits, options: ComposeOptions, overrides: LayerOverrides = {}): string {
  const p: Palette = overrides.colors ? { ...PALETTES[traits.palette], ...overrides.colors } : PALETTES[traits.palette];
  const shape = overrides.shape ?? SHAPES[traits.shape];
  const accessory = overrides.accessory ?? ACCESSORIES[traits.accessory];
  const pattern = overrides.pattern ?? PATTERNS[traits.pattern];
  const eyes = overrides.eyes ?? EYES[traits.eyes];
  const mouth = overrides.mouth ?? MOUTHS[traits.mouth];
  const title = options.title ? `<title>${escapeXml(options.title)}</title>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${options.size}" height="${options.size}"` +
    ` stroke-linecap="round" stroke-linejoin="round"${title ? ' role="img"' : ''}>` +
    title +
    `<rect width="64" height="64" fill="${p.bg}"/>` +
    pattern(p) +
    (accessory.back?.(p) ?? '') +
    `<g transform="translate(3 3)">${shape(INK)}</g>` +
    shape(p.body) +
    (overrides.skin?.(p) ?? '') +
    eyes(p) +
    mouth(p) +
    (accessory.front?.(p) ?? '') +
    '</svg>'
  );
}
