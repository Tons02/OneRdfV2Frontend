import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
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
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem(STORAGE_KEYS.accessToken)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
