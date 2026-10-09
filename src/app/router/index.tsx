import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { SystemCategoryPage } from '@/features/system-categories'
import { SystemPage } from '@/features/systems'
import { ROUTES } from '@/lib/constants'
import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: ROUTES.login, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.home, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.systemCategories, element: <SystemCategoryPage /> },
          { path: ROUTES.systems, element: <SystemPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
