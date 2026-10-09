import { baseApi } from '@/lib/api/baseApi'
import type { ApiResponse, Paginated } from '@/types/api'
import type {
  SystemCategory,
  SystemCategoryListParams,
  SystemCategoryPayload,
} from '../types/systemCategory.types'

const LIST = { type: 'SystemCategory', id: 'LIST' } as const

export const systemCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /system_categories — no `pagination` param, so the paginator meta is kept. */
    getSystemCategories: build.query<Paginated<SystemCategory>, SystemCategoryListParams>({
      query: ({ search, ...params }) => ({
        url: '/system_categories',
        params: { ...params, search: search || undefined },
      }),
      transformResponse: (response: ApiResponse<Paginated<SystemCategory>>) => response.data,
      providesTags: [LIST],
    }),
    /**
     * All active categories, unpaginated (`?pagination=none` → plain array of
     * SystemCategoryResource). For dropdowns, e.g. the Systems filter and form.
     */
    getSystemCategoryOptions: build.query<SystemCategory[], void>({
      query: () => ({ url: '/system_categories', params: { status: 'active', pagination: 'none' } }),
      transformResponse: (response: ApiResponse<SystemCategory[]>) => response.data,
      providesTags: [LIST],
    }),
    /** POST /system_categories (can:system_categories.create) */
    createSystemCategory: build.mutation<ApiResponse<SystemCategory>, SystemCategoryPayload>({
      query: (body) => ({ url: '/system_categories', method: 'POST', body }),
      invalidatesTags: [LIST],
    }),
    /** PATCH /system_categories/{id} (can:system_categories.update) */
    updateSystemCategory: build.mutation<
      ApiResponse<SystemCategory>,
      { id: number } & SystemCategoryPayload
    >({
      query: ({ id, ...body }) => ({ url: `/system_categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: [LIST],
    }),
    /**
     * PUT /system_categories-archived/{id} (can:system_categories.archive).
     * The backend toggles: archives an active row, restores an archived one.
     */
    toggleSystemCategoryArchive: build.mutation<ApiResponse<SystemCategory>, number>({
      query: (id) => ({ url: `/system_categories-archived/${id}`, method: 'PUT' }),
      invalidatesTags: [LIST],
    }),
  }),
})

export const {
  useGetSystemCategoriesQuery,
  useGetSystemCategoryOptionsQuery,
  useCreateSystemCategoryMutation,
  useUpdateSystemCategoryMutation,
  useToggleSystemCategoryArchiveMutation,
} = systemCategoriesApi
