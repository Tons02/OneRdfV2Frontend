/** Mirrors backend `SystemCategoryResource` (and the list's raw model rows). */
export interface SystemCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Backend `?status=`: `inactive` lists archived (soft-deleted) rows; anything else, active. */
export type SystemCategoryStatus = 'active' | 'inactive'

export interface SystemCategoryListParams {
  page: number
  per_page: number
  status: SystemCategoryStatus
  search?: string
}

/** `SystemCategoryRequest` accepts only `name` (required, string, unique). */
export interface SystemCategoryPayload {
  name: string
}
