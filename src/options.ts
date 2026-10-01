/**
 * Option checks shared by both entry points (hashface and hashface/costumes),
 * so they validate in the same order with the same messages.
 */

import { describeValue } from './describe.ts';

export interface NormalizedOptions {
  readonly size: number;
  readonly title: string | undefined;
  /** Validated later by the entry point's own trait selection. */
  readonly traits: unknown;
}

const DEFAULT_SIZE = 64;

export function normalizeOptions(options: unknown): NormalizedOptions {
  if (typeof options !== 'object' || options === null) {
    throw new TypeError(`options must be an object, got ${describeValue(options)}`);
  }
  const { size = DEFAULT_SIZE, traits, title } = options as { size?: unknown; traits?: unknown; title?: unknown };
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    throw new RangeError(`size must be a positive finite number, got ${describeValue(size)}`);
  }
  if (title !== undefined && typeof title !== 'string') {
    throw new TypeError(`title must be a string, got ${describeValue(title)}`);
  }
  return { size, title, traits };
}
