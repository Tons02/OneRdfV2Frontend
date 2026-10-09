import { useEffect, useState } from 'react'
import { useAppSelector } from '@/app/store/hooks'

/**
 * Loads an image that needs the API's Bearer token (e.g. the signed
 * profile-picture URL from /me, which sits behind auth:sanctum, so a plain
 * <img src> would get 401). Returns an object URL once loaded, otherwise
 * undefined, so callers can show a fallback. Native fetch is used because
 * this is a binary resource, not API state.
 */
export function useAuthenticatedImage(url: string | null | undefined) {
  const token = useAppSelector((state) => state.auth.token)
  const [loaded, setLoaded] = useState<{ url: string; objectUrl: string } | null>(null)

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    let objectUrl: string | undefined

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.blob() : Promise.reject(response.status)))
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setLoaded({ url, objectUrl })
      })
      .catch(() => {
        // Expired/invalid signature, missing file or offline: the caller's fallback shows.
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, token])

  return loaded && loaded.url === url ? loaded.objectUrl : undefined
}
