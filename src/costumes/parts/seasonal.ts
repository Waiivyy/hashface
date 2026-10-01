import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

// A heart centered at (cx, cy), about 9 wide.
const heart = (cx: number, cy: number): string =>
  `M${cx} ${cy + 4.6}C${cx - 1.6} ${cy + 3.4} ${cx - 4.4} ${cy + 1.4} ${cx - 4.4} ${cy - 1.2}` +
  `C${cx - 4.4} ${cy - 3.2} ${cx - 3} ${cy - 4.4} ${cx - 1.8} ${cy - 4.4}C${cx - 0.8} ${cy - 4.4} ${cx} ${cy - 3.6} ${cx} ${cy - 2.4}` +
  `C${cx} ${cy - 3.6} ${cx + 0.8} ${cy - 4.4} ${cx + 1.8} ${cy - 4.4}C${cx + 3} ${cy - 4.4} ${cx + 4.4} ${cy - 3.2} ${cx + 4.4} ${cy - 1.2}` +
  `C${cx + 4.4} ${cy + 1.4} ${cx + 1.6} ${cy + 3.4} ${cx} ${cy + 4.6}Z`;

const blush = (color: string): string =>
  `<ellipse cx="19.5" cy="41.5" rx="3" ry="1.8" fill="${color}"/>` + `<ellipse cx="44.5" cy="41.5" rx="3" ry="1.8" fill="${color}"/>`;

export const SEASONAL = {
  snowman: {
    shape: (fill) => `<circle cx="32" cy="36" r="20" fill="${fill}" ${ink(3)}/>`,
    // A carrot nose.
    skin: (p) => `<path d="M32 36.5L43 39L32 41.2Z" fill="${p.detail}" ${ink(1.8)}/>`,
    // A smile of coal.
    mouth: () =>
      `<circle cx="25.5" cy="43" r="1.3" fill="${INK}"/>` +
      `<circle cx="28.6" cy="45.6" r="1.3" fill="${INK}"/>` +
      `<circle cx="32" cy="46.6" r="1.3" fill="${INK}"/>` +
      `<circle cx="35.4" cy="45.6" r="1.3" fill="${INK}"/>` +
      `<circle cx="38.5" cy="43" r="1.3" fill="${INK}"/>`,
    // A top hat with a red band.
    front: (p) =>
      `<rect x="22" y="4" width="20" height="15" rx="1" fill="${INK}" ${ink(2.5)}/>` +
      `<rect x="22" y="13.5" width="20" height="4" fill="${p.accent}"/>` +
      `<rect x="15.5" y="18" width="33" height="4" rx="2" fill="${INK}" ${ink(2.5)}/>`,
    colors: { body: '#F7FAFC', accent: '#E63946', detail: '#FF8A2B' },
  },
  'holiday-elf': {
    // Pointed ears, poking out from behind the head.
    back: (p) =>
      `<path d="M15 29L2.5 23.5L14 39Z" fill="${p.body}" ${ink(3)}/>` + `<path d="M49 29L61.5 23.5L50 39Z" fill="${p.body}" ${ink(3)}/>`,
    // A floppy green hat with fur trim and a bell.
    front: (p) =>
      `<path d="M17 22C21 14 28 7 38 5C44 4 49 5 52 8C46 8 42 10 40 14C42 17 44 20 47 22Z" fill="${p.accent}" ${ink(2.5)}/>` +
      `<circle cx="53.5" cy="9.5" r="3.2" fill="${p.detail}" ${ink(2.2)}/>` +
      `<rect x="15" y="19" width="34" height="5.5" rx="2.75" fill="${WHITE}" ${ink(2.5)}/>`,
    colors: { accent: '#2FA84F', detail: '#FFC93C' },
  },
  birthday: {
    // A cake hat with a lit candle.
    front: (p) =>
      `<path d="M32 1.8C33.7 3.4 34.3 4.8 33.9 5.8C33.5 6.8 30.5 6.8 30.1 5.8C29.7 4.8 30.3 3.4 32 1.8Z" fill="${p.detail}" ${ink(1.5)}/>` +
      `<rect x="30.6" y="7.5" width="2.8" height="6.5" fill="${WHITE}" ${ink(1.5)}/>` +
      `<rect x="21.5" y="13" width="21" height="8.5" rx="1.5" fill="${p.accent}" ${ink(2.5)}/>` +
      `<path d="M22.5 14.5H41.5V16Q40.3 18.4 39 16Q37.7 18.4 36.3 16Q35 18.4 33.7 16Q32.3 18.4 31 16Q29.7 18.4 28.3 16Q27 18.4 25.7 16Q24.3 18.4 22.5 16Z" fill="${WHITE}"/>`,
    // Blushing cheeks.
    skin: (p) => blush(p.accent),
    colors: { accent: '#FF8FB8', detail: '#FFB400' },
  },
  valentine: {
    eyes: (p) =>
      `<path d="${heart(25, 32.5)}" fill="${p.detail}" ${ink(2)}/>` + `<path d="${heart(39, 32.5)}" fill="${p.detail}" ${ink(2)}/>`,
    skin: (p) => blush(p.accent),
    colors: { accent: '#FF9BB8', detail: '#F0385A' },
  },
} satisfies Partial<Record<CostumeName, Costume>>;
