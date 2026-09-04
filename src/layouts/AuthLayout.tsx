import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
