import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { COSTUME_NAMES } from '../src/costumes/catalog.ts';
import { COSTUMES } from '../src/costumes/costumes.ts';
import { INK, PALETTES, WHITE, type Palette } from '../src/palettes.ts';
import { SHAPES } from '../src/traits/shapes.ts';
import { contrastRatio } from './helpers/contrast.ts';
import {
  colorsOf,
  elementBounds,
  fragmentBounds,
  outlinePoints,
  parseFragment,
  wellInside,
  type SvgElement,
} from './helpers/geometry.ts';
import {
  CANVAS,
  CROWN_REACH_Y,
  EYES_ZONE,
  HEAD_TOP,
  MOUTH_ZONE,
  OUTLINE_WIDTH,
  SHADOW_OFFSET,
  SHAPE_MARGIN,
  touches,
  within,
  type Box,
} from './helpers/zones.ts';

// docs/costumes.md section 5: every costume field follows the same zone
// contract as the core traits, in every palette after the costume's colors.

const gridPoints = (zone: Box): [number, number][] => {
  const points: [number, number][] = [];
  for (let x = zone.x0; x <= zone.x1; x++) for (let y = zone.y0; y <= zone.y1; y++) points.push([x, y]);
  return points;
};

const FACE_POINTS = [...gridPoints(EYES_ZONE), ...gridPoints(MOUTH_ZONE)];
const CORE_HEADS: SvgElement[] = VARIANTS.shape.map((shape) => parseFragment(SHAPES[shape]('#ABCDEF'))[0] as SvgElement);

const strokeHalf = (el: SvgElement): number =>
  el.attrs.stroke && el.attrs.stroke !== 'none' ? Number(el.attrs['stroke-width'] ?? 1) / 2 : 0;

for (const name of COSTUME_NAMES) {
  test(`costume ${name} honors the zone contract`, () => {
    const costume = COSTUMES[name];

    let heads = CORE_HEADS;
    if (costume.shape) {
      const elements = parseFragment(costume.shape('#ABCDEF'));
      assert.equal(elements.length, 1, `${name}: a shape is one element`);
      const head = elements[0] as SvgElement;
      assert.equal(head.attrs.fill, '#ABCDEF', `${name}: the shape passes its fill through`);
      assert.equal(head.attrs.stroke, INK);
      assert.equal(head.attrs['stroke-width'], '3');
      const top = elementBounds(head, { stroke: false }).y0;
      assert.ok(top >= HEAD_TOP.min && top <= HEAD_TOP.max, `${name}: top edge at y ${top}`);
      const b = elementBounds(head, { stroke: true });
      assert.ok(b.x0 >= 0 && b.y0 >= 0 && b.x1 + SHADOW_OFFSET <= 64, `${name}: shape bounds ${JSON.stringify(b)}`);
      for (const [x, y] of FACE_POINTS) {
        assert.ok(wellInside(head, x, y, OUTLINE_WIDTH / 2 + SHAPE_MARGIN), `${name}: shape misses the face at (${x}, ${y})`);
      }
      heads = [head];
    }

    for (const [paletteName, base] of Object.entries(PALETTES)) {
      const p: Palette = { ...base, ...costume.colors };
      const label = `${name} with ${paletteName}`;
      const allowed = new Set([p.bg, p.pattern, p.body, p.accent, p.detail, INK, WHITE, 'none']);
      const checkColors = (part: string, svg: string) => {
        for (const color of colorsOf(svg)) assert.ok(allowed.has(color), `${label}: ${part} uses ${color}`);
      };

      for (const [part, draw, zone] of [
        ['eyes', costume.eyes, EYES_ZONE],
        ['mouth', costume.mouth, MOUTH_ZONE],
      ] as const) {
        if (!draw) continue;
        const svg = draw(p);
        const b = fragmentBounds(svg);
        assert.ok(b, `${label}: ${part} draws nothing`);
        assert.ok(within(b, zone), `${label}: ${part} bounds ${JSON.stringify(b)} leave the zone`);
        checkColors(part, svg);
        for (const color of colorsOf(svg)) assert.notEqual(color, p.body, `${label}: ${part} uses the body color`);
      }

      // A pinned body must leave the seed's ink features readable (WCAG 3:1).
      if (costume.colors?.body !== undefined) {
        for (const [part, draw] of [
          ['eyes', costume.eyes],
          ['mouth', costume.mouth],
        ] as const) {
          if (draw) continue;
          const ratio = contrastRatio(INK, p.body);
          assert.ok(ratio >= 3, `${label}: body ${p.body} hides the seed's ${part} (contrast ${ratio.toFixed(2)})`);
        }
      }

      if (costume.front) {
        const svg = costume.front(p);
        for (const el of parseFragment(svg)) {
          const b = elementBounds(el, { stroke: true });
          assert.ok(!touches(b, EYES_ZONE) && !touches(b, MOUTH_ZONE), `${label}: front part ${JSON.stringify(b)} covers the face`);
        }
        const union = fragmentBounds(svg);
        assert.ok(union && within(union, CANVAS), `${label}: front leaves the canvas`);
        assert.ok(union.y1 >= CROWN_REACH_Y, `${label}: front ends at y ${union.y1}, above the lowest head top`);
        checkColors('front', svg);
      }

      if (costume.back) {
        const svg = costume.back(p);
        const union = fragmentBounds(svg);
        assert.ok(union && within(union, CANVAS), `${label}: back leaves the canvas`);
        checkColors('back', svg);
      }

      if (costume.skin) {
        const svg = costume.skin(p);
        for (const el of parseFragment(svg)) {
          for (const [x, y] of outlinePoints(el)) {
            for (const head of heads) {
              assert.ok(
                wellInside(head, x, y, OUTLINE_WIDTH / 2 + strokeHalf(el)),
                `${label}: skin point (${x.toFixed(2)}, ${y.toFixed(2)}) reaches the head outline`,
              );
            }
          }
        }
        checkColors('skin', svg);
      }

      if (costume.pattern) {
        const svg = costume.pattern(p);
        assert.match(svg, /^(<path [^<>]*\/>)?$/, `${label}: a pattern is one path or nothing`);
        for (const color of colorsOf(svg)) assert.ok(color === p.pattern || color === 'none', `${label}: pattern uses ${color}`);
      }
    }
  });
}
