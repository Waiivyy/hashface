import type { Palette } from '../palettes.ts';

/** Draws an SVG fragment in canvas coordinates with the avatar's palette. */
export type Draw = (p: Palette) => string;

/** Draws a head silhouette as a single element with the given fill and an ink outline. */
export type ShapeDraw = (fill: string) => string;

/** Accessories may draw behind the head, over the face layer, or both. */
export interface AccessoryDraw {
  readonly back?: Draw;
  readonly front?: Draw;
}
