import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NAVIGATION, type NavGroupItem } from '@/app/navigation'
import { APP_NAME, ROUTES } from '@/lib/constants'
import oneRdfLogo from '@/assets/images/one-rdf-logo-yellow-version.png'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  // Close the mobile sheet after navigating.
  const onNavigate = () => isMobile && setOpenMobile(false)
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={APP_NAME}>
              <Link to={ROUTES.dashboard} onClick={onNavigate}>
                {/* Transparent logo with dark "SYSTEM" text: give it a light disc in dark mode. */}
                <img
                  src={oneRdfLogo}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full dark:bg-foreground"
                />
                <span className="font-heading font-semibold tracking-tight">{APP_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAVIGATION.map((item) =>
              'items' in item ? (
                <NavGroup key={item.title} group={item} isActive={isActive} onNavigate={onNavigate} />
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.title}>
                    <NavLink to={item.to} onClick={onNavigate}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function NavGroup({
  group,
  isActive,
  onNavigate,
}: {
  group: NavGroupItem
  isActive: (to: string) => boolean
  onNavigate: () => void
}) {
  const hasActiveChild = group.items.some((item) => isActive(item.to))

  return (
    <Collapsible asChild defaultOpen={hasActiveChild} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={group.title} isActive={hasActiveChild}>
            <group.icon />
            <span>{group.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.title}>
                <SidebarMenuSubButton asChild isActive={isActive(item.to)}>
                  <NavLink to={item.to} onClick={onNavigate}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
