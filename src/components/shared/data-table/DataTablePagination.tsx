import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAGINATION } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Paginated } from '@/types/api'

interface DataTablePaginationProps {
  /** Pagination meta from the backend's LengthAwarePaginator. */
  meta: Pick<Paginated<unknown>, 'current_page' | 'last_page' | 'from' | 'to' | 'total' | 'per_page'>
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  /** Disables navigation while a page is being fetched. */
  disabled?: boolean
  className?: string
}

/** Server-side pagination footer rendered at the bottom of a masterlist table card. */
export function DataTablePagination({
  meta,
  onPageChange,
  onPerPageChange,
  disabled = false,
  className,
}: DataTablePaginationProps) {
  const { current_page: page, last_page: lastPage, from, to, total, per_page: perPage } = meta
  const pages = Math.max(lastPage, 1)
  const atFirst = disabled || page <= 1
  const atLast = disabled || page >= pages

  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 border-t bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span id="rows-per-page" className="text-sm text-muted-foreground">
            Rows per page
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger aria-labelledby="rows-per-page" className="h-10 w-20 bg-background sm:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION.perPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm font-medium">
          Page {page} of {pages}
        </span>

        <div className="flex items-center gap-1">
          <PageButton icon={ChevronsLeft} label="First page" disabled={atFirst} onClick={() => onPageChange(1)} />
          <PageButton icon={ChevronLeft} label="Previous page" disabled={atFirst} onClick={() => onPageChange(page - 1)} />
          <PageButton icon={ChevronRight} label="Next page" disabled={atLast} onClick={() => onPageChange(page + 1)} />
          <PageButton icon={ChevronsRight} label="Last page" disabled={atLast} onClick={() => onPageChange(pages)} />
        </div>
      </div>
    </div>
  )
}

function PageButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-10 bg-background sm:size-8"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon />
    </Button>
  )
}
