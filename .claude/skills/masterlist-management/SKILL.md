---
name: masterlist-management
description: One RDF standards for masterlist / reference-data CRUD modules (System Category, Systems, Users, Roles, Companies, Business Units, Departments, Locations, Charging and similar). Use when creating, extending or reviewing a masterlist page — list table, search, active/archived filter, pagination, add/edit dialog, archive/restore, confirmations, sidebar entry, and its RTK Query API slice and Laravel contract.
---

# Masterlist Management (One RDF)

A masterlist is a reference-data module: a paginated, searchable table with add/edit in a
dialog and archive/restore (soft delete). **System Category** (`src/features/system-categories/`)
is the reference implementation — copy its structure, not just its look.

Also follow `button-ux-standards` for every button, and the project rules in `CLAUDE.md`.

## 0. Contract first — never invent

Before writing UI, read the backend (`../OneRdfV2Backend`) for the module:

| Read | To learn |
|---|---|
| `routes/api.php` | exact URLs, HTTP verbs, `can:<permission>` per route |
| Controller `index/store/update/archived` | query params (`status`, `pagination`), response messages, archive/restore toggle |
| `FormRequest` rules | the only writable fields + validation (mirror them in Yup) |
| `Resource` / model / migration | the only readable fields; `SoftDeletes` ⇒ archive/restore |
| `app/Filters/...Filter.php` | `$columnSearch` (what `?search=` searches) and `$allowedFilters` |
| `RolePermissionSeeder` | permission names (must match the routes' `can:`) |

If a needed capability is missing (no search columns, permission-name mismatch, no endpoint),
**stop and report it**; don't fake it client-side or with mock data unless the user agrees.

Known backend conventions (api-tool-kit + Laravel):
- List: `GET /<resource>?page=&per_page=&search=&status=inactive` → `{ message, data: Paginated<T> }`
  (Laravel LengthAwarePaginator: `current_page, data, last_page, per_page, total, from, to`).
  Omit the `pagination` param — with it the controllers return a resource collection that
  drops the pagination meta. `status=inactive` lists archived (trashed) rows; anything else = active.
  Default `per_page` 20, max 100.
- Create `POST`, update `PATCH /<resource>/{id}` (may answer `No Changes`), archive **and**
  restore are the same `PUT /<resource>-archived/{id}` (toggles `deleted_at`).
- Errors: 422 `{ message, errors: { field: [..] } }`; others `{ errors: [{ title, detail }] }` or
  `{ message }`. Use `getApiErrorMessage` / `getApiFieldErrors` from `@/lib/api/errors`.

- **Filters by relation** (e.g. Systems by category): only via `$allowedFilters` (api-tool-kit maps
  `?<column>=value` to a `where`). Dropdown options come from the related module's
  `?pagination=none&status=active` endpoint (plain array). "All …" option omits the param.
- **File uploads**: send `FormData`. PHP can't parse multipart `PATCH`, so updates are `POST` with
  `_method=PATCH` (Laravel method spoofing, same route). Send files/secrets only when provided.
- **Secrets** (tokens, keys): must be `$hidden` on the model (lists return raw models), never prefilled;
  edit shows an empty "Replace …" field and a blank value keeps the stored one.
- Second reference implementation: `src/features/systems/` (relation filter, uploads, secrets).

## 1. Data layer — RTK Query only

- **No Axios, no `fetch` in components, no new HTTP client.** Inject endpoints into the single
  `baseApi` (`src/lib/api/baseApi.ts`) in `features/<module>/api/<module>Api.ts`; it already
  adds the auth header, `Accept: application/json`, and logs out on 401.
- Register the module's tag in `baseApi.tagTypes`; list `providesTags: [{ type, id: 'LIST' }]`;
  every mutation `invalidatesTags: [{ type, id: 'LIST' }]` so lists and counts refresh.
- Types in `features/<module>/types/<module>.types.ts`, mirroring the Resource exactly.
- Use the hook's own state (`isLoading`, `isFetching`, `isError`, `currentData`, `refetch`) —
  no duplicate `useState` for request status.

## 2. Page structure

```
features/<module>/
  api/<module>Api.ts            endpoints + hooks
  types/<module>.types.ts       mirrors backend Resource / request
  schemas/<module>Schema.ts     Yup, mirrors FormRequest rules
  components/<Module>FormDialog.tsx   add + edit (one component, `mode`)
  components/<Module>Table.tsx        table (md+) / cards (mobile), states, row actions
  pages/<Module>Page.tsx        header, search, tabs, pagination, dialog/confirm orchestration
  index.ts
```
Route in `ROUTES` (`src/lib/constants.ts`) + `app/router/index.tsx` under `PrivateRoute`/`AppLayout`;
sidebar entry in `src/app/navigation.ts` under the **Masterlist** group (lucide icon).

- **Header**: `h1` title, one-line `text-muted-foreground` description, primary
  `Add <Thing>` button (lucide `Plus`). Nothing decorative.
- **Toolbar**: shadcn `Tabs` Active / Archived (only if the model soft-deletes), search `Input`
  with `Search` icon inside a `<form role="search">`: the API is queried **only on Enter**
  (`enterKeyHint="search"`), not while typing; the clear button (`aria-label="Clear search"`) resets
  immediately. Changing search, tab or page size resets to page 1.
- **Table**: shadcn `Table` from `md` up; below `md` the same rows as a card list. Only columns
  backed by real fields (name, status badge, created date, actions). Status from `deleted_at`.
- **Pagination**: `DataTablePagination` (`components/shared/data-table/`) under the table:
  range + total, page-size `Select` (`PAGINATION.perPageOptions`), Previous/Next disabled at
  bounds and while fetching.

## 3. Loading, empty, error (never misleading)

- Tab switch remounts the table (`key={status}`) so archived rows never show under Active.
- No data yet (`isLoading`) → `TableLoadingState` inside the table body (headers stay).
- Refetch with data on screen (page/search) → keep rows, dim them (`opacity-60`), `aria-busy`,
  small loader in the search box. Never flash the empty state while fetching.
- Success with 0 rows → `TableEmptyState` (`filtered` when a search is active).
- Error → destructive `Alert` with the API message and a **Try again** button (`refetch`).
  403 shows the backend's "unauthorized" message — not an empty table.

## 4. Mutations — always confirmed first

Every create, update, archive, restore (and delete, if a module ever has it) goes through
`ConfirmDialog` **before** the request. Never call a mutation from a click directly.

- **Add/Edit**: `FormDialog` (RHF `useForm` + `yupResolver`, shadcn `Form*` fields) → Save runs
  validation; invalid ⇒ field errors, no confirmation. Valid ⇒ hide the form dialog (keep it
  mounted so values survive) and open `ConfirmDialog` (controlled) summarising the change.
  Cancel ⇒ back to the form, values intact. Confirm ⇒ request with `LoadingButton`.
  - Edit with no actual change ⇒ don't send; `toast.info('No changes to save.')`.
  - Submit only fields in the FormRequest.
  - 422 ⇒ close confirmation, reopen the form, `form.setError(field, ...)` from `getApiFieldErrors`.
  - Other failure ⇒ error toast, confirmation stays open for retry (ConfirmDialog default).
  - Success ⇒ toast, close everything, list refreshes via tag invalidation.
- **Archive / Restore**: row button → `ConfirmDialog` naming the record ("Archive “X”?"),
  `variant="destructive"` for archive, default for restore. Explain consequences only if the
  backend defines them.
- **Form dialog layout** (shadcn parts only, see `SystemCategoryFormDialog`):
  `DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0"` →
  `DialogHeader className="border-b px-6 py-4 pr-12"` (title + one-line description) →
  `<form className="flex min-h-0 flex-1 flex-col">` → body `div.min-h-0 flex-1 overflow-y-auto px-6 py-5` →
  `DialogFooter className="border-t bg-muted/40 px-6 py-4"` (Cancel outline, Save submit).
- **Confirmation levels** (`ConfirmDialog` props):
  - Routine (logout): `title` + `description` only.
  - Important (create/update): title "Please confirm your action", `details` (Action + the values;
    update shows Current → New), `note` reminder, `cancelLabel="Go Back"`, `confirmLabel="Confirm Create" / "Confirm Changes"`.
  - Destructive (archive/disable/delete): same plus `variant="destructive"`, a status line
    (e.g. `Active → Archived`) and the **verified** consequence in `note`. Never say "irreversible" unless it
    is (archive is restorable). Type-the-name safeguards only for truly irreversible, high-impact actions.
- One dialog at a time: form ⇄ confirm swap, never nested. Row actions are plain icon buttons
  (`aria-label="Edit <name>"`), not dropdowns, unless a row has more than ~3 actions.

## 5. Permissions

Backend routes use Spatie `can:<module>.<action>` (`view`, `create`, `update`, `archive`, …).
The login response does **not** include Spatie permissions (only `access_permissions`, a
different field), so the frontend cannot reliably hide actions by permission today: render the
actions and surface the backend's 403 via the error state / toast. If permissions are later
exposed in the login/user payload, gate with them — don't guess names.

## 6. UI rules

- shadcn/ui only (`Table`, `Tabs`, `Input`, `Select`, `Badge`, `Dialog`, `AlertDialog`, `Form`,
  `Button`, `Sidebar`); add missing ones with the shadcn CLI (move files out of the stray `@/`
  folder on Windows; never overwrite existing `ui/` files or theme tokens).
- Theme tokens only (`bg-primary`, `text-muted-foreground`, `text-success`, …) — no hex/rgb,
  no `bg-gray-*`. Status: Active = `text-success`, Archived = muted.
- Dates: `Intl.DateTimeFormat` (`dateStyle: 'medium'`).
- Responsive (mobile cards, stacked toolbar), accessible labels, focus states, 40px touch targets.
- No custom CSS, no new dependencies, no unrelated refactors, no `.env` changes.

## Checklist
- [ ] Contract read from backend; fields/params/permissions not invented; gaps reported.
- [ ] RTK Query endpoints injected into `baseApi`; tag invalidation on every mutation.
- [ ] Search on Enter only + resets page; tabs remount table; pagination below table.
- [ ] Loading / refetch / empty / error states as above; retry works.
- [ ] Add/Edit in one dialog with RHF + Yup; confirmation before every mutation; cancel sends nothing.
- [ ] No-change edit skipped; 422 mapped to fields; failures keep data.
- [ ] Archive/restore confirmed and named; list refreshes.
- [ ] Sidebar entry under Masterlist with active highlighting; route protected.
- [ ] Mobile cards, tokens only, `LoadingButton`s, lint/type/build pass.
