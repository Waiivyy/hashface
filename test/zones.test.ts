import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { INK } from '../src/palettes.ts';
import { SHAPES } from '../src/traits/shapes.ts';
import { elementBounds, parseFragment, wellInside } from './helpers/geometry.ts';
import { EYES_ZONE, HEAD_TOP, MOUTH_ZONE, OUTLINE_WIDTH, SHADOW_OFFSET, SHAPE_MARGIN, type Box } from './helpers/zones.ts';

// The zone contract from docs/design.md section 5, checked for every variant.

const gridPoints = (zone: Box): [number, number][] => {
  const points: [number, number][] = [];
  for (let x = zone.x0; x <= zone.x1; x++) for (let y = zone.y0; y <= zone.y1; y++) points.push([x, y]);
  return points;
};

for (const name of VARIANTS.shape) {
  test(`shape ${name} honors the zone contract`, () => {
    const elements = parseFragment(SHAPES[name]('#ABCDEF'));
    assert.equal(elements.length, 1, 'a shape is a single element');
    const el = elements[0]!;
    assert.equal(el.attrs.fill, '#ABCDEF');
    assert.equal(el.attrs.stroke, INK);
    assert.equal(el.attrs['stroke-width'], '3');

    const top = elementBounds(el, { stroke: false }).y0;
    assert.ok(top >= HEAD_TOP.min && top <= HEAD_TOP.max, `top edge at y ${top}`);

    const b = elementBounds(el, { stroke: true });
    assert.ok(b.x0 >= 0 && b.y0 >= 0 && b.x1 + SHADOW_OFFSET <= 64, `bounds ${JSON.stringify(b)} leave the canvas`);

    const margin = OUTLINE_WIDTH / 2 + SHAPE_MARGIN;
    for (const [x, y] of [...gridPoints(EYES_ZONE), ...gridPoints(MOUTH_ZONE)]) {
      assert.ok(wellInside(el, x, y, margin), `${name} does not clear the face zones at (${x}, ${y})`);
    }
  });
}
