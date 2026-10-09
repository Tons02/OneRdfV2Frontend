import { store } from '@/app/store'
import { assertEnv } from '@/config/env'
import { authApi } from '@/features/auth/api/authApi'
import { logout, setUser } from '@/features/auth/store/authSlice'

export interface StartupTask {
  name: string
  /**
   * Essential tasks must succeed before the app renders; a failure shows the
   * startup error screen. Optional tasks are awaited too, but a failure is
   * logged and ignored.
   */
  essential: boolean
  run: () => void | Promise<void>
}

/**
 * Everything the app must finish before its first render, run once in
 * parallel while the initial loader is shown. Theme is not here: it's applied
 * before first paint by index.html and ThemeProvider reads it synchronously.
 * Page data is not here either; pages use their own loading states.
 *
 * To add a task, append an entry (e.g. fetching remote config with
 * `store.dispatch(api.endpoints.x.initiate()).unwrap()`). Keep it to what the
 * app genuinely cannot render without.
 */
export const startupTasks: StartupTask[] = [
  {
    name: 'config',
    essential: true,
    run: assertEnv,
  },
  {
    // Restores the session from storage, then confirms it with GET /me so the
    // user's access_permissions and (short-lived, signed) profile picture URL
    // are current. A token without a user is a broken session: cleared.
    // A 401 from /me already logs out (baseApi) and the router sends the user
    // to /login. Any other failure (offline, server down) keeps the cached
    // user rather than blocking startup.
    name: 'session',
    essential: true,
    run: async () => {
      const { token, user } = store.getState().auth
      if (!token) {
        if (user) store.dispatch(logout())
        return
      }
      const request = store.dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
      try {
        store.dispatch(setUser(await request.unwrap()))
      } catch (error) {
        if ((error as { status?: unknown }).status !== 401) {
          console.warn('Could not refresh the current user; using the cached session.', error)
        }
      } finally {
        request.unsubscribe()
      }
    },
  },
  {
    // Avoids rendering the first screen in fallback fonts, then reflowing.
    name: 'fonts',
    essential: false,
    run: async () => {
      await document.fonts?.ready
    },
  },
]
