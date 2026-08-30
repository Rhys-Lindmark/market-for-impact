const NAMED_ENTITIES = Object.freeze({
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
});

function decodeCodePoint(value, original) {
  if (!Number.isInteger(value) || value < 0 || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) {
    return original;
  }
  return String.fromCodePoint(value);
}

export function decodeHtmlEntities(value) {
  return String(value ?? '').replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi,
    (entity, decimal, hexadecimal, named) => {
      if (decimal) return decodeCodePoint(Number(decimal), entity);
      if (hexadecimal) return decodeCodePoint(Number.parseInt(hexadecimal, 16), entity);
      return NAMED_ENTITIES[named.toLowerCase()] ?? entity;
    },
  );
}
