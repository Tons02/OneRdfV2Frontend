import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LottieAnimation } from './LottieAnimation'

// asChild is excluded: the button renders its own label + loader wrappers.
interface LoadingButtonProps extends Omit<ComponentProps<typeof Button>, 'asChild'> {
  /** While true the button is disabled and shows the loading animation. */
  loading?: boolean
  /** Shown beside the animation while loading (also announced). Keep it short. */
  loadingText?: ReactNode
}

/**
 * shadcn Button for async actions (submit, save, delete, ...). While loading,
 * the original label stays in place but invisible so the button keeps its
 * exact size, and the animation (tinted to the button's text color) is laid
 * over it. While loading it is natively `disabled` (no clicks, no keyboard
 * activation, no Enter resubmits) and visibly muted without new colours: the
 * variant's own colours at reduced opacity and saturation, in both themes.
 * Callers should still guard their handler against bursts of events that
 * arrive before `loading` re-renders (see ConfirmDialog / useLogin).
 */
export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  className,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn('relative', loading && 'disabled:opacity-80 disabled:saturate-50', className)}
      {...props}
    >
      <span className={cn('contents', loading && 'invisible')}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-1.5">
          <LottieAnimation name="buttonLoading" className="h-5 w-7" />
          {loadingText ? <span>{loadingText}</span> : <span className="sr-only">Loading</span>}
        </span>
      )}
    </Button>
  )
}
