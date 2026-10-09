import type { ReactNode } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InitialAppLoader } from '@/components/shared/animations/InitialAppLoader'
import { useAppBootstrap } from '@/app/bootstrap/useAppBootstrap'

/**
 * Holds the app (and so the router) back until the startup tasks finish, so
 * no route renders against a half-restored session: no login-page flash, no
 * wrong redirects. Shows the RDF loader meanwhile and an error screen with a
 * retry if an essential task fails.
 */
export function AppBootstrap({ children }: { children: ReactNode }) {
  const { state, retry } = useAppBootstrap()

  if (state.status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle />
          <AlertTitle>One RDF couldn't start</AlertTitle>
          <AlertDescription>
            <p>{state.error.message}</p>
            <Button variant="outline" size="lg" className="mt-2" onClick={retry}>
              <RotateCw />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const ready = state.status === 'ready'
  return (
    <>
      {ready && children}
      <InitialAppLoader visible={!ready} />
    </>
  )
}
