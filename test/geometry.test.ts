import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio } from './helpers/contrast.ts';
import {
  colorsOf,
  containsPoint,
  elementBounds,
  fragmentBounds,
  outlinePoints,
  parseFragment,
  wellInside,
  type SvgElement,
} from './helpers/geometry.ts';
import { touches, within } from './helpers/zones.ts';

const one = (svg: string): SvgElement => {
  const [el, ...rest] = parseFragment(svg);
  assert.ok(el, `no element in ${svg}`);
  assert.equal(rest.length, 0);
  return el;
};

// A circle of radius 10 around (32, 32), drawn with four cubic curves.
const CUBIC_CIRCLE =
  '<path d="M42 32C42 37.52 37.52 42 32 42C26.48 42 22 37.52 22 32C22 26.48 26.48 22 32 22C37.52 22 42 26.48 42 32Z" fill="#111111"/>';

test('parseFragment reads self-closing elements and their attributes', () => {
  assert.deepEqual(parseFragment(''), []);
  assert.deepEqual(parseFragment('<rect width="64" height="64" fill="#FFD23F"/><circle cx="1" cy="2" r="3"/>'), [
    { tag: 'rect', attrs: { width: '64', height: '64', fill: '#FFD23F' } },
    { tag: 'circle', attrs: { cx: '1', cy: '2', r: '3' } },
  ]);
});

test('parseFragment rejects anything outside the fragment rules', () => {
  assert.throws(() => parseFragment('<g><rect width="1" height="1"/></g>'));
  assert.throws(() => parseFragment('<rect width="1" height="1" transform="rotate(4)"/>'));
  assert.throws(() => parseFragment('<path d="m10 10l5 5"/>'));
  assert.throws(() => parseFragment('<path d="M0 0A5 5 0 0 1 10 0"/>'));
  assert.throws(() => parseFragment('<text x="1">hi</text>'));
  assert.throws(() => parseFragment('<image href="x.png"/>'));
  assert.throws(() => parseFragment('<rect width="1" height="1"/> stray'));
});

test('elementBounds covers each element type, with and without stroke', () => {
  const rect = one('<rect x="10" y="20" width="5" height="6" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>');
  assert.deepEqual(elementBounds(rect, { stroke: true }), { x0: 9, y0: 19, x1: 16, y1: 27 });
  assert.deepEqual(elementBounds(rect, { stroke: false }), { x0: 10, y0: 20, x1: 15, y1: 26 });
  assert.deepEqual(elementBounds(one('<circle cx="32" cy="32" r="5" fill="#111111"/>'), { stroke: true }), { x0: 27, y0: 27, x1: 37, y1: 37 });
  assert.deepEqual(elementBounds(one('<ellipse cx="10" cy="20" rx="4" ry="2"/>'), { stroke: true }), { x0: 6, y0: 18, x1: 14, y1: 22 });
  assert.deepEqual(
    elementBounds(one('<line x1="10" y1="10" x2="20" y2="30" stroke="#111111" stroke-width="3"/>'), { stroke: true }),
    { x0: 8.5, y0: 8.5, x1: 21.5, y1: 31.5 },
  );
  assert.deepEqual(elementBounds(one('<polygon points="32,15 50,25 14,25"/>'), { stroke: true }), { x0: 14, y0: 15, x1: 50, y1: 25 });
  assert.deepEqual(elementBounds(one('<polyline points="1 2 3 9 -1 4"/>'), { stroke: false }), { x0: -1, y0: 2, x1: 3, y1: 9 });
});

test('elementBounds of a path includes control points and H/V moves', () => {
  const curve = one('<path d="M10 10C20 0 30 20 40 10" fill="none" stroke="#111111" stroke-width="2"/>');
  assert.deepEqual(elementBounds(curve, { stroke: true }), { x0: 9, y0: -1, x1: 41, y1: 21 });
  assert.deepEqual(elementBounds(one('<path d="M10 10H30V40Z"/>'), { stroke: false }), { x0: 10, y0: 10, x1: 30, y1: 40 });
  assert.deepEqual(elementBounds(one('<path d="M0 10Q10 0 20 10"/>'), { stroke: false }), { x0: 0, y0: 0, x1: 20, y1: 10 });
  assert.deepEqual(elementBounds(one('<path d="M1.5.5L-2-3"/>'), { stroke: false }), { x0: -2, y0: -3, x1: 1.5, y1: 0.5 });
});

test('stroke growth defaults to width 1 and ignores stroke="none"', () => {
  assert.deepEqual(elementBounds(one('<circle cx="32" cy="32" r="5" stroke="#111111"/>'), { stroke: true }), { x0: 26.5, y0: 26.5, x1: 37.5, y1: 37.5 });
  assert.deepEqual(elementBounds(one('<circle cx="32" cy="32" r="5" stroke="none" stroke-width="9"/>'), { stroke: true }), { x0: 27, y0: 27, x1: 37, y1: 37 });
});

test('fragmentBounds is the union of all elements, or null when empty', () => {
  assert.equal(fragmentBounds(''), null);
  assert.deepEqual(fragmentBounds('<circle cx="10" cy="10" r="2"/><circle cx="30" cy="20" r="1" stroke="#111111" stroke-width="2"/>'), {
    x0: 8,
    y0: 8,
    x1: 32,
    y1: 22,
  });
});

test('containsPoint follows the fill area of each shape', () => {
  const rounded = one('<rect x="14" y="17" width="36" height="36" rx="8"/>');
  assert.equal(containsPoint(rounded, 15, 18), false); // cut corner
  assert.equal(containsPoint(rounded, 32, 35), true);
  assert.equal(containsPoint(rounded, 15, 35), true); // straight edge, outside the corner arcs
  assert.equal(containsPoint(rounded, 51, 35), false);

  const circle = one(CUBIC_CIRCLE);
  assert.equal(containsPoint(circle, 32, 32), true);
  assert.equal(containsPoint(circle, 32, 23), true);
  assert.equal(containsPoint(circle, 32, 21), false);
  assert.equal(containsPoint(circle, 0, 0), false);

  const hexagon = one('<polygon points="32,15 50.2,25.5 50.2,46.5 32,57 13.8,46.5 13.8,25.5"/>');
  assert.equal(containsPoint(hexagon, 32, 36), true);
  assert.equal(containsPoint(hexagon, 14, 18), false);

  const ellipse = one('<ellipse cx="10" cy="10" rx="4" ry="2"/>');
  assert.equal(containsPoint(ellipse, 13, 10), true);
  assert.equal(containsPoint(ellipse, 10, 12.5), false);

  assert.equal(containsPoint(one('<circle cx="5" cy="5" r="2"/>'), 6, 6), true);
  assert.equal(containsPoint(one('<line x1="0" y1="0" x2="10" y2="10" stroke="#111111"/>'), 5, 5), false);
});

test('containsPoint uses the even-odd rule for paths with holes', () => {
  const donut = one('<path d="M0 0H20V20H0Z M5 5H15V15H5Z"/>');
  assert.equal(containsPoint(donut, 2, 2), true);
  assert.equal(containsPoint(donut, 10, 10), false);
});

test('wellInside requires every neighbor at the margin to be inside', () => {
  const circle = one(CUBIC_CIRCLE);
  assert.equal(wellInside(circle, 32, 32, 2), true);
  assert.equal(wellInside(circle, 32, 23.5, 2), false); // the neighbor at y 21.5 is outside
  assert.equal(wellInside(circle, 32, 25, 2), true);
});

test('colorsOf lists every fill and stroke value', () => {
  assert.deepEqual(colorsOf('<rect fill="#FFFFFF" stroke="#111111" stroke-width="3"/><circle fill="none"/>'), ['#FFFFFF', '#111111', 'none']);
});

test('outlinePoints walks the edge of each element', () => {
  assert.deepEqual(outlinePoints(one('<rect x="10" y="20" width="4" height="6"/>')), [
    [10, 20],
    [14, 20],
    [14, 26],
    [10, 26],
  ]);
  const circle = outlinePoints(one('<circle cx="32" cy="32" r="5"/>'));
  assert.equal(circle.length, 16);
  for (const [x, y] of circle) assert.ok(Math.abs(Math.hypot(x - 32, y - 32) - 5) < 1e-9);
  assert.deepEqual(outlinePoints(one('<line x1="1" y1="2" x2="3" y2="4" stroke="#111111"/>')), [
    [1, 2],
    [3, 4],
  ]);
  assert.deepEqual(outlinePoints(one('<polygon points="0,0 4,0 4,4"/>')), [
    [0, 0],
    [4, 0],
    [4, 4],
  ]);
  // A rounded rect is sampled along its corners, so no point sits outside the shape.
  const rounded = one('<rect x="0" y="0" width="20" height="20" rx="6"/>');
  for (const [x, y] of outlinePoints(rounded)) assert.ok(containsPoint(rounded, x, y), `(${x}, ${y})`);
  const curve = outlinePoints(one(CUBIC_CIRCLE));
  assert.ok(curve.length > 32);
  for (const [x, y] of curve) assert.ok(Math.abs(Math.hypot(x - 32, y - 32) - 10) < 0.05);
});

test('contrastRatio follows the WCAG formula', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.ok(Math.abs(contrastRatio('#111111', '#FFFFFF') - 18.88) < 0.01);
  assert.equal(contrastRatio('#FFD23F', '#FFD23F'), 1);
  assert.equal(contrastRatio('#FFFFFF', '#111111'), contrastRatio('#111111', '#FFFFFF'));
});

test('within and touches compare boxes, counting shared edges as touching', () => {
  assert.equal(within({ x0: 1, y0: 1, x1: 2, y1: 2 }, { x0: 0, y0: 0, x1: 3, y1: 3 }), true);
  assert.equal(within({ x0: 1, y0: 1, x1: 4, y1: 2 }, { x0: 0, y0: 0, x1: 3, y1: 3 }), false);
  assert.equal(touches({ x0: 0, y0: 0, x1: 1, y1: 1 }, { x0: 1, y0: 0, x1: 2, y1: 1 }), true);
  assert.equal(touches({ x0: 0, y0: 0, x1: 1, y1: 1 }, { x0: 1.5, y0: 0, x1: 2, y1: 1 }), false);
});
