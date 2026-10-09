import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: readStoredUser(),
  token: localStorage.getItem(STORAGE_KEYS.accessToken),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem(STORAGE_KEYS.accessToken, action.payload.token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(action.payload.user))
    },
    /** Refreshes the stored user (e.g. from GET /me) without touching the token. */
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem(STORAGE_KEYS.accessToken)
      localStorage.removeItem(STORAGE_KEYS.user)
    },
  },
  selectors: {
    selectCurrentUser: (state) => state.user,
    selectIsAuthenticated: (state) => Boolean(state.token),
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export const { selectCurrentUser, selectIsAuthenticated } = authSlice.selectors
export default authSlice.reducer
