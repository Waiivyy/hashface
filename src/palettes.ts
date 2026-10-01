/**
 * Colors. Every avatar uses one palette for all of its parts, plus the shared
 * ink and eye white. v1 ships one family, "pop": saturated and bright.
 */

import type { PaletteName } from './catalog.ts';

export const INK = '#111111';
export const WHITE = '#FFFFFF';

export interface Palette {
  /** Background. */
  readonly bg: string;
  /** Background pattern, a darker tone of bg. */
  readonly pattern: string;
  /** Head fill. */
  readonly body: string;
  /** Accessories. */
  readonly accent: string;
  /** Small details such as tongues and pom-poms. */
  readonly detail: string;
}

export const PALETTES: Readonly<Record<PaletteName, Palette>> = Object.freeze({
  lemon: { bg: '#FFD23F', pattern: '#EBB920', body: '#FF6B9A', accent: '#3BCEAC', detail: '#4EA8F0' },
  sky: { bg: '#62B0EC', pattern: '#4A98D9', body: '#FF8C42', accent: '#FFD23F', detail: '#FF6B9A' },
  mint: { bg: '#7BDFB5', pattern: '#5FC89B', body: '#A675E0', accent: '#FFD23F', detail: '#FF6B9A' },
  coral: { bg: '#FF6F59', pattern: '#EE5640', body: '#F4EFE3', accent: '#62B0EC', detail: '#FFD23F' },
  grape: { bg: '#A675E0', pattern: '#8F5BCC', body: '#B8E34F', accent: '#FF6B9A', detail: '#FFD23F' },
  bubblegum: { bg: '#FF9EC4', pattern: '#F282AE', body: '#FFD23F', accent: '#3BCEAC', detail: '#4EA8F0' },
  tangerine: { bg: '#FF9F43', pattern: '#F08A2A', body: '#4ECDC4', accent: '#F4EFE3', detail: '#FF6B9A' },
  cream: { bg: '#F4EFE3', pattern: '#E2DAC8', body: '#FF6F59', accent: '#4EA8F0', detail: '#FFD23F' },
});
