/**
 * Central configuration for FridgeAI mobile.
 *
 * During local development the backend runs at http://localhost:3000.
 * On a physical device on the same WiFi, replace with your machine's LAN IP,
 * e.g. http://192.168.1.42:3000
 *
 * Set USE_BACKEND=false to skip the real network call and rely entirely on
 * the mock service (useful when the backend is not running).
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const USE_BACKEND =
  (process.env.EXPO_PUBLIC_USE_BACKEND ?? 'true') === 'true';
