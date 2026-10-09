/** Mirrors backend `UserResource` (+ `should_change_password` added on login). */
export interface AuthUser {
  id: number
  profile_picture: string | null
  id_prefix: string
  id_no: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  email: string | null
  username: string
  e_signature: string | null
  access_permissions: string[] | null
  full_id_number: string
  full_name: string
  full_id_number_full_name: string
  should_change_password?: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

/** POST /login */
export interface LoginResponse {
  message: string
  token: string
  data: AuthUser
}
