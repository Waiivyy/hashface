/**
 * Just enough SVG geometry to check trait fragments against the zone
 * contract. Fragments are flat lists of self-closing elements with absolute
 * path commands, so a small parser covers them; anything else is rejected.
 */

import type { Box } from './zones.ts';

export interface SvgElement {
  tag: string;
  attrs: Record<string, string>;
}

type Point = readonly [number, number];

const TAGS = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path']);
const TAG_PATTERN = /<([a-zA-Z]+)((?:\s+[a-zA-Z][a-zA-Z0-9:-]*="[^"]*")*)\s*\/>/g;
const ATTR_PATTERN = /([a-zA-Z][a-zA-Z0-9:-]*)="([^"]*)"/g;
const CURVE_STEPS = 32;

export function parseFragment(svg: string): SvgElement[] {
  if (/<g[\s>/]/.test(svg)) throw new Error(`groups are not allowed in fragments: ${svg}`);
  if (/\stransform=/.test(svg)) throw new Error(`transforms are not allowed in fragments: ${svg}`);
  if (svg.includes('</')) throw new Error(`fragments use self-closing elements only: ${svg}`);
  const elements: SvgElement[] = [];
  const leftover = svg.replace(TAG_PATTERN, (_, tag: string, rawAttrs: string) => {
    if (!TAGS.has(tag)) throw new Error(`unsupported element <${tag}>`);
    const attrs: Record<string, string> = {};
    for (const [, name, value] of rawAttrs.matchAll(ATTR_PATTERN)) attrs[name as string] = value as string;
    if (tag === 'path' && !/^[MLHVCQZ0-9 .,-]*$/.test(attrs.d ?? '')) {
      throw new Error(`path data must use absolute M L H V C Q Z commands: ${attrs.d}`);
    }
    elements.push({ tag, attrs });
    return '';
  });
  if (leftover.trim() !== '') throw new Error(`unexpected content in fragment: ${leftover.trim()}`);
  return elements;
}

const num = (el: SvgElement, name: string): number => {
  const value = Number(el.attrs[name] ?? 0);
  if (!Number.isFinite(value)) throw new Error(`<${el.tag}> has a non-numeric ${name}`);
  return value;
};

const numbers = (text: string): number[] => (text.match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []).map(Number);

const pointList = (el: SvgElement): Point[] => {
  const values = numbers(el.attrs.points ?? '');
  const points: Point[] = [];
  for (let i = 0; i + 1 < values.length; i += 2) points.push([values[i] as number, values[i + 1] as number]);
  return points;
};

/** Control points (for bounds) and flattened rings (for containment) of a path. */
function parsePath(d: string): { controls: Point[]; rings: Point[][] } {
  const tokens = d.match(/[MLHVCQZ]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  const controls: Point[] = [];
  const rings: Point[][] = [];
  let ring: Point[] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let command = '';
  let i = 0;
  const next = (): number => {
    const token = tokens[i++];
    if (token === undefined || /[A-Z]/.test(token)) throw new Error(`malformed path data: ${d}`);
    return Number(token);
  };
  const lineTo = (x: number, y: number) => {
    ring.push([x, y]);
    controls.push([x, y]);
    cx = x;
    cy = y;
  };
  while (i < tokens.length) {
    const token = tokens[i] as string;
    if (/[A-Z]/.test(token)) {
      command = token;
      i++;
      if (command === 'Z') {
        ring.push([sx, sy]);
        cx = sx;
        cy = sy;
      }
      continue;
    }
    switch (command) {
      case 'M': {
        if (ring.length > 1) rings.push(ring);
        const x = next();
        const y = next();
        ring = [];
        sx = x;
        sy = y;
        lineTo(x, y);
        command = 'L'; // further pairs are implicit line-tos
        break;
      }
      case 'L':
        lineTo(next(), next());
        break;
      case 'H':
        lineTo(next(), cy);
        break;
      case 'V':
        lineTo(cx, next());
        break;
      case 'C': {
        const [x0, y0] = [cx, cy];
        const [x1, y1, x2, y2, x, y] = [next(), next(), next(), next(), next(), next()];
        controls.push([x1, y1], [x2, y2]);
        for (let s = 1; s < CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          ring.push([
            u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
            u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
          ]);
        }
        lineTo(x, y);
        break;
      }
      case 'Q': {
        const [x0, y0] = [cx, cy];
        const [x1, y1, x, y] = [next(), next(), next(), next()];
        controls.push([x1, y1]);
        for (let s = 1; s < CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          ring.push([u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y]);
        }
        lineTo(x, y);
        break;
      }
      default:
        throw new Error(`malformed path data: ${d}`);
    }
  }
  if (ring.length > 1) rings.push(ring);
  return { controls, rings };
}

const boundsOf = (points: readonly Point[]): Box => {
  if (points.length === 0) throw new Error('cannot bound an empty element');
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
};

/** Conservative bounding box. Path bounds include curve control points. */
export function elementBounds(el: SvgElement, opts: { stroke: boolean }): Box {
  let box: Box;
  switch (el.tag) {
    case 'rect': {
      const x = num(el, 'x');
      const y = num(el, 'y');
      box = { x0: x, y0: y, x1: x + num(el, 'width'), y1: y + num(el, 'height') };
      break;
    }
    case 'circle': {
      const r = num(el, 'r');
      box = { x0: num(el, 'cx') - r, y0: num(el, 'cy') - r, x1: num(el, 'cx') + r, y1: num(el, 'cy') + r };
      break;
    }
    case 'ellipse': {
      const rx = num(el, 'rx');
      const ry = num(el, 'ry');
      box = { x0: num(el, 'cx') - rx, y0: num(el, 'cy') - ry, x1: num(el, 'cx') + rx, y1: num(el, 'cy') + ry };
      break;
    }
    case 'line':
      box = boundsOf([
        [num(el, 'x1'), num(el, 'y1')],
        [num(el, 'x2'), num(el, 'y2')],
      ]);
      break;
    case 'polyline':
    case 'polygon':
      box = boundsOf(pointList(el));
      break;
    case 'path':
      box = boundsOf(parsePath(el.attrs.d ?? '').controls);
      break;
    default:
      throw new Error(`unsupported element <${el.tag}>`);
  }
  const stroke = el.attrs.stroke;
  if (!opts.stroke || stroke === undefined || stroke === 'none') return box;
  const half = Number(el.attrs['stroke-width'] ?? 1) / 2;
  return { x0: box.x0 - half, y0: box.y0 - half, x1: box.x1 + half, y1: box.y1 + half };
}

/** Union of the stroked bounds of every element, or null for an empty fragment. */
export function fragmentBounds(svg: string): Box | null {
  const boxes = parseFragment(svg).map((el) => elementBounds(el, { stroke: true }));
  if (boxes.length === 0) return null;
  return boundsOf(boxes.flatMap((b): Point[] => [[b.x0, b.y0], [b.x1, b.y1]]));
}

const insideRings = (rings: readonly (readonly Point[])[], x: number, y: number): boolean => {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i] as Point;
      const [xj, yj] = ring[j] as Point;
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
};

/** Whether (x, y) lies in the element's fill area. Strokes are ignored. */
export function containsPoint(el: SvgElement, x: number, y: number): boolean {
  switch (el.tag) {
    case 'rect': {
      const left = num(el, 'x');
      const top = num(el, 'y');
      const width = num(el, 'width');
      const height = num(el, 'height');
      if (x < left || x > left + width || y < top || y > top + height) return false;
      const rx = Math.min(Number(el.attrs.rx ?? el.attrs.ry ?? 0), width / 2);
      const ry = Math.min(Number(el.attrs.ry ?? el.attrs.rx ?? 0), height / 2);
      if (rx <= 0 || ry <= 0) return true;
      const cx = Math.min(Math.max(x, left + rx), left + width - rx);
      const cy = Math.min(Math.max(y, top + ry), top + height - ry);
      return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    }
    case 'circle':
      return (x - num(el, 'cx')) ** 2 + (y - num(el, 'cy')) ** 2 <= num(el, 'r') ** 2;
    case 'ellipse':
      return ((x - num(el, 'cx')) / num(el, 'rx')) ** 2 + ((y - num(el, 'cy')) / num(el, 'ry')) ** 2 <= 1;
    case 'polygon':
      return insideRings([pointList(el)], x, y);
    case 'path':
      return insideRings(parsePath(el.attrs.d ?? '').rings, x, y);
    default:
      return false;
  }
}

/** The point and its eight neighbors at distance `margin` are all inside the fill. */
export function wellInside(el: SvgElement, x: number, y: number, margin: number): boolean {
  const d = margin / Math.SQRT2;
  const offsets: Point[] = [
    [0, 0],
    [margin, 0],
    [-margin, 0],
    [0, margin],
    [0, -margin],
    [d, d],
    [d, -d],
    [-d, d],
    [-d, -d],
  ];
  return offsets.every(([dx, dy]) => containsPoint(el, x + dx, y + dy));
}

/** Every fill and stroke value in a fragment, in document order. */
export function colorsOf(svg: string): string[] {
  return [...svg.matchAll(/\s(?:fill|stroke)="([^"]*)"/g)].map((m) => m[1] as string);
}
