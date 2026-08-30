const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

function wait(ms: number, signal?: AbortSignal | null) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException('The request was aborted.', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit, label = 'Request') {
  const attempts = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(input, init);
    } catch (error) {
      if (init?.signal?.aborted) throw error;
      lastError = error;
      if (attempt === attempts - 1) throw error;
      await wait(300 * (2 ** attempt), init?.signal);
      continue;
    }
    if (response.ok) return await response.json() as T;
    const error = new Error(`${label} failed with HTTP ${response.status}`);
    if (!retryableStatuses.has(response.status) || attempt === attempts - 1) throw error;
    lastError = error;
    await wait(300 * (2 ** attempt), init?.signal);
  }
  throw lastError instanceof Error ? lastError : new Error(`${label} failed`);
}
