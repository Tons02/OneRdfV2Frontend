import type { ReactNode } from 'react'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage'
import { useGetSystemQuery } from '../api/systemsApi'
import type { SystemFormValues } from '../schemas/systemSchema'
import { ENDPOINT_FIELDS, type SystemRecord } from '../types/system.types'

interface SystemFormDialogProps {
  open: boolean
  /** The system being edited; omitted when adding. */
  editing?: SystemRecord
  /** Owned by the page so values survive the form → confirmation → form round trip. */
  form: UseFormReturn<SystemFormValues>
  categories: { id: number; name: string }[]
  /** Called with valid values; the page asks for confirmation before any request. */
  onValidSubmit: (values: SystemFormValues) => void
  onCancel: () => void
}

export function SystemFormDialog({
  open,
  editing,
  form,
  categories,
  onValidSubmit,
  onCancel,
}: SystemFormDialogProps) {
  const isEdit = Boolean(editing)
  // The list only has storage paths; the detail endpoint returns signed URLs for previews.
  const { data: detail } = useGetSystemQuery(editing?.id ?? 0, { skip: !open || !editing })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4 pr-12">
          <DialogTitle>{isEdit ? 'Edit System' : 'Add System'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this system’s details, branding and integration endpoints.'
              : 'Register a system and the endpoints One RDF uses to integrate with it.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <Section title="General">
                <TextField form={form} name="name" label="Name" placeholder="e.g. Fixed Asset System" autoFocus />
                <FormField
                  control={form.control}
                  name="system_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full" onBlur={field.onBlur}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="What this system is used for" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              <Section title="Access">
                <TextField form={form} name="frontend_url" label="Frontend URL" placeholder="https://…" inputMode="url" />
                <TextField form={form} name="backend_url" label="Backend URL" placeholder="https://…" inputMode="url" />
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>{isEdit ? 'Replace token' : 'Token'}</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" className="h-10" {...field} />
                      </FormControl>
                      {isEdit && (
                        <FormDescription>
                          The current token is stored encrypted and isn’t shown. Leave blank to keep it.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              <Section title="Branding" description="Optional. JPEG, PNG, GIF or SVG, up to 2 MB each.">
                <ImageField form={form} name="logo" label="Logo" currentUrl={detail?.logo} />
                <ImageField form={form} name="background" label="Background" currentUrl={detail?.background} />
              </Section>

              <Section title="Integration endpoints">
                {ENDPOINT_FIELDS.map(({ name, label }) => (
                  <TextField key={name} form={form} name={name} label={label} placeholder="/api/…" />
                ))}
              </Section>
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

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">{title}</legend>
      {description && <p className="-mt-2 text-xs text-muted-foreground">{description}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

type TextName = Exclude<keyof SystemFormValues, 'logo' | 'background' | 'system_category_id' | 'token' | 'description'>

function TextField({
  form,
  name,
  label,
  ...inputProps
}: {
  form: UseFormReturn<SystemFormValues>
  name: TextName
  label: string
} & Pick<React.ComponentProps<'input'>, 'placeholder' | 'autoFocus' | 'inputMode'>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input autoComplete="off" className="h-10" {...inputProps} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ImageField({
  form,
  name,
  label,
  currentUrl,
}: {
  form: UseFormReturn<SystemFormValues>
  name: 'logo' | 'background'
  label: string
  currentUrl?: string | null
}) {
  const current = useAuthenticatedImage(currentUrl)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, onBlur, name: fieldName, ref } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-3">
            {current && !value && (
              <img src={current} alt={`Current ${label.toLowerCase()}`} className="size-10 shrink-0 rounded-md border object-contain" />
            )}
            <FormControl>
              <Input
                // Remount when cleared (e.g. form reset) so the browser forgets the chosen file.
                key={value ? 'chosen' : 'empty'}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.svg"
                className="h-10 file:mr-3"
                name={fieldName}
                ref={ref}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
              />
            </FormControl>
          </div>
          {currentUrl && !value && <FormDescription>Choose a file only to replace the current {label.toLowerCase()}.</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
