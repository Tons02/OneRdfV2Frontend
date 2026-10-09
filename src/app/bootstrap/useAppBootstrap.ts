import { useCallback, useEffect, useState } from 'react'
import { startupTasks } from './startupTasks'

export type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: Error }

async function runStartupTasks() {
  const results = await Promise.allSettled(
    startupTasks.map(async (task) => task.run()),
  )
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') return
    const task = startupTasks[index]
    if (task.essential) {
      throw result.reason instanceof Error ? result.reason : new Error(String(result.reason))
    }
    console.warn(`Optional startup task "${task.name}" failed:`, result.reason)
  })
}

// Module-level so startup runs once per page load: StrictMode's double effect,
// rerenders and route changes all reuse the same promise.
let startup: Promise<void> | null = null
let finished = false

/** Runs the startup tasks once and reports their state. */
export function useAppBootstrap() {
  const [state, setState] = useState<BootstrapState>(() =>
    finished ? { status: 'ready' } : { status: 'loading' },
  )

  const start = useCallback(() => {
    startup ??= runStartupTasks()
    let active = true
    startup.then(
      () => {
        finished = true
        if (active) setState({ status: 'ready' })
      },
      (error: Error) => {
        startup = null // allow a retry to run the tasks again
        if (active) setState({ status: 'error', error })
      },
    )
    return () => {
      active = false
    }
  }, [])

  useEffect(() => (finished ? undefined : start()), [start])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    start()
  }, [start])

  return { state, retry }
}
