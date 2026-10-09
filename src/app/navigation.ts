import { AppWindow, Database, LayoutDashboard, Tags, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export interface NavLinkItem {
  title: string
  to: string
  icon: LucideIcon
}

export interface NavGroupItem {
  title: string
  icon: LucideIcon
  items: NavLinkItem[]
}

/** Sidebar navigation. Add new masterlist modules under "Masterlist". */
export const NAVIGATION: (NavLinkItem | NavGroupItem)[] = [
  { title: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  {
    title: 'Masterlist',
    icon: Database,
    items: [
      { title: 'System Category', to: ROUTES.systemCategories, icon: Tags },
      { title: 'System', to: ROUTES.systems, icon: AppWindow },
    ],
  },
]
