import { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** The user's choice (persisted). */
  theme: Theme
  /** What is actually applied right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

// index.html applies the stored theme before first paint to avoid a flash;
// keep its storage key in sync with STORAGE_KEYS.theme.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    darkQuery().matches ? 'dark' : 'light',
  )
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const query = darkQuery()
    const onChange = () => setSystemTheme(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next)
    } catch {
      // Storage unavailable (private mode); the choice lasts for this session.
    }
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
