import { cn } from '@/lib/utils'
import { LottieAnimation } from './LottieAnimation'

/**
 * Shown while a table has no data yet (RTK Query `isLoading`). Render it in
 * place of the rows, e.g. `<TableRow><TableCell colSpan={n}>`, so headers stay
 * put. For background refetches of data already on screen, keep the rows and
 * don't show this.
 */
export function TableLoadingState({
  label = 'Loading records…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex min-h-64 flex-col items-center justify-center gap-2 py-8', className)}
    >
      <LottieAnimation name="tableLoading" className="aspect-[5/4] w-48 sm:w-60 lg:w-72" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
