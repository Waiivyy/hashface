/**
 * Describes a value for error messages: its type, plus the value itself for
 * primitives. Never calls an object's toString, which may throw or mislead
 * (a size of '64' should not read as "got 64").
 */
export function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'string':
      return `string ${JSON.stringify(value.length > 40 ? `${value.slice(0, 40)}...` : value)}`;
    case 'number':
    case 'bigint':
    case 'boolean':
      return `${typeof value} ${String(value)}`;
    default:
      return typeof value;
  }
}
