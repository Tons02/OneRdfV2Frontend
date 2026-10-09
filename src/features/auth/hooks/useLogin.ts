import { useRef } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/store/hooks'
import { setCredentials } from '../store/authSlice'
import { useLoginMutation } from '../api/authApi'
import type { LoginRequest } from '../types/auth.types'

export function useLogin() {
  const dispatch = useAppDispatch()
  const [loginMutation, { isLoading, error }] = useLoginMutation()
  // isLoading only flips after a re-render; this blocks a second submit
  // (e.g. two Enter presses) that arrives before then.
  const inFlight = useRef(false)

  const login = async (values: LoginRequest) => {
    if (inFlight.current) return false
    inFlight.current = true
    try {
      const { token, data: user } = await loginMutation(values).unwrap()
      dispatch(setCredentials({ user, token }))
      toast.success(`Welcome back, ${user.first_name}.`)
      return true
    } catch {
      // Error is exposed via `error` for the form to render inline.
      return false
    } finally {
      inFlight.current = false
    }
  }

  return { login, isLoading, error }
}
