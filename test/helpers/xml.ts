/**
 * A strict well-formedness check for the markup hashface emits: one <svg>
 * root, balanced tags, no stray "<", and no "&" outside an entity.
 */

const TOKEN = /<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z][a-zA-Z0-9:-]*="[^"<>]*")*)\s*(\/?)>|([^<]+)|</g;

export function assertWellFormed(svg: string): void {
  const stack: string[] = [];
  let closedRoot = false;
  for (const match of svg.matchAll(TOKEN)) {
    const [whole, closing, tag, , selfClosing, text] = match;
    if (closedRoot) throw new Error(`content after the root element: ${whole}`);
    if (text !== undefined) {
      if (stack.length === 0) throw new Error(`text outside the root element: ${text}`);
      continue;
    }
    if (tag === undefined) throw new Error(`stray "<" at index ${match.index}`);
    if (closing) {
      if (selfClosing) throw new Error(`malformed closing tag: ${whole}`);
      const open = stack.pop();
      if (open !== tag) throw new Error(`</${tag}> closes <${open ?? 'nothing'}>`);
      if (stack.length === 0) closedRoot = true;
    } else if (selfClosing) {
      if (stack.length === 0) throw new Error(`element outside the root: ${whole}`);
    } else {
      if (stack.length === 0 && tag !== 'svg') throw new Error(`root element is <${tag}>, not <svg>`);
      stack.push(tag);
    }
  }
  if (stack.length > 0) throw new Error(`unclosed <${stack.join('>, <')}>`);
  if (!closedRoot) throw new Error('no root element');
  const rawAmpersand = /&(?!(?:amp|lt|gt|quot|apos);)/.exec(svg);
  if (rawAmpersand) throw new Error(`raw "&" at index ${rawAmpersand.index}`);
}
