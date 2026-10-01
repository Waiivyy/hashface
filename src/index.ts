/**
 * hashface: deterministic, dependency-free SVG avatars in a bold-blocks style.
 * The same seed and options always produce the same SVG.
 */

import { VARIANTS, type TraitLocks, type Traits } from './catalog.ts';
import { composeSvg } from './compose.ts';
import { describeValue } from './describe.ts';
import { normalizeOptions } from './options.ts';
import { selectTraits } from './select.ts';

export type { Category, TraitLocks, Traits } from './catalog.ts';

export interface AvatarOptions {
  /** Width and height in px. Defaults to 64. The viewBox is always 0 0 64 64. */
  readonly size?: number | undefined;
  /** Traits to pin by name instead of deriving them from the seed, e.g. `{ mouth: 'grin' }`. */
  readonly traits?: TraitLocks | undefined;
  /** Accessible title. Adds `role="img"` and a `<title>`; the seed itself never appears in the output. */
  readonly title?: string | undefined;
}

/**
 * Returns the avatar for `seed` as an SVG string. Seeds are hashed exactly as
 * given; normalize them first if `Alice` and `alice` should match.
 */
export function generateAvatar(seed: string, options: AvatarOptions = {}): string {
  const { size, title, traits } = normalizeOptions(options);
  return composeSvg(selectTraits(seed, traits as TraitLocks | undefined), { size, title });
}

/** Returns the trait names `generateAvatar` would draw for `seed`, honoring any locks. */
export function getTraits(seed: string, locks?: TraitLocks): Traits {
  return selectTraits(seed, locks);
}

/** Every variant name per category, in catalog order. Frozen. */
export const traitNames: typeof VARIANTS = VARIANTS;

// encodeURIComponent leaves these alone, but they would end an unquoted CSS url().
const URI_EXTRA = /[!'()*]/g;

/** Wraps an SVG string in a data URI, ready for `<img src>` or CSS `url()`, quoted or not. */
export function toDataUri(svg: string): string {
  if (typeof svg !== 'string') throw new TypeError(`svg must be a string, got ${describeValue(svg)}`);
  const encoded = encodeURIComponent(svg).replace(URI_EXTRA, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/** The parts of a 2d canvas context that renderToCanvas uses. */
export interface CanvasDrawTarget {
  clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(image: unknown, dx: number, dy: number, dw: number, dh: number): void;
}

/** Any canvas, such as an HTMLCanvasElement, described structurally so these types need no DOM lib. */
export interface CanvasTarget {
  readonly width: number;
  readonly height: number;
  getContext(contextId: '2d'): CanvasDrawTarget | null;
}

/** Draws an SVG string onto a canvas, scaled to the canvas size. Browser only. */
export async function renderToCanvas(canvas: CanvasTarget, svg: string): Promise<void> {
  if (typeof Image === 'undefined') throw new Error('renderToCanvas needs a browser with Image support');
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('2d canvas context unavailable');
  const image = new Image();
  image.src = toDataUri(svg);
  await image.decode();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}
