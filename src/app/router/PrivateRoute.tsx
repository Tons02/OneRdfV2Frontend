import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/store/hooks'
import { selectIsAuthenticated } from '@/features/auth'
import { ROUTES } from '@/lib/constants'

export function PrivateRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  )
}
