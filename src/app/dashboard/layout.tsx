"use client"

import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, Globe, Wifi, WifiOff, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, language, setLanguage, setCurrentUser, notifications, markNotificationRead } = useStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (!currentUser) router.push('/')
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentUser, router])

  if (!mounted || !currentUser) return null

  const t = translations[language || 'en'];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-transparent">
      <div className="relative z-50 hidden md:block">
        <DashboardSidebar />
      </div>
      
      <div className="relative z-40 flex-1 md:ml-64 flex flex-col min-h-screen bg-transparent">
        <header className="h-20 glass-header px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 w-64 group">
              <Search className="h-4 w-4 text-white/40" />
              <input placeholder="Search tasks..." className="bg-transparent border-none text-xs outline-none w-full text-white" />
            </div>
            <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1 hidden sm:flex bg-white/5 border-white/20 text-white uppercase tracking-widest text-[8px] font-bold">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? t.liveMode : t.offlineReady}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 font-bold text-[10px] bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full h-9"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            >
              <Globe className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline uppercase tracking-widest">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 rounded-full">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-black" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-zinc-950/90 border-white/10 text-white rounded-[2rem] backdrop-blur-3xl">
                <DropdownMenuLabel className="flex justify-between items-center px-4 pt-4">
                  <span className="text-sm font-bold uppercase tracking-widest">Notifications</span>
                  <Badge className="bg-primary text-black font-bold">{unreadCount} New</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="max-h-[400px] overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-xs text-white/40 italic">No new alerts</p>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem 
                        key={n.id} 
                        className="px-4 py-3 flex flex-col items-start gap-1 focus:bg-white/5 cursor-pointer"
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex justify-between w-full">
                          <span className="font-bold text-[10px] uppercase text-primary">{n.title}</span>
                          <span className="text-[8px] text-white/40">{new Date(n.time).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2">{n.message}</p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 px-2 text-white hover:bg-white/5 rounded-full">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-primary/20">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="font-bold text-xs">{currentUser.name}</span>
                    <span className="text-[8px] text-white/40 uppercase tracking-widest">{currentUser.role}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950/90 border-white/10 text-white rounded-[1.5rem] backdrop-blur-xl">
                <DropdownMenuLabel className="font-bold">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/10 cursor-pointer" onClick={() => {
                   setCurrentUser(null)
                   router.push('/')
                }}>Logout Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 flex justify-center items-start overflow-y-auto bg-transparent">
          <div className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700 bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}