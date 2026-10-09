/**
 * A row of GET /systems. The list returns raw models (no `pagination` param),
 * so `logo` / `background` are storage paths here, not URLs. `token` is never
 * returned (hidden on the model).
 */
export interface SystemRecord {
  id: number
  name: string
  description: string
  frontend_url: string
  backend_url: string
  logo: string | null
  background: string | null
  system_category_id: number
  system_category: { id: number; name: string; deleted_at: string | null } | null
  login_endpoint: string
  create_user_endpoint: string
  pending_user_endpoint: string
  update_user_endpoint: string
  reset_password_endpoint: string
  change_password_endpoint: string
  charging_of_account_endpoint: string | null
  account_title_endpoint: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** GET /systems/{id} (SystemResource): `logo` / `background` are 5-minute signed URLs. */
export type SystemDetail = Omit<SystemRecord, 'system_category_id'>

/** Backend `?status=`: `inactive` lists archived (soft-deleted) rows; anything else, active. */
export type SystemStatus = 'active' | 'inactive'

export interface SystemListParams {
  page: number
  per_page: number
  status: SystemStatus
  search?: string
  /** api-tool-kit allowed filter (SystemFilter::$allowedFilters). */
  system_category_id?: number
}

/** The integration endpoint fields of SystemRequest, in form order. */
export const ENDPOINT_FIELDS = [
  { name: 'login_endpoint', label: 'Login endpoint' },
  { name: 'create_user_endpoint', label: 'Create user endpoint' },
  { name: 'pending_user_endpoint', label: 'Pending user endpoint' },
  { name: 'update_user_endpoint', label: 'Update user endpoint' },
  { name: 'reset_password_endpoint', label: 'Reset password endpoint' },
  { name: 'change_password_endpoint', label: 'Change password endpoint' },
  { name: 'charging_of_account_endpoint', label: 'Charging of account endpoint' },
  { name: 'account_title_endpoint', label: 'Account title endpoint' },
] as const

export type EndpointField = (typeof ENDPOINT_FIELDS)[number]['name']
