export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const STORAGE_KEYS = {
  theme: 'onerdf-theme',
  accessToken: 'onerdf-access-token',
} as const

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
} as const
