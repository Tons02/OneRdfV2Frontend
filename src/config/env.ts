/**
 * Typed access to Vite environment variables. Read env values only through
 * this module. Missing values don't throw at import time (that would leave a
 * blank page); `assertEnv()` runs as a startup task so the app can show a
 * proper error screen instead.
 */
const REQUIRED = ['VITE_API_BASE_URL'] as const

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
} as const

export function assertEnv() {
  const missing = REQUIRED.filter((name) => !import.meta.env[name])
  if (missing.length) {
    throw new Error(`Missing environment variable ${missing.join(', ')}. Add it to your .env file.`)
  }
}
