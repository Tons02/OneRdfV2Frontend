import { useEffect, type ReactNode } from 'react'
import { AlertCircle, Archive, ArchiveRestore, Pencil, RotateCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableEmptyState } from '@/components/shared/animations/TableEmptyState'
import { TableLoadingState } from '@/components/shared/animations/TableLoadingState'
import { DataTablePagination } from '@/components/shared/data-table/DataTablePagination'
import { RowAction, StatusBadge } from '@/components/shared/data-table/RowActions'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils'
import { useGetSystemsQuery } from '../api/systemsApi'
import type { SystemRecord, SystemStatus } from '../types/system.types'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

interface SystemListProps {
  /** The page remounts this per status (`key`), so tabs never show each other's rows. */
  status: SystemStatus
  page: number
  perPage: number
  search: string
  /** Undefined = all categories. */
  categoryId?: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onEdit: (system: SystemRecord) => void
  onArchive: (system: SystemRecord) => void
  onRestore: (system: SystemRecord) => void
}

export function SystemList({
  status,
  page,
  perPage,
  search,
  categoryId,
  onPageChange,
  onPerPageChange,
  onEdit,
  onArchive,
  onRestore,
}: SystemListProps) {
  const { data, currentData, isFetching, isError, error, refetch } = useGetSystemsQuery({
    status,
    page,
    per_page: perPage,
    search,
    system_category_id: categoryId,
  })

  // Previous page/filter results stay on screen (dimmed) while the next loads.
  const rows = data?.data ?? []
  const refreshing = isFetching && !currentData
  const showLoading = !data || (isFetching && rows.length === 0)
  const showError = isError && !isFetching
  const filtered = Boolean(search) || categoryId !== undefined

  // Archiving the last row of the last page leaves an empty page: step back.
  useEffect(() => {
    if (currentData && currentData.data.length === 0 && currentData.total > 0 && page > 1) {
      onPageChange(currentData.last_page)
    }
  }, [currentData, page, onPageChange])

  const actionsFor = (system: SystemRecord, withLabels: boolean) =>
    status === 'active' ? (
      <>
        <RowAction label={`Edit ${system.name}`} text="Edit" withLabel={withLabels} onClick={() => onEdit(system)}>
          <Pencil />
        </RowAction>
        <RowAction
          label={`Archive ${system.name}`}
          text="Archive"
          withLabel={withLabels}
          onClick={() => onArchive(system)}
          className="hover:text-destructive"
        >
          <Archive />
        </RowAction>
      </>
    ) : (
      <RowAction label={`Restore ${system.name}`} text="Restore" withLabel={withLabels} onClick={() => onRestore(system)}>
        <ArchiveRestore />
      </RowAction>
    )

  const categoryName = (system: SystemRecord) =>
    system.system_category ? (
      <>
        {system.system_category.name}
        {system.system_category.deleted_at && <span className="text-muted-foreground"> (archived)</span>}
      </>
    ) : (
      <span className="text-muted-foreground">—</span>
    )

  let body: ReactNode
  if (showError) {
    body = (
      <Alert variant="destructive" className="my-6">
        <AlertCircle />
        <AlertTitle>Couldn't load systems</AlertTitle>
        <AlertDescription>
          <p>{getApiErrorMessage(error)}</p>
          <Button variant="outline" size="sm" className="mt-2 h-10 sm:h-8" onClick={() => refetch()}>
            <RotateCw />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  } else if (showLoading) {
    body = <TableLoadingState label="Loading systems…" />
  } else if (rows.length === 0) {
    body = <TableEmptyState filtered={filtered} />
  }

  return (
    // The card stretches to the bottom of the page; the pagination footer sits inside it.
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
      <div
        aria-busy={isFetching}
        className={cn('flex flex-1 flex-col transition-opacity', refreshing && rows.length > 0 && 'opacity-60')}
      >
        {/* Desktop / tablet: table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-4">System</TableHead>
              <TableHead className="w-48">Category</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Created</TableHead>
              <TableHead className="w-28 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {!body && (
            <TableBody>
              {rows.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="max-w-0 px-4">
                    <p className="truncate font-medium">{system.name}</p>
                    <p className="truncate text-sm text-muted-foreground" title={system.description}>
                      {system.description}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-normal">{categoryName(system)}</TableCell>
                  <TableCell>
                    <StatusBadge archived={Boolean(system.deleted_at)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormat.format(new Date(system.created_at))}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-1">{actionsFor(system, false)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

        {body ? (
          // Loading / empty / error: centred in the space under the header (all breakpoints).
          <div className="flex flex-1 items-center justify-center px-4">{body}</div>
        ) : (
          /* Mobile: cards */
          <ul className="divide-y md:hidden">
            {rows.map((system) => (
              <li key={system.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium break-words">{system.name}</p>
                    <p className="text-sm text-muted-foreground">{categoryName(system)}</p>
                  </div>
                  <StatusBadge archived={Boolean(system.deleted_at)} />
                </div>
                <p className="text-sm break-words">{system.description}</p>
                <p className="text-sm text-muted-foreground">
                  Created {dateFormat.format(new Date(system.created_at))}
                </p>
                <div className="flex gap-2">{actionsFor(system, true)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.total > 0 && !showError && (
        <DataTablePagination
          meta={data}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          disabled={isFetching}
        />
      )}
    </div>
  )
}
