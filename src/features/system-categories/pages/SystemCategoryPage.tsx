import { useCallback, useRef, useState, type ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TableSearch } from '@/components/shared/data-table/TableSearch'
import { getApiFieldErrors } from '@/lib/api/errors'
import { PAGINATION } from '@/lib/constants'
import {
  useCreateSystemCategoryMutation,
  useToggleSystemCategoryArchiveMutation,
  useUpdateSystemCategoryMutation,
} from '../api/systemCategoriesApi'
import { SystemCategoryFormDialog } from '../components/SystemCategoryFormDialog'
import { SystemCategoryList } from '../components/SystemCategoryList'
import {
  systemCategorySchema,
  type SystemCategoryFormValues,
} from '../schemas/systemCategorySchema'
import type { SystemCategory, SystemCategoryStatus } from '../types/systemCategory.types'

/** What the confirmation dialog is about to do. Only one dialog is ever open. */
type PendingAction =
  | { kind: 'create'; values: SystemCategoryFormValues }
  | { kind: 'update'; category: SystemCategory; values: SystemCategoryFormValues }
  | { kind: 'archive' | 'restore'; category: SystemCategory }

export function SystemCategoryPage() {
  const [status, setStatus] = useState<SystemCategoryStatus>('active')
  // Applied query; TableSearch only calls applySearch on Enter / clear.
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(PAGINATION.defaultPerPage)

  const applySearch = (value: string) => {
    const next = value.trim()
    if (next === search) return // same query: no new request
    setSearch(next)
    setPage(1)
  }

  const form = useForm<SystemCategoryFormValues>({
    resolver: yupResolver(systemCategorySchema),
    defaultValues: { name: '' },
  })
  const [formMode, setFormMode] = useState<{ mode: 'create' } | { mode: 'edit'; category: SystemCategory } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  // `pending` outlives `confirmOpen` so the dialog text stays put while it animates closed.
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Set when the confirmation finished on its own (success or sent back to the form),
  // so its closing isn't mistaken for the user pressing Cancel.
  const settledRef = useRef(false)

  const [createCategory] = useCreateSystemCategoryMutation()
  const [updateCategory] = useUpdateSystemCategoryMutation()
  const [toggleArchive] = useToggleSystemCategoryArchiveMutation()

  const openCreate = () => {
    form.reset({ name: '' })
    setFormMode({ mode: 'create' })
    setFormOpen(true)
  }

  const openEdit = useCallback(
    (category: SystemCategory) => {
      form.reset({ name: category.name })
      setFormMode({ mode: 'edit', category })
      setFormOpen(true)
    },
    [form],
  )

  const askConfirmation = (action: PendingAction) => {
    settledRef.current = false
    setPending(action)
    setConfirmOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setFormMode(null)
  }

  // Valid form → hide the form (it stays mounted with its values) and confirm first.
  const handleValidSubmit = (values: SystemCategoryFormValues) => {
    if (formMode?.mode === 'edit') {
      if (values.name === formMode.category.name) {
        toast.info('No changes to save.')
        closeForm()
        return
      }
      askConfirmation({ kind: 'update', category: formMode.category, values })
    } else {
      askConfirmation({ kind: 'create', values })
    }
    setFormOpen(false)
  }

  const handleConfirmOpenChange = (open: boolean) => {
    if (open) return
    // Cancel on a create/update confirmation returns to the form, values intact.
    if (!settledRef.current && (pending?.kind === 'create' || pending?.kind === 'update')) {
      setFormOpen(true)
    }
    setConfirmOpen(false)
  }

  const runPending = async () => {
    if (!pending) return
    try {
      if (pending.kind === 'create') {
        await createCategory({ name: pending.values.name }).unwrap()
        toast.success(`System category “${pending.values.name}” created.`)
      } else if (pending.kind === 'update') {
        await updateCategory({ id: pending.category.id, name: pending.values.name }).unwrap()
        toast.success(`System category renamed to “${pending.values.name}”.`)
      } else {
        await toggleArchive(pending.category.id).unwrap()
        toast.success(
          `System category “${pending.category.name}” ${pending.kind === 'archive' ? 'archived' : 'restored'}.`,
        )
      }
      settledRef.current = true
      if (pending.kind === 'create' || pending.kind === 'update') {
        setFormMode(null)
        form.reset({ name: '' })
      }
    } catch (error) {
      // Validation errors (e.g. duplicate name) belong on the field: back to the form.
      const fieldErrors = getApiFieldErrors(error as Parameters<typeof getApiFieldErrors>[0])
      if (fieldErrors.name && (pending.kind === 'create' || pending.kind === 'update')) {
        settledRef.current = true
        setFormOpen(true)
        form.setError('name', { type: 'server', message: fieldErrors.name })
        return
      }
      throw error // ConfirmDialog shows the toast and stays open for a retry
    }
  }

  const changeStatus = (next: string) => {
    setStatus(next as SystemCategoryStatus)
    setPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl">System Category</h1>
          <p className="text-sm text-muted-foreground">
            Manage the categories used to group systems in One RDF.
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 sm:h-9">
          <Plus />
          Add System Category
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={changeStatus}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <TableSearch value={search} onSearch={applySearch} label="Search system categories" />
      </div>

      <SystemCategoryList
        key={status}
        status={status}
        page={page}
        perPage={perPage}
        search={search}
        onPageChange={setPage}
        onPerPageChange={(next) => {
          setPerPage(next)
          setPage(1)
        }}
        onEdit={openEdit}
        onArchive={(category) => askConfirmation({ kind: 'archive', category })}
        onRestore={(category) => askConfirmation({ kind: 'restore', category })}
      />

      <SystemCategoryFormDialog
        open={formOpen}
        mode={formMode?.mode ?? 'create'}
        form={form}
        onValidSubmit={handleValidSubmit}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={handleConfirmOpenChange}
        onConfirm={runPending}
        {...confirmCopy(pending)}
      />
    </div>
  )
}

/**
 * Confirmation copy per action. Consequences stated here are the backend's
 * actual behaviour: archive soft-deletes (row moves to the Archived tab and
 * can be restored), restore undoes it, names must be unique.
 */
function confirmCopy(action: PendingAction | null): Omit<ComponentProps<typeof ConfirmDialog>, 'open' | 'onOpenChange' | 'onConfirm'> {
  const title = 'Please confirm your action'
  switch (action?.kind) {
    case 'create':
      return {
        title,
        description: 'You are about to create a new system category. Please review the details below.',
        details: [
          { label: 'Action', value: 'Create system category' },
          { label: 'Name', value: action.values.name },
        ],
        note: 'Please double-check the name before proceeding. You can still edit or archive it later.',
        cancelLabel: 'Go Back',
        confirmLabel: 'Confirm Create',
        loadingText: 'Creating…',
      }
    case 'update':
      return {
        title,
        description: 'You are about to update this system category. Please review the change below.',
        details: [
          { label: 'Action', value: 'Update system category' },
          { label: 'Current name', value: action.category.name },
          { label: 'New name', value: action.values.name },
        ],
        note: 'Please double-check the new name before proceeding.',
        cancelLabel: 'Go Back',
        confirmLabel: 'Confirm Changes',
        loadingText: 'Saving…',
      }
    case 'archive':
      return {
        title,
        description: 'You are about to archive this system category.',
        details: [
          { label: 'Action', value: 'Archive system category' },
          { label: 'Name', value: action.category.name },
          { label: 'Status', value: 'Active → Archived' },
        ],
        note: 'It will be removed from the Active list and moved to the Archived tab, where it can be restored at any time.',
        confirmLabel: 'Confirm Archive',
        loadingText: 'Archiving…',
        variant: 'destructive',
      }
    case 'restore':
      return {
        title,
        description: 'You are about to restore this system category.',
        details: [
          { label: 'Action', value: 'Restore system category' },
          { label: 'Name', value: action.category.name },
          { label: 'Status', value: 'Archived → Active' },
        ],
        note: 'It will be moved back to the Active list.',
        confirmLabel: 'Confirm Restore',
        loadingText: 'Restoring…',
      }
    default:
      return { title, description: '', confirmLabel: 'Confirm' }
  }
}
