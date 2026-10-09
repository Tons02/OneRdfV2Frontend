import { Mascot } from 'page-mascot'
import { useTheme } from '@/components/shared/ThemeProvider'
import { cn } from '@/lib/utils'

// Sprite sheets from nilbuild/page-mascot (MIT), served from public/mascots.
const MASCOTS = {
  light: { name: 'fox', directions: '/mascots/fox-directions.webp', reactions: '/mascots/fox-reactions.webp' },
  dark: { name: 'owl', directions: '/mascots/owl-directions.webp', reactions: '/mascots/owl-reactions.webp' },
} as const

const SIZE = 88 // px; matches size-22 below

/**
 * - idle:        the live mascot (follows the pointer, reacts to clicks)
 * - watching:    looking down at the form
 * - eyes-closed: politely not looking while a hidden password is typed
 */
export type MascotExpression = 'idle' | 'watching' | 'eyes-closed'

/**
 * page-mascot only shows expressions briefly after a click and has no API to
 * hold one, so held expressions are a still frame cut from the same 3x3
 * sheets the library uses (background-size 300%, cell positions in 50% steps,
 * exactly as it does internally). Nothing is redrawn, and both sheets are
 * already loaded by the live mascot, so there's no flash.
 */
const FRAMES = {
  watching: { sheet: 'directions', position: '50% 100%' }, // "down" cell
  'eyes-closed': { sheet: 'reactions', position: '0% 0%' }, // "blink" cell
} as const

/**
 * Fox by day, owl by night. Both are mounted in the same fixed box (no layout
 * shift) and cross-faded; the hidden one is inert so only one is focusable.
 */
export function LoginMascot({
  expression = 'idle',
  className,
}: {
  expression?: MascotExpression
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  const frame = expression === 'idle' ? null : FRAMES[expression]

  return (
    <div className={cn('relative size-22 shrink-0', className)}>
      {(['light', 'dark'] as const).map((mode) => {
        const active = resolvedTheme === mode
        const mascot = MASCOTS[mode]
        return (
          <div
            key={mode}
            inert={!active}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Mascot
              directions={mascot.directions}
              reactions={mascot.reactions}
              size={SIZE}
              label={mascot.name}
              className={cn(
                'rounded-full outline-none transition-opacity duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none',
                frame && 'pointer-events-none opacity-0',
              )}
            />
            {/* Held expression: same sheet + cell technique as the library. */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 bg-size-[300%_300%] bg-no-repeat transition-opacity duration-150 motion-reduce:transition-none',
                frame ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                backgroundImage: `url(${mascot[frame?.sheet ?? 'reactions']})`,
                backgroundPosition: frame?.position ?? '0% 0%',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
