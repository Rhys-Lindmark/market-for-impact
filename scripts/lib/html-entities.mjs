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

export function removeHtmlElementContents(value, tagName) {
  const html = String(value ?? '');
  const lower = html.toLowerCase();
  const opening = `<${tagName.toLowerCase()}`;
  const closing = `</${tagName.toLowerCase()}`;
  let cursor = 0;
  let result = '';

  while (cursor < html.length) {
    const start = lower.indexOf(opening, cursor);
    if (start < 0) return result + html.slice(cursor);
    const boundary = lower[start + opening.length];
    if (boundary && !/[\s/>]/.test(boundary)) {
      result += html.slice(cursor, start + opening.length);
      cursor = start + opening.length;
      continue;
    }
    const openingEnd = lower.indexOf('>', start + opening.length);
    if (openingEnd < 0) return result + html.slice(cursor, start);
    const closingStart = lower.indexOf(closing, openingEnd + 1);
    if (closingStart < 0) return result + html.slice(cursor, start);
    const closingEnd = lower.indexOf('>', closingStart + closing.length);
    if (closingEnd < 0) return result + html.slice(cursor, start);
    result += `${html.slice(cursor, start)} `;
    cursor = closingEnd + 1;
  }

  return result;
}
