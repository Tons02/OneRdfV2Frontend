import { useState } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { setCredentials } from '@/store/slices/authSlice'
import { authService } from '../services/authService'
import type { LoginFormValues } from '../schemas/loginSchema'

export function useLogin() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const login = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { user, token } = await authService.login(values)
      dispatch(setCredentials({ user, token }))
      toast.success('Signed in successfully')
      return true
    } catch {
      toast.error('Invalid email or password')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading }
}
