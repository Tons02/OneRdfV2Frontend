import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

type ApiError = FetchBaseQueryError | SerializedError | undefined

/**
 * The backend returns two error shapes:
 * - api-tool-kit:        { errors: [{ status, title, detail }] }
 * - Laravel validation:  { message, errors: { field: string[] } }
 */
interface ToolkitError {
  status?: number
  title?: string
  detail?: unknown
}

interface ErrorBody {
  message?: string
  errors?: ToolkitError[] | Record<string, string[] | string>
}

function getBody(error: ApiError): ErrorBody | undefined {
  if (error && 'status' in error && error.data && typeof error.data === 'object') {
    return error.data as ErrorBody
  }
  return undefined
}

/** Human-readable message from an RTK Query error. */
export function getApiErrorMessage(
  error: ApiError,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback
  if ('status' in error && error.status === 'FETCH_ERROR') {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  const body = getBody(error)
  if (Array.isArray(body?.errors)) {
    const first = body.errors[0]
    if (typeof first?.detail === 'string' && first.detail) return first.detail
    if (first?.title) return first.title
  }
  return body?.message || fallback
}

/** Per-field validation errors (Laravel 422 `errors` bag), first message per field. */
export function getApiFieldErrors(error: ApiError): Record<string, string> {
  const errors = getBody(error)?.errors
  if (!errors || Array.isArray(errors)) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : messages,
    ]),
  )
}
