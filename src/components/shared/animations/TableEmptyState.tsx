import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LottieAnimation } from './LottieAnimation'

interface TableEmptyStateProps {
  /** True when search/filters are active, so "nothing matches" not "nothing exists". */
  filtered?: boolean
  title?: string
  description?: string
  /** e.g. a "Clear filters" or "Create" button. */
  action?: ReactNode
  className?: string
}

/**
 * Shown only after a successful response with zero records. Never during
 * loading or on error (use an Alert for errors). Same footprint as
 * TableLoadingState so swapping between them doesn't shift the layout.
 */
export function TableEmptyState({
  filtered = false,
  title = filtered ? 'No matching records found' : 'No data available',
  description = filtered
    ? 'Try a different search term or clear the filters.'
    : 'Records will appear here once they are added.',
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn('flex min-h-64 flex-col items-center justify-center gap-2 py-8 text-center', className)}
    >
      <LottieAnimation name="noData" className="size-40 sm:size-48 lg:size-56" />
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
