import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Active / Archived badge for soft-deletable masterlist rows (from `deleted_at`). */
export function StatusBadge({ archived }: { archived: boolean }) {
  return archived ? (
    <Badge variant="secondary">Archived</Badge>
  ) : (
    <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
      Active
    </Badge>
  )
}

/** Icon button with tooltip on desktop; labelled outline button on mobile cards. */
export function RowAction({
  label,
  text,
  withLabel,
  onClick,
  className,
  children,
}: {
  label: string
  text: string
  withLabel: boolean
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  if (withLabel) {
    return (
      <Button type="button" variant="outline" className="h-10 flex-1" aria-label={label} onClick={onClick}>
        {children}
        {text}
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('text-muted-foreground', className)}
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
