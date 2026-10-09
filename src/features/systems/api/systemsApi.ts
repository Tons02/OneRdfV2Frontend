import { baseApi } from '@/lib/api/baseApi'
import type { ApiResponse, Paginated } from '@/types/api'
import type { SystemDetail, SystemListParams, SystemRecord } from '../types/system.types'

const LIST = { type: 'System', id: 'LIST' } as const

export const systemsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /systems — no `pagination` param, so the paginator meta is kept. */
    getSystems: build.query<Paginated<SystemRecord>, SystemListParams>({
      query: ({ search, system_category_id, ...params }) => ({
        url: '/systems',
        params: { ...params, search: search || undefined, system_category_id },
      }),
      transformResponse: (response: ApiResponse<Paginated<SystemRecord>>) => response.data,
      providesTags: [LIST],
    }),
    /** GET /systems/{id} — used for the signed logo/background URLs when editing. */
    getSystem: build.query<SystemDetail, number>({
      query: (id) => `/systems/${id}`,
      transformResponse: (response: ApiResponse<SystemDetail>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'System', id }],
    }),
    /** POST /systems (multipart: logo/background are optional files). */
    createSystem: build.mutation<ApiResponse<SystemRecord>, FormData>({
      query: (body) => ({ url: '/systems', method: 'POST', body }),
      invalidatesTags: [LIST],
    }),
    /**
     * PATCH /systems/{id}. PHP can't parse multipart PATCH bodies, so this is a
     * POST with `_method=PATCH` (Laravel method spoofing) — same route.
     */
    updateSystem: build.mutation<ApiResponse<SystemRecord>, { id: number; body: FormData }>({
      query: ({ id, body }) => {
        body.set('_method', 'PATCH')
        return { url: `/systems/${id}`, method: 'POST', body }
      },
      invalidatesTags: (_result, _error, { id }) => [LIST, { type: 'System', id }],
    }),
    /** PUT /systems-archived/{id}: archives an active system, restores an archived one. */
    toggleSystemArchive: build.mutation<ApiResponse<SystemRecord>, number>({
      query: (id) => ({ url: `/systems-archived/${id}`, method: 'PUT' }),
      invalidatesTags: (_result, _error, id) => [LIST, { type: 'System', id }],
    }),
  }),
})

export const {
  useGetSystemsQuery,
  useGetSystemQuery,
  useCreateSystemMutation,
  useUpdateSystemMutation,
  useToggleSystemArchiveMutation,
} = systemsApi
