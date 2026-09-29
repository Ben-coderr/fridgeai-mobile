import { Platform } from 'react-native';

/**
 * Central configuration for FridgeAI Mobile.
 *
 * Automatically detects environment:
 * - Android Emulator: Uses http://10.0.2.2:3000
 * - iOS Simulator / Web: Uses http://localhost:3000
 * - Overridden via process.env.EXPO_PUBLIC_API_URL or runtime user setting.
 */

export function getDefaultApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // Android emulator maps 10.0.2.2 to host machine's localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  // iOS Simulator and Web default to localhost
  return 'http://localhost:3000';
}

let activeApiBaseUrl: string = getDefaultApiBaseUrl();
let activeUseBackend: boolean = (process.env.EXPO_PUBLIC_USE_BACKEND ?? 'true') === 'true';

export function getApiBaseUrl(): string {
  return activeApiBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  const clean = (url || '').trim().replace(/\/+$/, '');
  if (clean.length > 0) {
    activeApiBaseUrl = clean;
  }
}

export function isBackendEnabled(): boolean {
  return activeUseBackend;
}

export function setBackendEnabled(enabled: boolean): void {
  activeUseBackend = enabled;
}

// Deprecated direct exports for backward compatibility
export const API_BASE_URL = activeApiBaseUrl;
export const USE_BACKEND = activeUseBackend;

/**
 * Pings the backend /api/health endpoint to test connectivity.
 */
export async function testBackendConnection(targetUrl?: string): Promise<{
  ok: boolean;
  latencyMs: number;
  message: string;
  data?: {
    status?: string;
    version?: string;
    mockMode?: boolean;
    providers?: Record<string, { configured: boolean; keyCount: number }>;
  };
}> {
  const baseUrl = (targetUrl || getApiBaseUrl()).replace(/\/+$/, '');
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        ok: false,
        latencyMs,
        message: `Backend returned HTTP status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      latencyMs,
      message: `Connected successfully (${latencyMs}ms)`,
      data,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const msg = error instanceof Error ? error.message : 'Connection failed';
    return {
      ok: false,
      latencyMs,
      message: `Could not connect to ${baseUrl}: ${msg}`,
    };
  }
}
