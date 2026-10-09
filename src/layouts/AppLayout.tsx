import { Outlet } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { NetworkStatusIndicator } from '@/components/shared/NetworkStatusIndicator'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { AppSidebar } from './AppSidebar'
import { UserMenu } from './UserMenu'

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/40 transition-colors duration-300 motion-reduce:transition-none">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 transition-colors duration-300 motion-reduce:transition-none sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 size-10 sm:size-9" />
            <Separator orientation="vertical" className="h-4" />
          </div>

          {/* Connection status · theme toggle · account menu */}
          <div className="flex items-center gap-1">
            <NetworkStatusIndicator />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* Flex column so pages can stretch (e.g. a table card) to the bottom of the viewport. */}
        <main className="flex flex-1 flex-col p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
