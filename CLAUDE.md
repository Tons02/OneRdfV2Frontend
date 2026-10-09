# One RDF Frontend — Project Conventions

React 19 + Vite + TypeScript. Backend: Laravel (`../OneRdfV2Backend`, routes in `routes/api.php`).
Follow these rules for every feature. They are not optional.

## Stack (do not substitute)
- UI: **shadcn/ui only** (`src/components/ui`). Add missing ones with `npx shadcn@latest add <name>`.
  On Windows the CLI writes to a literal `@/` folder — move the file into `src/components/ui/` and delete `@/`.
  Never overwrite existing `ui/` files with the CLI's copies.
- State/API: Redux Toolkit + **RTK Query**. **Never use Axios** (not installed, not wrapped, not renamed).
  Use native `fetch` only where RTK Query genuinely doesn't fit.
- Forms: React Hook Form + Yup + `yupResolver`, using shadcn `Form` components. No per-field `useState`.
- Routing: React Router (`src/app/router`). Toasts: Sonner (`toast` from `sonner`).
- Do not add dependencies or another UI library without asking. Do not edit `.env*` files.

## Structure
```
src/app/{router,store,providers}   app shell (store + typed hooks in app/store/hooks.ts)
src/components/ui                  shadcn components
src/components/shared              app-wide composites (ConfirmDialog, ThemeToggle, ...)
src/features/<name>/               api/ components/ hooks/ pages/ schemas/ types/ store/ index.ts
src/layouts                        AuthLayout, AppLayout
src/lib/api                        baseApi.ts (single createApi), errors.ts (error helpers)
src/config/env.ts                  the only place that reads import.meta.env
src/styles/globals.css             theme tokens + fonts
src/types/api.ts                   shared API envelope / pagination types
```
**Startup**: `app/providers/AppBootstrap` holds the router back (showing `InitialAppLoader`, the RDF Lottie) until the
tasks in `app/bootstrap/startupTasks.ts` finish, once per page load. Add a task there only if the app cannot render
without it (`essential: true` → error screen + retry on failure; `essential: false` → logged and ignored). Never add
page data or timers. `config/env.ts` doesn't throw at import; `assertEnv` is the `config` task.

**Masterlist modules** (reference-data CRUD) follow the `masterlist-management` skill; `features/system-categories/`
is the reference implementation. Buttons follow the `button-ux-standards` skill. Sidebar items live in `src/app/navigation.ts`.

Other modules import a feature through its `index.ts` barrel. Inside `lib/api`, import slices by file
path (not the barrel) to avoid import cycles.

## API layer
- Add endpoints with `baseApi.injectEndpoints` in `features/<name>/api/<name>Api.ts`. Never call the API from pages.
- Register cache tags in `baseApi.tagTypes`; queries `providesTags`, mutations `invalidatesTags`.
- Auth header, `Accept: application/json`, and logout-on-401 are handled in `baseApi.ts`.
- Backend success shape: `{ status, message, data }` (`ApiResponse<T>`).
- Backend error shapes (both handled by `getApiErrorMessage` / `getApiFieldErrors`):
  - `{ errors: [{ status, title, detail }] }` (api-tool-kit; message is usually in `detail`)
  - `{ message, errors: { field: string[] } }` (Laravel 422 validation)
- Types mirror the backend Resource classes (e.g. `UserResource` → `AuthUser`). Read the backend
  before inventing a contract; if an endpoint doesn't exist, build the API boundary and say so — never fake it.

## Theme
- All colors are semantic tokens in `src/styles/globals.css` (`:root` + `.dark`). Brand: One RDF orange
  (`primary`, with charcoal `primary-foreground` — white on this orange fails contrast), charcoal (`secondary`),
  restrained gold (`accent`, hover/selected surfaces only), neutral warm grays for surfaces, `brand-panel` behind the
  white logo. Also `success`, `warning`, `info` (the only intentional blue), `destructive`.
- Orange is for primary actions, focus rings and small highlights; never fill large areas with orange or gold.
- Theme: `components/shared/ThemeProvider` (light/dark/system, persisted, `resolvedTheme` for theme-aware assets) +
  `ThemeToggle` (shadcn dropdown). `index.html` applies the saved theme before paint — keep its key in sync.
  Theme fades: `transition-colors duration-300 motion-reduce:transition-none` on layout surfaces only.
- Use `bg-primary`, `text-muted-foreground`, `text-success`, etc. **No hex/arbitrary colors** (`bg-[#...]`, `text-white`).
- Font: Inter Variable via `@fontsource-variable/inter`; change `--font-sans` / `--font-heading` only in globals.css.
- Visual style: professional enterprise. No gradients, glows, glassmorphism, sparkles, decorative blobs, or
  gratuitous animation. Subtle borders/shadows, clear hierarchy, consistent spacing.

## UX standards
- **Dialog** (shadcn) for create/edit/view/modal forms. No custom modals.
- **Confirmation**: delete/archive/disable/logout/approve/reject etc. must use
  `components/shared/ConfirmDialog` (AlertDialog). `onConfirm` must return a promise that **rejects on
  failure** (use `.unwrap()`); the dialog handles loading, disabling, close-on-success and the error toast.
- **Toasts** for create/update/delete success, API errors, and important status changes.
- **Async states**: every async view handles loading, error (Alert), empty, and success. Never a blank screen.
- **Animations** live in `components/shared/animations/` (Lottie files in `public/`, registered in `animations.ts`;
  `LottieAnimation` lazy-loads the engine, fetches each file once, respects reduced motion, is `aria-hidden`):
  - `LoadingButton` (`loading`, optional `loadingText`) for every async submit/save/delete; disabled while loading,
    keeps its size. Plain `Button` everywhere else. `ConfirmDialog` already uses it.
  - `TableLoadingState` only when there is no data yet (`isLoading`), not for background refetches (`isFetching`).
  - `TableEmptyState` only after a successful empty response; `filtered` when search/filters are active.
    Errors use an `Alert`, never the empty state. Render both inside `<TableRow><TableCell colSpan={n}>` so headers stay.
- **Tables**: always server-side paginated — `?page=&per_page=` (`PaginationParams`, `Paginated<T>`,
  `PAGINATION` in `lib/constants.ts`). Support search, filters, page size, total records, loading/empty/error
  where applicable. Below `md`, render rows as cards/list instead of a cramped table.
- **Responsive**: works on mobile → desktop; forms stack, dialogs fit small screens, touch targets ≥ 40px.
- **Accessibility**: real labels, `autoComplete`, visible focus, `type` on every button, `aria-*` on icon buttons,
  errors associated with fields (shadcn `FormControl`/`FormMessage` does this).

## Commands
`npm run dev` · `npm run build` (tsc + vite) · `npm run lint` (oxlint)
