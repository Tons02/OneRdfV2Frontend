import { lazy, Suspense, use } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { ANIMATIONS, type AnimationName } from './animations'

// The Lottie engine is ~180 kB; load it in its own chunk on first use.
const LottieLight = lazy(() =>
  import('lottie-react').then((module) => ({ default: module.LottieLight })),
)

// One fetch per file for the whole app, however many instances are mounted.
// A failed fetch resolves to null (these are decorative) instead of throwing.
const cache = new Map<string, Promise<object | null>>()
function loadAnimation(src: string) {
  let promise = cache.get(src)
  if (!promise) {
    promise = fetch(src)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)
    cache.set(src, promise)
  }
  return promise
}

interface LottieAnimationProps {
  name: AnimationName
  /** Size it with Tailwind (e.g. `size-40`); an animation fills its box. */
  className?: string
}

function Player({ name, className }: Required<LottieAnimationProps>) {
  const reducedMotion = usePrefersReducedMotion()
  const data = use(loadAnimation(ANIMATIONS[name].src))
  if (!data) return <div aria-hidden className={className} />

  return (
    <LottieLight
      // `autoplay` is load-time only, so remount when the preference changes.
      key={String(reducedMotion)}
      src={data}
      autoplay={!reducedMotion}
      loop={!reducedMotion}
      aria-hidden
      className={className}
    />
  )
}

/**
 * Decorative Lottie animation using the light engine (none of our files use
 * expressions). With reduced motion it shows a still first frame. Until the
 * engine and file load, an empty box of the same size holds its place.
 */
export function LottieAnimation({ name, className }: LottieAnimationProps) {
  const classes = cn('pointer-events-none shrink-0', ANIMATIONS[name].tint, className)

  return (
    <Suspense fallback={<div aria-hidden className={classes} />}>
      <Player name={name} className={classes} />
    </Suspense>
  )
}
