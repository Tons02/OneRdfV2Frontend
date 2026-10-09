import { useSyncExternalStore } from 'react'

/** Network Information API — Chromium only; `type` mostly on Android. */
interface NetworkInformation extends EventTarget {
  type?: 'wifi' | 'ethernet' | 'cellular' | 'bluetooth' | 'wimax' | 'other' | 'none' | 'unknown'
}

function connection() {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection
}

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  connection()?.addEventListener('change', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
    connection()?.removeEventListener('change', onChange)
  }
}

const TYPE_LABELS: Partial<Record<NonNullable<NetworkInformation['type']>, string>> = {
  wifi: 'Wi-Fi',
  ethernet: 'Ethernet',
  cellular: 'Mobile data',
}

/**
 * What the browser can actually tell us. `online` is navigator.onLine: false
 * reliably means no network; true means connected to *a* network (not a
 * guarantee of internet access). `connectionType` is only set when the
 * browser reports it — most desktop browsers don't, and none report signal strength.
 */
export function useNetworkStatus() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
  const connectionType = useSyncExternalStore(
    subscribe,
    () => {
      const type = connection()?.type
      return type ? (TYPE_LABELS[type] ?? null) : null
    },
    () => null,
  )
  return { online, connectionType }
}
