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

  // Mapping routes for each role with robust normalization
  const roleRoutes: Record<string, Array<{ name: string; icon: any; href: string }>> = {
    'corporation commissioner': [
      { name: t.performance, icon: LayoutDashboard, href: '/dashboard/commissioner' },
      { name: 'Analytics', icon: ClipboardList, href: '/dashboard/commissioner/reports' },
    ],
    'ward admin': [
      { name: t.wardAdmin, icon: LayoutDashboard, href: '/dashboard/ward-admin' },
      { name: 'Tasks', icon: ClipboardList, href: '/dashboard/ward-admin/tasks' },
    ],
    'zone admin': [
      { name: t.zoneAdmin, icon: LayoutDashboard, href: '/dashboard/zone-admin' },
      { name: 'Team Mgmt', icon: Users, href: '/dashboard/zone-admin/teams' },
    ],
    'worker': [
      { name: t.activeTasks, icon: ClipboardList, href: '/dashboard/worker' },
      { name: t.rewards, icon: Award, href: '/dashboard/worker/rewards' },
    ],
    'citizen': [
      { name: t.citizenPortal, icon: LayoutDashboard, href: '/dashboard/citizen' },
      { name: 'History', icon: ClipboardList, href: '/dashboard/citizen/history' },
    ],
  }

  // Fallback for case sensitivity or slight name mismatches
  const currentRole = currentUser?.role?.toLowerCase() || '';
  const routes = roleRoutes[currentRole] || roleRoutes[currentRole.replace('_', ' ')] || [];

  return (
    <div className="hidden border-r border-white/10 glass-sidebar md:block w-64 h-screen fixed left-0 top-0 z-50">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-20 items-center px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 font-headline font-bold text-xl text-white">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Recycle className="h-6 w-6 text-black" />
            </div>
            <span>CleanMadurai</span>
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Main Menu</p>
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <span className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all group",
                pathname === route.href 
                  ? "bg-primary text-black shadow-xl shadow-primary/30" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}>
                <route.icon className={cn("h-4 w-4", pathname === route.href ? "text-black" : "group-hover:scale-110 transition-transform")} />
                {route.name}
              </span>
            </Link>
          ))}
          
          <div className="pt-6 border-t border-white/10 mt-6 space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Account</p>
            <Link href="/dashboard/settings">
              <span className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all group",
                pathname === '/dashboard/settings' 
                  ? "bg-primary text-black shadow-xl shadow-primary/30" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}>
                <Settings className="h-4 w-4" />
                {t.settings}
              </span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="rounded-[2rem] bg-zinc-900/50 backdrop-blur-md p-4 shadow-sm border border-white/10">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">{currentUser?.role}</p>
            <p className="text-sm font-bold truncate text-white">{currentUser?.name}</p>
            <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg w-fit">
              <Zap className="h-3 w-3 text-primary fill-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase">Live Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
