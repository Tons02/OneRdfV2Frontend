import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { ROUTES } from '@/lib/constants'

export function PublicRoute() {
  const token = useAppSelector((state) => state.auth.token)
  return token ? <Navigate to={ROUTES.dashboard} replace /> : <Outlet />
}
