import { baseApi } from '@/lib/api/baseApi'
import type { ApiResponse } from '@/types/api'
import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth.types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
    }),
    /** GET /me — the signed-in user (UserResource): fresh access_permissions and profile picture URL. */
    getMe: build.query<AuthUser, void>({
      query: () => '/me',
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi
