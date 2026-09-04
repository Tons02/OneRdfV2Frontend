import { api } from '@/lib/axios'
import type { LoginFormValues } from '../schemas/loginSchema'
import type { AuthUser } from '@/store/slices/authSlice'

export interface LoginResponse {
  user: AuthUser
  token: string
}

export const authService = {
  login: (payload: LoginFormValues) =>
    api.post<LoginResponse>('/auth/login', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout'),
}
