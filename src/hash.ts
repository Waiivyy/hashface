/**
 * Seed hashing. A seed is encoded as UTF-8, hashed with FNV-1a (32-bit), and
 * expanded into DIGEST_WORDS words with a SplitMix32-style generator: a
 * golden-ratio increment followed by the MurmurHash3 finalizer. FNV-1a alone
 * mixes poorly, so the finalizer spreads any input change across every bit.
 *
 * Changing anything here changes every avatar. See docs/design.md section 6.
 */

const encoder = new TextEncoder();

/** Number of 32-bit words in a digest. Each trait category reads its own word. */
export const DIGEST_WORDS = 8;

/** FNV-1a, 32-bit. Returns an unsigned 32-bit integer. */
export function fnv1a32(bytes: Uint8Array): number {
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** MurmurHash3's fmix32 finalizer. Returns an unsigned 32-bit integer. */
export function mix32(x: number): number {
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x >>> 0;
}

/** Hashes a seed exactly as given (no normalization) into DIGEST_WORDS words. */
export function digest(seed: string): Uint32Array {
  const words = new Uint32Array(DIGEST_WORDS);
  let state = fnv1a32(encoder.encode(seed));
  for (let i = 0; i < DIGEST_WORDS; i++) {
    state = (state + 0x9e3779b9) >>> 0;
    words[i] = mix32(state);
  }
  return words;
}
