import { useRef, useState, type ReactNode } from 'react'
import { ClipboardCheck, Info, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils'
import { LoadingButton } from './animations/LoadingButton'

export interface ConfirmDetail {
  label: string
  value: ReactNode
}

interface ConfirmDialogProps {
  /** Element that opens the dialog (rendered via `asChild`). Omit when controlled. */
  trigger?: ReactNode
  /** Controlled mode, e.g. opening after a form validates or from a row action. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: ReactNode
  /** Summary of the record / changes being confirmed (important and destructive actions). */
  details?: ConfirmDetail[]
  /** Final reminder under the details. Only state consequences the app actually enforces. */
  note?: ReactNode
  confirmLabel: string
  /** e.g. "Go Back" when cancelling returns to a form. */
  cancelLabel?: string
  /** Shown beside the loader while running, e.g. "Archiving…". */
  loadingText?: string
  /** Use "destructive" for delete/archive/disable actions. */
  variant?: 'default' | 'destructive'
  /** Must reject on failure (e.g. RTK Query `.unwrap()`). */
  onConfirm: () => Promise<unknown>
}

/**
 * Standard confirmation, shown *before* a mutation runs. Routine actions pass
 * just a title + description; important/destructive ones add `details` and a
 * `note`. Disables itself while running (duplicate-proof), closes only after
 * `onConfirm` resolves, and shows an error toast (staying open) on failure.
 */
export function ConfirmDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  details,
  note,
  confirmLabel,
  cancelLabel = 'Cancel',
  loadingText,
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen
  const [pending, setPending] = useState(false)
  // State updates aren't visible until the next render, so a burst of clicks
  // could all pass a state check; the ref closes that gap.
  const pendingRef = useRef(false)
  const destructive = variant === 'destructive'
  const rich = Boolean(details?.length || note)

  // A plain button (not AlertDialogAction), so the dialog stays open until the action succeeds.
  const handleConfirm = async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error as Parameters<typeof getApiErrorMessage>[0]))
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto">
        <AlertDialogHeader>
          {rich && (
            <AlertDialogMedia
              className={cn(
                'size-12',
                destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/15 text-foreground',
              )}
            >
              {destructive ? <TriangleAlert className="size-6" /> : <ClipboardCheck className="size-6" />}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {details && details.length > 0 && (
          <dl className="grid gap-x-4 gap-y-2 rounded-md border bg-muted/40 p-3 text-sm sm:grid-cols-[auto_1fr]">
            {details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="min-w-0 font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {note && (
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{note}</span>
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} className="h-10 sm:h-9">
            {cancelLabel}
          </AlertDialogCancel>
          <LoadingButton
            variant={variant}
            loading={pending}
            loadingText={loadingText}
            onClick={handleConfirm}
            className="h-10 sm:h-9"
          >
            {confirmLabel}
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
