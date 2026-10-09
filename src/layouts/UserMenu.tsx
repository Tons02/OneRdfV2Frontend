import { useState } from 'react'
import { ImageUp, KeyRound, LogOut, UserRound, type LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser, useLogout } from '@/features/auth'
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage'
import { APP_NAME } from '@/lib/constants'

/** Not built yet: shown disabled (and skipped by keyboard navigation), no handlers. */
const UPCOMING: { label: string; icon: LucideIcon }[] = [
  { label: 'Personal Information', icon: UserRound },
  { label: 'Change Profile Picture', icon: ImageUp },
  { label: 'Change Password', icon: KeyRound },
]

export function UserMenu() {
  const user = useAppSelector(selectCurrentUser)
  const logout = useLogout()
  const avatarSrc = useAuthenticatedImage(user?.profile_picture)
  const [confirmLogout, setConfirmLogout] = useState(false)

  if (!user) return null
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()

  return (
    <>
      {/* Non-modal so focus/pointer handling doesn't fight the logout AlertDialog it opens. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            aria-label={`Account menu for ${user.full_name}`}
          >
            <Avatar>
              {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" collisionPadding={8} className="w-64 max-w-[calc(100vw-1rem)]">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email ?? user.username}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {UPCOMING.map(({ label, icon: Icon }) => (
              <DropdownMenuItem key={label} disabled>
                <Icon />
                {label}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Soon
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmLogout(true)}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out?"
        description={`You will need to sign in again to continue using ${APP_NAME}.`}
        confirmLabel="Sign out"
        loadingText="Signing out…"
        onConfirm={logout}
      />
    </>
  )
}
