
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Recycle, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  Award,
  Zap
} from "lucide-react"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setCurrentUser, language } = useStore()

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/')
  }

  const t = translations[language || 'en'];

  const roleRoutes = {
    'Corporation Commissioner': [
      { name: t.performance, icon: LayoutDashboard, href: '/dashboard/commissioner' },
      { name: 'Analytics', icon: ClipboardList, href: '/dashboard/commissioner/reports' },
    ],
    'Ward Admin': [
      { name: t.wardAdmin, icon: LayoutDashboard, href: '/dashboard/ward-admin' },
      { name: 'Tasks', icon: ClipboardList, href: '/dashboard/ward-admin/tasks' },
    ],
    'Zone Admin': [
      { name: t.zoneAdmin, icon: LayoutDashboard, href: '/dashboard/zone-admin' },
      { name: 'Team Mgmt', icon: Users, href: '/dashboard/zone-admin/teams' },
    ],
    'Worker': [
      { name: t.activeTasks, icon: ClipboardList, href: '/dashboard/worker' },
      { name: t.rewards, icon: Award, href: '/dashboard/worker/rewards' },
    ],
    'Citizen': [
      { name: t.citizenPortal, icon: LayoutDashboard, href: '/dashboard/citizen' },
      { name: 'History', icon: ClipboardList, href: '/dashboard/citizen/history' },
    ],
  }

  const routes = currentUser ? roleRoutes[currentUser.role] : []

  return (
    <div className="hidden border-r bg-card md:block w-64 h-screen fixed left-0 top-0 shadow-lg z-50">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-20 items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-headline font-bold text-xl text-primary">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <span>CleanMadurai</span>
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Main Menu</p>
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <span className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group",
                pathname === route.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}>
                <route.icon className={cn("h-4 w-4", pathname === route.href ? "text-white" : "group-hover:scale-110 transition-transform")} />
                {route.name}
              </span>
            </Link>
          ))}
          
          <div className="pt-6 border-t mt-6 space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Account</p>
            <Link href="/dashboard/settings">
              <span className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:bg-secondary",
                pathname === '/dashboard/settings' ? "bg-primary text-white" : "text-muted-foreground"
              )}>
                <Settings className="h-4 w-4" />
                {t.settings}
              </span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="p-4 bg-secondary/30 border-t">
          <div className="rounded-2xl bg-white p-4 shadow-sm border">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">{currentUser?.role}</p>
            <p className="text-sm font-bold truncate text-slate-900">{currentUser?.name}</p>
            <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-accent/10 rounded-lg w-fit">
              <Zap className="h-3 w-3 text-accent fill-accent" />
              <span className="text-[10px] font-bold text-accent uppercase">Live Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
