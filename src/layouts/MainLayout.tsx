import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold">OneRDF</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
