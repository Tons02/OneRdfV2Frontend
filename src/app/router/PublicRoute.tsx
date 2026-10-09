import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/store/hooks'
import { selectIsAuthenticated } from '@/features/auth'
import { ROUTES } from '@/lib/constants'

export function PublicRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <Outlet />
}
