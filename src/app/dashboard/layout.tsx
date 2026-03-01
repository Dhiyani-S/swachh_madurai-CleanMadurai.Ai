
"use client"

import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
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
} from "@/dropdown-menu"
import { PlaceHolderImages } from "@/lib/placeholder-images"

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

  const backgroundImage = useMemo(() => {
    return PlaceHolderImages.find(img => img.id === 'madurai-unified')?.imageUrl || PlaceHolderImages[0].imageUrl;
  }, []);

  if (!mounted || !currentUser) return null

  const t = translations[language || 'en'];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* High-Opacity Fixed Background - Shows the whole image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-100 z-0 scale-100 transition-opacity duration-1000 bg-no-repeat" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Extremely subtle overlay to maintain image clarity */}
      <div className="fixed inset-0 bg-black/5 z-[1]" />
      
      <div className="relative z-10 flex min-h-screen">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        
        <div className="flex-1 md:ml-64 flex flex-col">
          {/* Header with ultra-high transparency */}
          <header className="h-16 bg-white/5 backdrop-blur-[120px] border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1 hidden sm:flex border-white/10 text-white bg-white/5 backdrop-blur-md">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? t.liveMode : t.offlineReady}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 font-bold text-xs text-white bg-white/10 backdrop-blur-md border border-white/10"
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 text-white bg-white/10 backdrop-blur-md border border-white/10">
                    <div className="h-8 w-8 rounded-full bg-primary border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline font-medium text-sm">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900/40 backdrop-blur-[120px] border-white/10 text-white">
                  <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="text-rose-400 hover:bg-rose-500/10" onClick={() => {
                     setCurrentUser(null)
                     router.push('/')
                  }}>{t.logout}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center items-start">
            <div className="max-w-6xl w-full">
              {/* Central Glass Container with Extreme Transparency */}
              <div className="bg-white/5 backdrop-blur-[120px] rounded-[3.5rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/10 p-6 md:p-10 min-h-[75vh] transition-all">
                <div className="relative z-10 text-white">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
