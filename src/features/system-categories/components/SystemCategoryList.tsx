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
import { useGetSystemCategoriesQuery } from '../api/systemCategoriesApi'
import type { SystemCategory, SystemCategoryStatus } from '../types/systemCategory.types'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

interface SystemCategoryListProps {
  /** The page remounts this per status (`key`), so tabs never show each other's rows. */
  status: SystemCategoryStatus
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onEdit: (category: SystemCategory) => void
  onArchive: (category: SystemCategory) => void
  onRestore: (category: SystemCategory) => void
}

export function SystemCategoryList({
  status,
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onEdit,
  onArchive,
  onRestore,
}: SystemCategoryListProps) {
  const { data, currentData, isFetching, isError, error, refetch } = useGetSystemCategoriesQuery({
    status,
    page,
    per_page: perPage,
    search,
  })

  // Previous page/search results stay on screen (dimmed) while the next loads.
  const rows = data?.data ?? []
  const refreshing = isFetching && !currentData
  const showLoading = !data || (isFetching && rows.length === 0)
  const showError = isError && !isFetching

  // Archiving the last row of the last page leaves an empty page: step back.
  useEffect(() => {
    if (currentData && currentData.data.length === 0 && currentData.total > 0 && page > 1) {
      onPageChange(currentData.last_page)
    }
  }, [currentData, page, onPageChange])

  const actionsFor = (category: SystemCategory, withLabels: boolean) =>
    status === 'active' ? (
      <>
        <RowAction label={`Edit ${category.name}`} text="Edit" withLabel={withLabels} onClick={() => onEdit(category)}>
          <Pencil />
        </RowAction>
        <RowAction
          label={`Archive ${category.name}`}
          text="Archive"
          withLabel={withLabels}
          onClick={() => onArchive(category)}
          className="hover:text-destructive"
        >
          <Archive />
        </RowAction>
      </>
    ) : (
      <RowAction label={`Restore ${category.name}`} text="Restore" withLabel={withLabels} onClick={() => onRestore(category)}>
        <ArchiveRestore />
      </RowAction>
    )

  let body: ReactNode
  if (showError) {
    body = (
      <Alert variant="destructive" className="my-6">
        <AlertCircle />
        <AlertTitle>Couldn't load system categories</AlertTitle>
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
    body = <TableLoadingState label="Loading system categories…" />
  } else if (rows.length === 0) {
    body = <TableEmptyState filtered={Boolean(search)} />
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
              <TableHead className="px-4">Name</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-40">Created</TableHead>
              <TableHead className="w-28 px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {!body && (
            <TableBody>
              {rows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="px-4 font-medium">{category.name}</TableCell>
                  <TableCell>
                    <StatusBadge archived={Boolean(category.deleted_at)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormat.format(new Date(category.created_at))}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-1">{actionsFor(category, false)}</div>
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
            {rows.map((category) => (
              <li key={category.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium break-words">{category.name}</p>
                  <StatusBadge archived={Boolean(category.deleted_at)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {dateFormat.format(new Date(category.created_at))}
                </p>
                <div className="flex gap-2">{actionsFor(category, true)}</div>
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
