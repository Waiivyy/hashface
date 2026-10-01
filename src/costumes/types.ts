import type { Palette } from '../palettes.ts';
import type { Draw, ShapeDraw } from '../traits/types.ts';

/**
 * A costume replaces some layers of the normal avatar; everything it leaves
 * out comes from the seed. Every field follows the zone contract
 * (docs/costumes.md section 5), which test/costumes.zones.test.ts checks.
 */
export interface Costume {
  /** The head silhouette: one element that contains both face zones. */
  readonly shape?: ShapeDraw;
  /** Drawn on the head, under the eyes and mouth: masks, patches, bandages. */
  readonly skin?: Draw;
  readonly eyes?: Draw;
  readonly mouth?: Draw;
  /** Behind the head. With `front`, replaces the whole accessory. */
  readonly back?: Draw;
  /** Over the face layer, never on the face zones. */
  readonly front?: Draw;
  readonly pattern?: Draw;
  /** Palette colors to pin, e.g. `{ body: '#F4F4F4' }`. */
  readonly colors?: Partial<Palette>;
}
