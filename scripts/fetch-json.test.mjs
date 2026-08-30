import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchJson } from '../app/lib/fetch-json.ts';

test('read-only JSON requests recover from retryable HTTP and network failures', async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    new Response('{"error":"busy"}', { status: 503 }),
    new TypeError('temporary network failure'),
    new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
  ];
  let calls = 0;
  globalThis.fetch = async () => {
    const response = responses[calls++];
    if (response instanceof Error) throw response;
    return response;
  };
  try {
    assert.deepEqual(await fetchJson('/test', undefined, 'Test request'), { ok: true });
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('read-only JSON requests fail closed without retrying nonretryable HTTP errors', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response('{"error":"not found"}', { status: 404 });
  };
  try {
    await assert.rejects(fetchJson('/missing', undefined, 'Missing request'), /HTTP 404/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('read-only JSON requests retry rate limits', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1
      ? new Response('{"error":"rate limited"}', { status: 429 })
      : new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    assert.deepEqual(await fetchJson('/limited', undefined, 'Limited request'), { ok: true });
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
