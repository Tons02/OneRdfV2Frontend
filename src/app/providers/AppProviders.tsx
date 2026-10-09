import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { store } from '@/app/store'
import { AppBootstrap } from './AppBootstrap'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <AppBootstrap>{children}</AppBootstrap>
        </TooltipProvider>
        <Toaster richColors position="top-right" closeButton offset={{ top: 64 }} mobileOffset={{ top: 64 }} />
      </ThemeProvider>
    </Provider>
  )
}
