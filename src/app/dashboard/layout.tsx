"use client"

import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, Globe, Wifi, WifiOff } from "lucide-react"
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
  const { currentUser, language, setLanguage, setCurrentUser } = useStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!currentUser) {
      router.push('/')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentUser, router])

  if (!mounted || !currentUser) return null

  const t = translations[language || 'en'];

  return (
    <div className="relative min-h-screen bg-background flex">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      
      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1 hidden sm:flex">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? t.liveMode : t.offlineReady}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 font-bold text-xs"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">{currentUser.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => {
                   setCurrentUser(null)
                   router.push('/')
                }}>{t.logout}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 flex justify-center items-start overflow-y-auto">
          <div className="max-w-6xl w-full">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 min-h-[80vh]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
