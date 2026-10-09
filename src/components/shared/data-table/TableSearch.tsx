import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TableSearchProps {
  /** The applied query (what the list is currently filtered by). */
  value: string
  /** Called with the trimmed query on Enter, and with '' when cleared. */
  onSearch: (query: string) => void
  /** Accessible name, e.g. "Search systems". */
  label: string
  placeholder?: string
  className?: string
}

/**
 * Masterlist search box: typing only edits the box; the query is applied on
 * Enter (mobile keyboards show a Search key). Clear (×) applies '' at once.
 * Re-applying the same query is skipped by the caller's state (no new request).
 */
export function TableSearch({
  value,
  onSearch,
  label,
  placeholder = 'Search by name, press Enter',
  className,
}: TableSearchProps) {
  const [input, setInput] = useState(value)

  return (
    <form
      role="search"
      className={cn('relative w-full sm:w-72', className)}
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(input.trim())
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        enterKeyHint="search"
        placeholder={placeholder}
        aria-label={`${label} (press Enter to search)`}
        className="h-10 pr-10 pl-9 sm:h-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {input && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute top-1/2 right-0.5 size-9 -translate-y-1/2 text-muted-foreground sm:size-8"
          onClick={() => {
            setInput('')
            onSearch('')
          }}
        >
          <X />
        </Button>
      )}
    </form>
  )
}
