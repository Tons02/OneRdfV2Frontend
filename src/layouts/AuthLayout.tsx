import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { APP_NAME } from '@/lib/constants'
import oneRdfLogo from '@/assets/images/one-rdf-logo.png'
import misLogo from '@/assets/images/mis-logo.png'

// Theme switches fade surface colors; text inherits and fades with them.
const fade = 'transition-colors duration-300 motion-reduce:transition-none'

export function AuthLayout() {
  return (
    <div className={`grid min-h-svh grid-rows-[auto_1fr] bg-background text-foreground lg:grid-cols-2 lg:grid-rows-1 ${fade}`}>
      {/* The logo is white, so it sits on the charcoal brand panel in both themes. */}
      <aside
        className={`flex items-center justify-center border-b-4 border-primary bg-brand-panel px-6 py-8 lg:order-2 lg:border-b-0 lg:border-l-4 lg:p-12 ${fade}`}
      >
        <img
          src={oneRdfLogo}
          alt={`${APP_NAME} System`}
          width={3254}
          height={3254}
          className="h-28 w-auto sm:h-36 lg:h-auto lg:w-full lg:max-w-sm"
        />
      </aside>

      <main className="relative flex min-w-0 flex-col px-4 py-8 sm:px-6 lg:px-12">
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>

        <footer className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <img src={misLogo} alt="MIS" width={40} height={40} className="size-10" />
          <p>
            Powered by MIS &middot; &copy; {new Date().getFullYear()} {APP_NAME}.
            All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
