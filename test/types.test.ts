import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToCanvas, type CanvasTarget } from '../src/index.ts';

// Compile-time check, enforced by `npm run typecheck`: a real DOM canvas must fit
// CanvasTarget, which is structural so the published types never need DOM lib.
// Never called at runtime.
export function drawOnRealCanvas(svg: string): Promise<void> {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const target: CanvasTarget = canvas;
  return renderToCanvas(target, svg);
}

test('the DOM canvas check is part of the type check', () => {
  assert.equal(typeof drawOnRealCanvas, 'function');
});
