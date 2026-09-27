/**
 * Reusable AI KeyPool System
 *
 * Supports:
 * - Multiple API keys per provider (parsed from comma-delimited strings)
 * - Round-robin key rotation
 * - Cooldown quarantine for rate limits (429), 5xx server errors, timeouts, and network drops
 * - Permanent invalidation for 401/403 unauthorized keys (process lifecycle)
 * - Error classification (distinguishing retryable vs fatal client errors)
 * - Automatic retry with the next healthy key
 */

export interface KeyState {
  key: string;
  status: 'healthy' | 'quarantined' | 'invalid';
  quarantineUntil: number;
  failureCount: number;
}

export interface KeyPoolOptions {
  providerName: string;
  quarantineDurationMs?: number; // default: 60,000 ms (1 minute)
}

export class AllKeysExhaustedError extends Error {
  public provider: string;
  constructor(provider: string, message?: string) {
    super(message || `All API keys for provider "${provider}" are exhausted, quarantined, or invalid.`);
    this.name = 'AllKeysExhaustedError';
    this.provider = provider;
  }
}

export class NonRetryableError extends Error {
  public statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NonRetryableError';
    this.statusCode = statusCode;
  }
}

/**
 * Extracts numeric HTTP status code from any error object (GoogleGenAI, Fetch Response, Axios, etc.)
 */
export function extractStatusCode(error: unknown): number | null {
  if (!error) return null;

  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Direct status or statusCode fields
    if (typeof err.status === 'number') return err.status;
    if (typeof err.statusCode === 'number') return err.statusCode;

    // Response property (Fetch / Axios)
    if (err.response && typeof err.response === 'object') {
      const resp = err.response as Record<string, unknown>;
      if (typeof resp.status === 'number') return resp.status;
      if (typeof resp.statusCode === 'number') return resp.statusCode;
    }

    // Google Generative AI error pattern: status: 429 or status: 'RESOURCE_EXHAUSTED'
    if (typeof err.status === 'string') {
      if (err.status === 'RESOURCE_EXHAUSTED') return 429;
      if (err.status === 'UNAUTHENTICATED') return 401;
      if (err.status === 'PERMISSION_DENIED') return 403;
      if (err.status === 'INVALID_ARGUMENT') return 400;
    }

    // Search message string for status codes like 429, 401, 503
    if (typeof err.message === 'string') {
      const match = err.message.match(/\b(400|401|403|404|429|500|502|503|504)\b/);
      if (match) return parseInt(match[1], 10);
      if (/RESOURCE_EXHAUSTED/i.test(err.message)) return 429;
      if (/UNAUTHENTICATED/i.test(err.message)) return 401;
      if (/PERMISSION_DENIED/i.test(err.message)) return 403;
      if (/INVALID_ARGUMENT/i.test(err.message)) return 400;
    }
  }

  return null;
}

/**
 * Determines whether an error is transient/retryable.
 *
 * Retry: 429, 500, 502, 503, 504, timeout, network error.
 * Do NOT retry: 400, 401, 403, schema validation errors.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  // Schema Validation errors are structural; do not retry same request
  if (error instanceof Error && error.name === 'ValidationError') {
    return false;
  }

  const statusCode = extractStatusCode(error);

  if (statusCode !== null) {
    if ([429, 500, 502, 503, 504].includes(statusCode)) {
      return true;
    }
    if ([400, 401, 403, 404].includes(statusCode)) {
      return false;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Timeouts and network errors
    if (
      name.includes('timeout') ||
      name.includes('aborterror') ||
      msg.includes('timeout') ||
      msg.includes('abort') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('enotfound') ||
      msg.includes('fetch failed') ||
      msg.includes('network error') ||
      msg.includes('socket hang up')
    ) {
      return true;
    }
  }

  // Default to non-retryable for unclassified errors
  return false;
}

export class KeyPool {
  private providerName: string;
  private keys: KeyState[] = [];
  private currentIndex: number = 0;
  private quarantineDurationMs: number;

  constructor(rawKeys: string | string[], options: KeyPoolOptions) {
    this.providerName = options.providerName;
    this.quarantineDurationMs = options.quarantineDurationMs ?? 60_000;

    const keyList = (Array.isArray(rawKeys)
      ? rawKeys
      : (rawKeys || '').split(',')
    )
      .map((k) => k.trim().replace(/^['"]+|['"]+$/g, ''))
      .filter((k) => k.length > 0);

    this.keys = keyList.map((key) => ({
      key,
      status: 'healthy',
      quarantineUntil: 0,
      failureCount: 0,
    }));
  }

  /**
   * Returns total number of registered keys
   */
  public size(): number {
    return this.keys.length;
  }

  /**
   * Refreshes keys whose quarantine time has expired
   */
  private refreshQuarantines(): void {
    const now = Date.now();
    for (const item of this.keys) {
      if (item.status === 'quarantined' && now >= item.quarantineUntil) {
        item.status = 'healthy';
        item.quarantineUntil = 0;
        console.log(`[KeyPool:${this.providerName}] Key ending in ...${item.key.slice(-4)} cooldown expired, restored to healthy.`);
      }
    }
  }

  /**
   * Gets the next healthy key in round-robin order.
   * Returns null if no healthy keys are currently available.
   */
  public getNextKey(): string | null {
    this.refreshQuarantines();

    if (this.keys.length === 0) return null;

    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const candidate = this.keys[idx];
      if (candidate.status === 'healthy') {
        this.currentIndex = (idx + 1) % this.keys.length;
        return candidate.key;
      }
    }

    return null;
  }

  /**
   * Reports a successful API call with a given key.
   */
  public recordSuccess(key: string): void {
    const item = this.keys.find((k) => k.key === key);
    if (item && item.status !== 'invalid') {
      item.status = 'healthy';
      item.quarantineUntil = 0;
      item.failureCount = 0;
    }
  }

  /**
   * Reports an error when using a key.
   * Classifies the error and updates key status accordingly.
   */
  public recordError(key: string, error: unknown): { shouldRetry: boolean; isFatal: boolean } {
    const item = this.keys.find((k) => k.key === key);
    const statusCode = extractStatusCode(error);
    const retryable = isRetryableError(error);

    // 401 or 403: Key is unauthorized/revoked -> permanently invalidate for process lifecycle
    if (statusCode === 401 || statusCode === 403) {
      if (item) {
        item.status = 'invalid';
        console.warn(`[KeyPool:${this.providerName}] Key ending in ...${key.slice(-4)} marked INVALID (HTTP ${statusCode}).`);
      }
      return { shouldRetry: false, isFatal: true };
    }

    // 429, 5xx, or network timeout: Quarantine key
    if (retryable) {
      if (item) {
        item.status = 'quarantined';
        item.quarantineUntil = Date.now() + this.quarantineDurationMs;
        item.failureCount++;
        console.warn(
          `[KeyPool:${this.providerName}] Key ending in ...${key.slice(-4)} QUARANTINED for ${
            this.quarantineDurationMs / 1000
          }s due to error (${statusCode || (error as Error)?.name || 'Network'}).`
        );
      }
      return { shouldRetry: true, isFatal: false };
    }

    // 400 Bad Request or Schema error: Do not quarantine key, but do not retry this request
    return { shouldRetry: false, isFatal: false };
  }

  /**
   * Executes a given async operation with key rotation and retry logic.
   */
  public async executeWithRetry<T>(
    operation: (key: string) => Promise<T>,
    timeoutMs: number = 15_000
  ): Promise<T> {
    if (this.keys.length === 0) {
      throw new AllKeysExhaustedError(this.providerName, `No API keys configured for ${this.providerName}.`);
    }

    const attemptedKeys = new Set<string>();
    let lastError: unknown = null;

    while (attemptedKeys.size < this.keys.length) {
      const key = this.getNextKey();
      if (!key || attemptedKeys.has(key)) {
        break;
      }
      attemptedKeys.add(key);

      try {
        // Enforce request timeout
        const result = await Promise.race([
          operation(key),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`AI Request timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);

        this.recordSuccess(key);
        return result;
      } catch (err) {
        lastError = err;
        const { shouldRetry, isFatal } = this.recordError(key, err);

        // If the error was 401/403, key is dead, but if other keys exist in the pool, try the next one!
        if (isFatal) {
          console.warn(`[KeyPool:${this.providerName}] Key invalid, attempting next available key in pool...`);
          continue;
        }

        // If it was a non-retryable client error (like 400 bad request), throw immediately without burning keys
        if (!shouldRetry) {
          throw err;
        }

        console.warn(`[KeyPool:${this.providerName}] Retryable error encountered. Trying next key in pool...`);
      }
    }

    throw new AllKeysExhaustedError(
      this.providerName,
      `All available keys for ${this.providerName} failed. Last error: ${
        (lastError as Error)?.message || String(lastError)
      }`
    );
  }
}
