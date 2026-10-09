import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { env } from '@/config/env'
// Import the slice file directly (not the feature barrel) to avoid a cycle.
import { logout } from '@/features/auth/store/authSlice'

interface TokenState {
  auth: { token: string | null }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as TokenState).auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    headers.set('Accept', 'application/json')
    return headers
  },
})

// Clears the session whenever an authenticated request comes back 401.
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  const hadToken = Boolean((api.getState() as TokenState).auth.token)
  if (result.error?.status === 401 && hadToken) {
    api.dispatch(logout())
  }
  return result
}

/**
 * The single RTK Query API for the app. Features add endpoints with
 * `baseApi.injectEndpoints` in `features/<name>/api/<name>Api.ts`.
 * Register every cache tag a feature uses in `tagTypes`.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Role', 'System', 'SystemCategory', 'Location'],
  endpoints: () => ({}),
})
