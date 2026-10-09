import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { SystemCategoryFormValues } from '../schemas/systemCategorySchema'

interface SystemCategoryFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  /** Owned by the page so values survive the form → confirmation → form round trip. */
  form: UseFormReturn<SystemCategoryFormValues>
  /** Called with valid values; the page asks for confirmation before any request. */
  onValidSubmit: (values: SystemCategoryFormValues) => void
  onCancel: () => void
}

export function SystemCategoryFormDialog({
  open,
  mode,
  form,
  onValidSubmit,
  onCancel,
}: SystemCategoryFormDialogProps) {
  const isEdit = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      {/* Header / scrollable body / footer: header and footer stay put on short screens. */}
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-4 pr-12">
          <DialogTitle>{isEdit ? 'Edit System Category' : 'Add System Category'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the name of this system category.'
              : 'Create a category used to group systems.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="e.g. Financial System"
                        className="h-10"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t bg-muted/40 px-6 py-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="h-10 sm:h-9">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="h-10 sm:h-9">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
