import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { ROUTES } from '@/lib/constants'

export function PrivateRoute() {
  const token = useAppSelector((state) => state.auth.token)
  return token ? <Outlet /> : <Navigate to={ROUTES.login} replace />
}
