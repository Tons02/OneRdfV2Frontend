import { toast } from 'sonner'
import { useAppDispatch } from '@/app/store/hooks'
import { baseApi } from '@/lib/api/baseApi'
import { logout as clearSession } from '../store/authSlice'
import { useLogoutMutation } from '../api/authApi'

/**
 * Returns a logout action that rejects on failure (for ConfirmDialog).
 * POST /logout revokes the token on the server; then the session and all
 * cached API data are cleared, and PrivateRoute redirects to /login.
 */
export function useLogout() {
  const dispatch = useAppDispatch()
  const [logoutMutation] = useLogoutMutation()

  return async () => {
    try {
      await logoutMutation().unwrap()
    } catch (error) {
      // 401: the token is already invalid server-side, so the user is signed
      // out anyway. Anything else (offline, 5xx) keeps the session and rejects.
      if ((error as { status?: unknown }).status !== 401) throw error
    }
    dispatch(clearSession())
    dispatch(baseApi.util.resetApiState())
    toast.success('You have been signed out.')
  }
}
