import { useCallback, useMemo, useRef, useState, type ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog, type ConfirmDetail } from '@/components/shared/ConfirmDialog'
import { TableSearch } from '@/components/shared/data-table/TableSearch'
import { useGetSystemCategoryOptionsQuery } from '@/features/system-categories'
import { getApiFieldErrors } from '@/lib/api/errors'
import { PAGINATION } from '@/lib/constants'
import {
  useCreateSystemMutation,
  useToggleSystemArchiveMutation,
  useUpdateSystemMutation,
} from '../api/systemsApi'
import { SystemFormDialog } from '../components/SystemFormDialog'
import { SystemList } from '../components/SystemList'
import { systemSchema, type SystemFormValues } from '../schemas/systemSchema'
import { ENDPOINT_FIELDS, type SystemRecord, type SystemStatus } from '../types/system.types'

const ALL = 'all'

const EMPTY: SystemFormValues = {
  name: '',
  description: '',
  system_category_id: '',
  frontend_url: '',
  backend_url: '',
  token: '',
  logo: null,
  background: null,
  login_endpoint: '',
  create_user_endpoint: '',
  pending_user_endpoint: '',
  update_user_endpoint: '',
  reset_password_endpoint: '',
  change_password_endpoint: '',
  charging_of_account_endpoint: '',
  account_title_endpoint: '',
}

/** Plain text fields compared/sent as-is (labels used in the change summary). */
const TEXT_FIELDS = [
  { name: 'name', label: 'Name' },
  { name: 'description', label: 'Description' },
  { name: 'frontend_url', label: 'Frontend URL' },
  { name: 'backend_url', label: 'Backend URL' },
  ...ENDPOINT_FIELDS,
] as const

const toFormValues = (system: SystemRecord): SystemFormValues => ({
  ...EMPTY,
  ...Object.fromEntries(TEXT_FIELDS.map(({ name }) => [name, system[name] ?? ''])),
  system_category_id: String(system.system_category_id),
})

/** Multipart body for SystemRequest. Token and files only when provided. */
function toFormData(values: SystemFormValues) {
  const body = new FormData()
  for (const { name } of TEXT_FIELDS) body.append(name, values[name])
  body.append('system_category_id', values.system_category_id)
  if (values.token) body.append('token', values.token)
  if (values.logo) body.append('logo', values.logo)
  if (values.background) body.append('background', values.background)
  return body
}

type PendingAction =
  | { kind: 'create'; values: SystemFormValues }
  | { kind: 'update'; system: SystemRecord; values: SystemFormValues; changes: ConfirmDetail[] }
  | { kind: 'archive' | 'restore'; system: SystemRecord }

export function SystemPage() {
  const [status, setStatus] = useState<SystemStatus>('active')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(PAGINATION.defaultPerPage)

  const { data: categories = [] } = useGetSystemCategoryOptionsQuery()
  const categoryName = useCallback(
    (id: string | number) => categories.find((c) => String(c.id) === String(id))?.name ?? `#${id}`,
    [categories],
  )

  const [editing, setEditing] = useState<SystemRecord | undefined>()
  // Resolver context (RHF reads the latest each render): token is required only on create.
  const form = useForm<SystemFormValues>({
    resolver: yupResolver(systemSchema),
    context: { isEdit: Boolean(editing) },
    defaultValues: EMPTY,
  })
  const [formOpen, setFormOpen] = useState(false)
  // `pending` outlives `confirmOpen` so the dialog text stays put while it animates closed.
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Set when the confirmation finished on its own (success or sent back to the form),
  // so its closing isn't mistaken for the user pressing Go Back.
  const settledRef = useRef(false)

  const [createSystem] = useCreateSystemMutation()
  const [updateSystem] = useUpdateSystemMutation()
  const [toggleArchive] = useToggleSystemArchiveMutation()

  // Edit form options: active categories, plus the system's current one if it's archived.
  const formCategories = useMemo(() => {
    const current = editing?.system_category
    return current && !categories.some((c) => c.id === current.id)
      ? [...categories, { id: current.id, name: `${current.name} (archived)` }]
      : categories
  }, [categories, editing])

  const openCreate = () => {
    form.reset(EMPTY)
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = useCallback(
    (system: SystemRecord) => {
      form.reset(toFormValues(system))
      setEditing(system)
      setFormOpen(true)
    },
    [form],
  )

  const closeForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }

  const askConfirmation = (action: PendingAction) => {
    settledRef.current = false
    setPending(action)
    setConfirmOpen(true)
  }

  // Valid form → hide the form (it stays mounted with its values) and confirm first.
  const handleValidSubmit = (values: SystemFormValues) => {
    if (editing) {
      const changes = describeChanges(editing, values, categoryName)
      if (changes.length === 0) {
        toast.info('No changes to save.')
        closeForm()
        return
      }
      askConfirmation({ kind: 'update', system: editing, values, changes })
    } else {
      askConfirmation({ kind: 'create', values })
    }
    setFormOpen(false)
  }

  const handleConfirmOpenChange = (open: boolean) => {
    if (open) return
    // Go Back on a create/update confirmation returns to the form, values intact.
    if (!settledRef.current && (pending?.kind === 'create' || pending?.kind === 'update')) {
      setFormOpen(true)
    }
    setConfirmOpen(false)
  }

  const runPending = async () => {
    if (!pending) return
    try {
      if (pending.kind === 'create') {
        await createSystem(toFormData(pending.values)).unwrap()
        toast.success(`System “${pending.values.name}” created.`)
      } else if (pending.kind === 'update') {
        await updateSystem({ id: pending.system.id, body: toFormData(pending.values) }).unwrap()
        toast.success(`System “${pending.values.name}” updated.`)
      } else {
        await toggleArchive(pending.system.id).unwrap()
        toast.success(`System “${pending.system.name}” ${pending.kind === 'archive' ? 'archived' : 'restored'}.`)
      }
      settledRef.current = true
      if (pending.kind === 'create' || pending.kind === 'update') {
        setEditing(undefined)
        form.reset(EMPTY)
      }
    } catch (error) {
      // Validation errors belong on their fields: back to the form with them shown.
      const fieldErrors = getApiFieldErrors(error as Parameters<typeof getApiFieldErrors>[0])
      const known = Object.entries(fieldErrors).filter(([field]) => field in EMPTY)
      if (known.length && (pending.kind === 'create' || pending.kind === 'update')) {
        settledRef.current = true
        setFormOpen(true)
        for (const [field, message] of known) {
          form.setError(field as keyof SystemFormValues, { type: 'server', message })
        }
        return
      }
      throw error // ConfirmDialog shows the toast and stays open for a retry
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl">Systems</h1>
          <p className="text-sm text-muted-foreground">
            Manage the systems registered in One RDF and how they integrate.
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 sm:h-9">
          <Plus />
          Add System
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={status}
          onValueChange={(next) => {
            setStatus(next as SystemStatus)
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={categoryFilter}
            onValueChange={(next) => {
              setCategoryFilter(next)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Filter by system category" className="h-10 w-full sm:h-9 sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TableSearch
            value={search}
            onSearch={(next) => {
              if (next === search) return // same query: no new request
              setSearch(next)
              setPage(1)
            }}
            label="Search systems"
          />
        </div>
      </div>

      <SystemList
        key={status}
        status={status}
        page={page}
        perPage={perPage}
        search={search}
        categoryId={categoryFilter === ALL ? undefined : Number(categoryFilter)}
        onPageChange={setPage}
        onPerPageChange={(next) => {
          setPerPage(next)
          setPage(1)
        }}
        onEdit={openEdit}
        onArchive={(system) => askConfirmation({ kind: 'archive', system })}
        onRestore={(system) => askConfirmation({ kind: 'restore', system })}
      />

      <SystemFormDialog
        open={formOpen}
        editing={editing}
        form={form}
        categories={formCategories}
        onValidSubmit={handleValidSubmit}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={handleConfirmOpenChange}
        onConfirm={runPending}
        {...confirmCopy(pending, categoryName)}
      />
    </div>
  )
}

/** Field-by-field summary of an edit (empty = nothing changed). The token is never shown. */
function describeChanges(
  system: SystemRecord,
  values: SystemFormValues,
  categoryName: (id: string | number) => string,
): ConfirmDetail[] {
  const changes: ConfirmDetail[] = []
  for (const { name, label } of TEXT_FIELDS) {
    const before = system[name] ?? ''
    if (values[name] !== before) changes.push({ label, value: `${before || '—'} → ${values[name]}` })
  }
  if (values.system_category_id !== String(system.system_category_id)) {
    changes.push({
      label: 'Category',
      value: `${system.system_category?.name ?? '—'} → ${categoryName(values.system_category_id)}`,
    })
  }
  if (values.token) changes.push({ label: 'Token', value: 'Will be replaced' })
  if (values.logo) changes.push({ label: 'Logo', value: `New file: ${values.logo.name}` })
  if (values.background) changes.push({ label: 'Background', value: `New file: ${values.background.name}` })
  return changes
}

/**
 * Confirmation copy per action. Consequences stated are the backend's actual
 * behaviour: archive soft-deletes (moves to the Archived tab, restorable),
 * restore undoes it; names must be unique.
 */
function confirmCopy(
  action: PendingAction | null,
  categoryName: (id: string | number) => string,
): Omit<ComponentProps<typeof ConfirmDialog>, 'open' | 'onOpenChange' | 'onConfirm'> {
  const title = 'Please confirm your action'
  switch (action?.kind) {
    case 'create':
      return {
        title,
        description: 'You are about to register a new system. Please review the details below.',
        details: [
          { label: 'Action', value: 'Create system' },
          { label: 'Name', value: action.values.name },
          { label: 'Category', value: categoryName(action.values.system_category_id) },
          { label: 'Frontend URL', value: action.values.frontend_url },
          { label: 'Backend URL', value: action.values.backend_url },
        ],
        note: 'Please double-check the URLs, token and endpoints used to integrate this system. You can still edit or archive it later.',
        cancelLabel: 'Go Back',
        confirmLabel: 'Confirm Create',
        loadingText: 'Creating…',
      }
    case 'update':
      return {
        title,
        description: `You are about to update “${action.system.name}”. Please review the changes below.`,
        details: [{ label: 'Action', value: 'Update system' }, ...action.changes],
        note: 'Please double-check the changes before proceeding.',
        cancelLabel: 'Go Back',
        confirmLabel: 'Confirm Changes',
        loadingText: 'Saving…',
      }
    case 'archive':
      return {
        title,
        description: 'You are about to archive this system.',
        details: [
          { label: 'Action', value: 'Archive system' },
          { label: 'Name', value: action.system.name },
          { label: 'Category', value: action.system.system_category?.name ?? '—' },
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
        description: 'You are about to restore this system.',
        details: [
          { label: 'Action', value: 'Restore system' },
          { label: 'Name', value: action.system.name },
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
