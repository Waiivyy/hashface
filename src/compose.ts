/**
 * Stacks the trait fragments into one SVG string, always in the same order:
 * background, pattern, accessory back, shadow, head, eyes, mouth, accessory
 * front. The output is a single line with no ids, so any number of avatars
 * can be inlined on one page.
 */

import type { Traits } from './catalog.ts';
import { INK, PALETTES } from './palettes.ts';
import { ACCESSORIES } from './traits/accessories.ts';
import { EYES } from './traits/eyes.ts';
import { MOUTHS } from './traits/mouths.ts';
import { PATTERNS } from './traits/patterns.ts';
import { SHAPES } from './traits/shapes.ts';

export interface ComposeOptions {
  /** Width and height in px. The viewBox is always 0 0 64 64. */
  readonly size: number;
  /** Accessible title. An empty string means no title. */
  readonly title?: string | undefined;
}

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export const escapeXml = (text: string): string => text.replace(/[&<>"']/g, (c) => XML_ESCAPES[c] ?? c);

export function composeSvg(traits: Traits, options: ComposeOptions): string {
  const p = PALETTES[traits.palette];
  const shape = SHAPES[traits.shape];
  const accessory = ACCESSORIES[traits.accessory];
  const title = options.title ? `<title>${escapeXml(options.title)}</title>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${options.size}" height="${options.size}"` +
    ` stroke-linecap="round" stroke-linejoin="round"${title ? ' role="img"' : ''}>` +
    title +
    `<rect width="64" height="64" fill="${p.bg}"/>` +
    PATTERNS[traits.pattern](p) +
    (accessory.back?.(p) ?? '') +
    `<g transform="translate(3 3)">${shape(INK)}</g>` +
    shape(p.body) +
    EYES[traits.eyes](p) +
    MOUTHS[traits.mouth](p) +
    (accessory.front?.(p) ?? '') +
    '</svg>'
  );
}
