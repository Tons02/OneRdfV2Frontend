/** Standard success envelope from the backend's `responseSuccess()`. */
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

/** Query params every paginated list endpoint accepts. */
export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  status?: 'active' | 'inactive'
}

/** Laravel LengthAwarePaginator JSON (`->dynamicPaginate()`). */
export interface Paginated<T> {
  current_page: number
  data: T[]
  from: number | null
  to: number | null
  last_page: number
  per_page: number
  total: number
}
