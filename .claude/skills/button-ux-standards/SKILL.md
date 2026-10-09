---
name: button-ux-standards
description: One RDF button and action-control UX standards — loading, disabled, hover/focus, success/error and duplicate-submit rules for every button (auth, CRUD, workflow approve/reject, e-commerce orders, search/refresh/export/import/upload, dialog, table-row and pagination actions). Use whenever creating, editing or reviewing a button, form submit, icon button, confirm dialog action, or any async action trigger in this React app.
---

# Button UX Standards (One RDF)

Apply these rules to **every** button and action control. They describe how this
project already works; follow the existing components instead of inventing new ones.

## When to use this skill

- Adding or changing any `<Button>`, form submit, icon button, dialog/table/pagination action.
- Wiring a button to an API call (RTK Query mutation/query) or any async work.
- Reviewing a module for button behavior, accessibility, or duplicate-request bugs.

Do **not** use it as a reason to restyle or refactor buttons that already comply, or to
touch business logic, validation, permissions, or API calls.

## The components (use these, don't create new ones)

| Situation | Use | Location |
|---|---|---|
| Synchronous action, navigation, toggle | `Button` (shadcn) | `src/components/ui/button.tsx` |
| Anything async (submit, save, delete, export, approve, place order…) | `LoadingButton` | `src/components/shared/animations/LoadingButton.tsx` |
| Destructive or important action needing confirmation | `ConfirmDialog` (uses `LoadingButton` internally) | `src/components/shared/ConfirmDialog.tsx` |
| Link that looks like a button | `<Button asChild><Link …/></Button>` | — |

`LoadingButton` = shadcn `Button` + `loading` + optional `loadingText`. While `loading`:
native `disabled`, `aria-busy`, the approved `buttonLoading` Lottie (tinted to the button's
text color), original label kept invisible so **size never changes**, and a subtly muted look
(`disabled:opacity-80 disabled:saturate-50` — the variant's own token colours, no new colours) so it
reads as temporarily unavailable. Never override that with `disabled:opacity-100`. All `Button` props
(`variant`, `size`, `type`, `className`, `asChild` excluded) pass through.

Never use `lucide` `Loader2` spinners, CSS spinners, or a second animation for buttons.

## Standard states

### Default
- Keep the existing `variant` and hierarchy: one `default` (orange primary) action per
  area; `outline`/`secondary`/`ghost` for the rest; `destructive` for delete/reject/archive;
  `link` for inline text actions.
- Don't add custom colors/shadows to a normal-state button to make it "stand out".

### Loading
- Source of truth = the **existing request state**, not new `useState`:
  - RTK Query mutation: `const [save, { isLoading }] = useSaveMutation()` → `loading={isLoading}`.
  - Refresh of a query: `loading={isFetching}`.
  - React Hook Form submit: `loading={isLoading}` from the mutation (or `form.formState.isSubmitting`
    when the submit handler awaits the request).
  - Local state only for non-RTK async work (e.g. `ConfirmDialog`'s `pending`).
- `loadingText` when the button is wide enough and it helps: `Saving…`, `Deleting…`,
  `Submitting…`, `Approving…`, `Exporting…`, `Uploading…`, `Placing order…`, `Signing in…`.
  Use the `…` character. Omit it for small/icon buttons (screen readers still get "Loading").
- Per-row actions sharing one mutation hook: only the clicked row loads:
  `loading={isLoading && originalArgs?.id === row.id}` (and disable the other rows' same action).

### Disabled
- Use the native `disabled` attribute. The shared `Button` already renders it muted with
  `disabled:opacity-50 disabled:pointer-events-none` — a token-based look that works in light
  and dark. **Do not** add per-button gray colors, `bg-gray-*`, or custom disabled styles.
- Disable only when the action genuinely can't run: while loading, no selection, at a
  pagination bound, missing permission (if the module shows rather than hides it).
- **Don't disable a form's submit just because the form is invalid** — let it submit so
  Yup/React Hook Form shows the field errors. Disable it only while submitting.
- A disabled button needs a reason the user can discover (visible helper text or a shadcn
  `Tooltip` on a wrapping `<span tabIndex={0}>`, since disabled buttons get no pointer events).

### Hover and focus
- Provided by the `Button` variants (`hover:bg-primary/90`, `focus-visible:ring-ring/50`…).
  Never remove `outline`/`ring` focus styles; never override hover with raw colors.
- Works in both themes automatically because variants use tokens (`primary`, `accent`, `destructive`…).

### Success and error
- Only after the request resolves: `await mutation(args).unwrap()` → then `toast.success(...)`.
- On failure: `toast.error(getApiErrorMessage(error))` (from `@/lib/api/errors`), or an inline
  `Alert` for form-level errors, and field errors via `getApiFieldErrors`.
- The button returns to normal automatically when `isLoading` flips back — no manual reset.
- Never show success optimistically, never leave a button stuck loading (always `try/catch/finally`
  or `.unwrap()` with the hook's own state).

## Duplicate-request prevention (all must hold)
1. `disabled` while loading (via `LoadingButton`) — also blocks Enter-key resubmits of the form.
2. Inputs of the submitting form are `disabled={isLoading}` where re-editing mid-request would be wrong.
3. The async handler guards itself with a **ref** (`if (inFlightRef.current) return`, set before the
   request, cleared in `finally`). State/`isLoading` only updates after a re-render, so a burst of
   clicks or Enter presses can all pass a state check (see `ConfirmDialog`, `useLogin`).
4. Submit buttons are `type="submit"`; every other button inside a form is `type="button"`.

## Destructive and important actions
Delete, archive, disable, reject, cancel order, logout, bulk actions, status changes that can't
be undone → **always** `ConfirmDialog`:

```tsx
<ConfirmDialog
  trigger={<Button variant="destructive" size="sm">Delete</Button>}
  title="Delete user?"
  description="This permanently removes the user. This action cannot be undone."
  confirmLabel="Delete user"
  variant="destructive"
  onConfirm={() => deleteUser(user.id).unwrap()}   // must reject on failure
/>
```
It disables both buttons while running, closes only on success, toasts on error. Put the
success toast in the caller's `onConfirm` (after `unwrap()`), not before.

## Accessibility
- Icon-only buttons: `aria-label` (e.g. `aria-label="Delete user"`), `size="icon"`/`"icon-lg"`.
- Touch targets ≥ 40px on mobile (`size="lg"`, `icon-lg`, or `h-10`).
- Toggle buttons expose state: `aria-pressed` (see the password visibility toggle).
- Loading is announced by `LoadingButton` (`aria-busy` + text/`sr-only "Loading"`); don't add
  extra live regions.
- Don't put interactive elements inside buttons; don't use `div onClick` as a button.

## Colors (strict)
- Only theme tokens from `src/styles/globals.css` via variants/utilities (`bg-primary`,
  `text-muted-foreground`, `border-input`, `bg-destructive`…).
- No hex/rgb/hsl/oklch literals, no `bg-[#...]`, no `text-white`/`bg-gray-*`, no new CSS
  variables for buttons. If a genuinely new semantic color is needed, ask first.

## Specific controls
- **Search**: input + debounced query; a search button (if any) is `LoadingButton loading={isFetching}`.
- **Refresh**: `LoadingButton variant="outline" loading={isFetching}` with `refetch`.
- **Export / Import / Upload**: `LoadingButton` with `Exporting…`/`Importing…`/`Uploading…`;
  disable the file input while uploading.
- **Pagination**: shadcn controls; Previous/Next `disabled` at bounds; keep showing current rows
  while the next page fetches (don't swap to the table loading state).
- **Dialog footers**: Cancel = `variant="outline"`, `disabled` while the primary action runs;
  primary = `LoadingButton type="submit"` inside the dialog form.
- **Table row actions**: per-row loading (see above); destructive ones through `ConfirmDialog`.

## Correct vs incorrect

```tsx
// ✅ Correct — RTK Query state drives the button; success only after unwrap
const [updateOrder, { isLoading }] = useUpdateOrderStatusMutation()
const onSubmit = async (values: FormValues) => {
  try {
    await updateOrder(values).unwrap()
    toast.success('Order status updated.')
  } catch (error) {
    toast.error(getApiErrorMessage(error))
  }
}
<LoadingButton type="submit" loading={isLoading} loadingText="Saving…">Save</LoadingButton>
```

```tsx
// ❌ Incorrect — duplicate state, spinner swap changes width, success before the request,
//    hardcoded colors, no duplicate-click protection
const [saving, setSaving] = useState(false)
<Button
  className="bg-[#F7941D] disabled:bg-gray-300"
  onClick={() => { toast.success('Saved'); setSaving(true); save(values) }}
>
  {saving ? <Loader2 className="animate-spin" /> : 'Save'}
</Button>
```

```tsx
// ❌ Incorrect — destructive action without confirmation
<Button variant="destructive" onClick={() => deleteUser(id)}>Delete</Button>
// ✅ Use ConfirmDialog (see above)
```

## Review checklist
- [ ] Async action uses `LoadingButton`, `loading` comes from existing request state.
- [ ] Disabled while loading; duplicate clicks/Enter can't fire a second request.
- [ ] Size stable while loading; `loadingText` only where it fits.
- [ ] Success toast only after success; errors surfaced; button recovers after failure.
- [ ] Destructive/important actions go through `ConfirmDialog`.
- [ ] Correct `type`, `variant`, `aria-label` for icon buttons, focus ring intact.
- [ ] No hardcoded colors or custom disabled styles; works in light and dark.
- [ ] No unrelated refactors, business-logic, validation, or permission changes.
