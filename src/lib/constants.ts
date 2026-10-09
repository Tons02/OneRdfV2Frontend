export const APP_NAME = 'One RDF'

export const STORAGE_KEYS = {
  theme: 'onerdf-theme',
  accessToken: 'onerdf-access-token',
  user: 'onerdf-user',
} as const

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  systemCategories: '/masterlist/system-categories',
  systems: '/masterlist/systems',
} as const

/** Server-side pagination defaults (backend: ?page=&per_page=). */
export const PAGINATION = {
  defaultPerPage: 15,
  perPageOptions: [10, 15, 25, 50, 100],
} as const
