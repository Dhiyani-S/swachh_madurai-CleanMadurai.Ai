"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Recycle, 
  LayoutDashboard, 
  ClipboardList, 
  Bell, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Map,
  MessageSquareWarning,
  Award
} from "lucide-react"
import { useStore } from "@/lib/store"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setCurrentUser } = useStore()

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/')
  }

  const roleRoutes = {
    'Corporation Commissioner': [
      { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/commissioner' },
      { name: 'Ward Performance', icon: BarChart3, href: '/dashboard/commissioner/performance' },
      { name: 'Reports', icon: ClipboardList, href: '/dashboard/commissioner/reports' },
    ],
    'Ward Admin': [
      { name: 'Ward Dashboard', icon: LayoutDashboard, href: '/dashboard/ward-admin' },
      { name: 'Zone Monitoring', icon: Map, href: '/dashboard/ward-admin/zones' },
      { name: 'Tasks', icon: ClipboardList, href: '/dashboard/ward-admin/tasks' },
    ],
    'Zone Admin': [
      { name: 'Zone Dashboard', icon: LayoutDashboard, href: '/dashboard/zone-admin' },
      { name: 'Team Mgmt', icon: Users, href: '/dashboard/zone-admin/teams' },
      { name: 'Task Board', icon: ClipboardList, href: '/dashboard/zone-admin/tasks' },
    ],
    'Worker': [
      { name: 'Tasks', icon: ClipboardList, href: '/dashboard/worker' },
      { name: 'Rewards', icon: Award, href: '/dashboard/worker/rewards' },
    ],
    'Citizen': [
      { name: 'My Portal', icon: LayoutDashboard, href: '/dashboard/citizen' },
      { name: 'Request History', icon: ClipboardList, href: '/dashboard/citizen/history' },
    ],
  }

  const routes = currentUser ? roleRoutes[currentUser.role] : []

  return (
    <div className="hidden border-r bg-card md:block w-64 h-screen fixed left-0 top-0">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-headline font-bold text-xl text-primary">
            <Recycle className="h-6 w-6" />
            <span>CleanMadurai</span>
          </Link>
        </div>
        <div className="flex-1 px-4 py-4 space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <span className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                pathname === route.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                <route.icon className="h-4 w-4" />
                {route.name}
              </span>
            </Link>
          ))}
          <div className="pt-4 border-t mt-4">
            <Link href="/settings">
              <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
                <Settings className="h-4 w-4" />
                Settings
              </span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-xs font-semibold text-primary mb-1">{currentUser?.role}</p>
            <p className="text-sm font-bold truncate">{currentUser?.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}