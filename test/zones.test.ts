import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VARIANTS } from '../src/catalog.ts';
import { INK, PALETTES, WHITE, type Palette } from '../src/palettes.ts';
import { EYES } from '../src/traits/eyes.ts';
import { MOUTHS } from '../src/traits/mouths.ts';
import { SHAPES } from '../src/traits/shapes.ts';
import type { Draw } from '../src/traits/types.ts';
import { colorsOf, elementBounds, fragmentBounds, parseFragment, wellInside } from './helpers/geometry.ts';
import { EYES_ZONE, HEAD_TOP, MOUTH_ZONE, OUTLINE_WIDTH, SHADOW_OFFSET, SHAPE_MARGIN, within, type Box } from './helpers/zones.ts';

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

const paletteColors = (p: Palette): Set<string> => new Set([p.bg, p.pattern, p.body, p.accent, p.detail, INK, WHITE, 'none']);

// Face features sit on the head, so they must stay in their zone and never use
// the body color, which would make them vanish into the head.
const checkFeature = (kind: string, name: string, draw: Draw, zone: Box) => {
  for (const [paletteName, p] of Object.entries(PALETTES)) {
    const svg = draw(p);
    parseFragment(svg);
    const b = fragmentBounds(svg);
    assert.ok(b, `${kind} ${name} draws nothing`);
    assert.ok(within(b, zone), `${kind} ${name} bounds ${JSON.stringify(b)} leave the zone`);
    const allowed = paletteColors(p);
    for (const color of colorsOf(svg)) {
      assert.ok(allowed.has(color), `${kind} ${name} uses ${color}, which is not in palette ${paletteName}`);
      assert.notEqual(color, p.body, `${kind} ${name} uses the body color of palette ${paletteName}`);
    }
  }
};

for (const name of VARIANTS.eyes) {
  test(`eyes ${name} stay inside the eyes zone`, () => checkFeature('eyes', name, EYES[name], EYES_ZONE));
}

for (const name of VARIANTS.mouth) {
  test(`mouth ${name} stays inside the mouth zone`, () => checkFeature('mouth', name, MOUTHS[name], MOUTH_ZONE));
}
