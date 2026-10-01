import { INK, WHITE } from '../../palettes.ts';
import type { CostumeName } from '../catalog.ts';
import type { Costume } from '../types.ts';
import { ink } from './draw.ts';

const sprinkle = (d: string, color: string): string => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"/>`;

export const FOOD = {
  pizza: {
    // A slice: the crust along the top, the tip at the bottom.
    shape: (fill) => `<path d="M5.5 17C17 12 47 12 58.5 17L40 58C37 62.5 27 62.5 24 58Z" fill="${fill}" ${ink(3)}/>`,
    skin: (p) =>
      `<path d="M10 20.5C19.5 15 44.5 15 54 20.5L52.5 24.5C43.5 20.5 20.5 20.5 11.5 24.5Z" fill="${p.accent}" ${ink(2)}/>` +
      `<circle cx="16.5" cy="28.5" r="2.6" fill="${p.detail}" ${ink(1.8)}/>` +
      `<circle cx="47.5" cy="28.5" r="2.6" fill="${p.detail}" ${ink(1.8)}/>` +
      `<circle cx="32" cy="54.5" r="2.6" fill="${p.detail}" ${ink(1.8)}/>`,
    colors: { body: '#FFD25E', accent: '#E39A4C', detail: '#D63A3A' },
  },
  donut: {
    shape: (fill) => `<ellipse cx="32" cy="36" rx="22" ry="20" fill="${fill}" ${ink(3)}/>`,
    // Dripping frosting with sprinkles, and the hole on top.
    skin: (p) =>
      `<path d="M12.8 36C12.8 26.5 21.4 18.8 32 18.8C42.6 18.8 51.2 26.5 51.2 36C51.2 38.2 50 39.6 48.5 39.6C47.2 39.6 47.6 44.6 45.5 44.6C43.4 44.6 43.8 39.4 41.5 39.2C37 38.6 27 38.6 22.5 39.2C20.2 39.4 20.6 45 18.5 45C16.4 45 16.8 39.6 15.5 39.6C14 39.6 12.8 38.2 12.8 36Z" fill="${p.accent}" ${ink(2)}/>` +
      `<ellipse cx="32" cy="23.8" rx="5" ry="2.6" fill="${p.bg}" ${ink(2)}/>` +
      sprinkle('M16 30.5L17.5 28', WHITE) +
      sprinkle('M20.5 24L22.8 22.8', p.detail) +
      sprinkle('M41.2 22.8L43.5 24', WHITE) +
      sprinkle('M46.5 28L48 30.5', p.detail) +
      sprinkle('M15.5 35.5L16 33', p.detail) +
      sprinkle('M48 33L48.5 35.5', WHITE),
    colors: { body: '#E7A65C', accent: '#FF8CC6', detail: '#FFD23F' },
  },
  taco: {
    // The shell, folded at the bottom.
    shape: (fill) => `<path d="M8 17C8 43 18 58 32 58C46 58 56 43 56 17Z" fill="${fill}" ${ink(3)}/>`,
    // Tomatoes and a lettuce fringe spilling out of the top.
    front: (p) =>
      `<circle cx="17" cy="12.5" r="2.6" fill="${p.detail}" ${ink(1.8)}/>` +
      `<circle cx="41" cy="12" r="2.6" fill="${p.detail}" ${ink(1.8)}/>` +
      `<path d="M6.5 19Q9 13 12.5 17.5Q15.5 11.5 20 16.5Q24 11 28 16Q32 10.5 36 16Q40 11 44 16.5Q48.5 11.5 51.5 17.5Q55 13 57.5 19L56 22H8Z" fill="${p.accent}" ${ink(2)}/>`,
    colors: { body: '#F6C453', accent: '#79C95C', detail: '#E8473B' },
  },
  avocado: {
    shape: (fill) =>
      `<path d="M32 12.5C42.5 12.5 48 21 50 31C52.5 44 49 61 32 61C15 61 11.5 44 14 31C16 21 21.5 12.5 32 12.5Z" fill="${fill}" ${ink(3)}/>`,
    // The flesh inside the dark skin, and the pit as a round belly.
    skin: (p) =>
      `<path d="M32 16.5C40 16.5 44.5 23.5 46.2 32C48.3 43 46 58 32 58C18 58 15.7 43 17.8 32C19.5 23.5 24 16.5 32 16.5Z" fill="${p.accent}" ${ink(2)}/>` +
      `<circle cx="32" cy="53" r="4" fill="${p.detail}" ${ink(2)}/>`,
    colors: { body: '#4E8F3A', accent: '#D6EA9A', detail: '#9C5B2E' },
  },
  cupcake: {
    shape: (fill) => `<path d="M11 33C11 21.4 20.4 12 32 12C43.6 12 53 21.4 53 33L48 56H16Z" fill="${fill}" ${ink(3)}/>`,
    // A striped wrapper under a frosting dome.
    skin: (p) =>
      `<path d="M16 38L18.5 53M22 38L23.5 53M28.5 38L29 53M35.5 38L35 53M42 38L40.5 53M48 38L45.5 53" fill="none" stroke="${WHITE}" stroke-width="2.5"/>` +
      `<path d="M12.75 33C12.75 22.37 21.37 13.75 32 13.75C42.63 13.75 51.25 22.37 51.25 33Q51 37 47.5 36.5Q44.5 39.5 40.5 37.5Q36.5 40 32 38Q27.5 40 23.5 37.5Q19.5 39.5 16.5 36.5Q13 37 12.75 33Z" fill="${p.accent}"/>`,
    // A cherry on top, and sprinkles on the frosting.
    front: (p) =>
      `<path d="M32.5 7C33 4.5 34.5 3 37 2.5" fill="none" ${ink(2)}/>` +
      `<circle cx="32" cy="10" r="4.2" fill="${p.detail}" ${ink(2.5)}/>` +
      sprinkle('M20 22L22 20.5', p.detail) +
      sprinkle('M42 20.5L44 22', WHITE) +
      sprinkle('M27 18L29.5 17.5', WHITE) +
      sprinkle('M36 17.5L38.5 18.5', p.detail) +
      sprinkle('M15.5 28L16.5 25.5', WHITE) +
      sprinkle('M47.5 25.5L48.5 28', p.detail),
    colors: { body: '#9AD9F2', accent: '#FFB8D9', detail: '#E8344E' },
  },
} satisfies Partial<Record<CostumeName, Costume>>;
