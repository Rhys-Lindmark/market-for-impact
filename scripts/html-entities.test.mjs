import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeHtmlEntities } from './lib/html-entities.mjs';
import { normalizePageText } from './lib/founders-pledge.mjs';

test('decodes recognized entities exactly once', () => {
  assert.equal(decodeHtmlEntities('&amp;lt; &lt; &#39; &#x27;'), '&lt; < \' \'');
});

test('removes script content with whitespace in the closing tag', () => {
  assert.equal(normalizePageText('safe<script>alert(1)</script >text'), 'safe text');
});

test('preserves invalid numeric entities', () => {
  assert.equal(decodeHtmlEntities('&#99999999;'), '&#99999999;');
});
