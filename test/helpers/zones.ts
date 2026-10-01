/**
 * The zone contract from docs/design.md section 5, in canvas units.
 * Every trait variant is checked against these in test/zones.test.ts.
 */

export interface Box {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export const CANVAS: Box = { x0: 0, y0: 0, x1: 64, y1: 64 };
export const EYES_ZONE: Box = { x0: 19, y0: 26, x1: 45, y1: 39 };
export const MOUTH_ZONE: Box = { x0: 24, y0: 40, x1: 40, y1: 50 };

/** Range of the top edge of every head shape, outline excluded. */
export const HEAD_TOP = { min: 12, max: 18 } as const;
/** Accessories must reach down to at least this y, so they rest on every head. */
export const CROWN_REACH_Y = 19;
/** Free space between each zone and the inner edge of a shape's outline. */
export const SHAPE_MARGIN = 1;
export const OUTLINE_WIDTH = 3;
export const SHADOW_OFFSET = 3;

export const within = (inner: Box, outer: Box): boolean =>
  inner.x0 >= outer.x0 && inner.y0 >= outer.y0 && inner.x1 <= outer.x1 && inner.y1 <= outer.y1;

/** True when the boxes overlap or share an edge. */
export const touches = (a: Box, b: Box): boolean => a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1;
