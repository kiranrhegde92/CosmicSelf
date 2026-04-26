/**
 * Tiny exponential-backoff retry helper. Used by network-bound services
 * (chat, geocoding) to soften transient failures without inventing per-call
 * scaffolding everywhere.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; baseMs?: number; factor?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseMs = options.baseMs ?? 350;
  const factor = options.factor ?? 2;

  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i === attempts - 1) break;
      await new Promise((res) => setTimeout(res, baseMs * factor ** i));
    }
  }
  throw lastError;
}
