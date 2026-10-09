import { Wifi, WifiOff } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { cn } from '@/lib/utils'

/**
 * Header connection indicator. Reports only what the browser knows: online
 * (connected to a network) or offline, plus the connection type when the
 * browser exposes it. Status changes are announced (role="status").
 */
export function NetworkStatusIndicator() {
  const { online, connectionType } = useNetworkStatus()
  const label = online
    ? `Online${connectionType ? ` (${connectionType})` : ''}`
    : 'Offline'
  const detail = online
    ? 'Your device is connected to a network.'
    : 'No network connection. Changes can’t be saved until you reconnect.'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="status"
          tabIndex={0}
          aria-label={`${label}. ${detail}`}
          className={cn(
            'flex size-10 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:size-9',
            online ? 'text-success' : 'text-destructive',
          )}
        >
          {online ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{label}</p>
        <p className="opacity-80">{detail}</p>
      </TooltipContent>
    </Tooltip>
  )
}
