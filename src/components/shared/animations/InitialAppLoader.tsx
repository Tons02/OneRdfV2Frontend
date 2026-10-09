import { useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { LottieAnimation } from './LottieAnimation'

interface InitialAppLoaderProps {
  /** false starts the fade-out; the loader unmounts itself when it finishes. */
  visible: boolean
}

/**
 * Full-screen RDF loader shown while the app starts. Purely visual: whoever
 * renders it decides when it's visible (see AppBootstrap). It overlays the
 * app while fading out, so the page underneath appears without a blank frame.
 */
export function InitialAppLoader({ visible }: InitialAppLoaderProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [fadedOut, setFadedOut] = useState(false)

  // Startup only goes visible -> hidden once. With reduced motion there is no
  // transition (so no transitionend), and it unmounts straight away.
  if (!visible && (fadedOut || reducedMotion)) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={visible}
      onTransitionEnd={(event) => {
        if (!visible && event.target === event.currentTarget) setFadedOut(true)
      }}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background transition-opacity duration-300 motion-reduce:transition-none',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <LottieAnimation name="initialLoader" className="size-36 sm:size-44" />
      <span className="sr-only">Loading {APP_NAME}…</span>
    </div>
  )
}
