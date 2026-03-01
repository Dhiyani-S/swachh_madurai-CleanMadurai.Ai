
"use client"

import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, Globe, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, language, setLanguage, tasks, updateTask, setCurrentUser } = useStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

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

  useEffect(() => {
    if (!mounted) return;

    const checkTimeouts = () => {
      const now = new Date();
      const timeoutLimit = 30 * 60 * 1000; 

      tasks.forEach(task => {
        if (task.status === 'Pending' && task.assignedTo && task.assignedAt) {
          const assignedTime = new Date(task.assignedAt);
          const diff = now.getTime() - assignedTime.getTime();

          if (diff > timeoutLimit) {
            updateTask(task.id, { assignedTo: undefined });
            
            if (currentUser?.role === 'Zone Admin' || currentUser?.id === task.assignedTo) {
              toast({
                title: language === 'ta' ? "பணி மீண்டும் ஒதுக்கப்பட்டது" : "Task Re-assigned",
                description: language === 'ta' ? "30 நிமிடம் தாமதமானதால் பணி திரும்பப் பெறப்பட்டது." : `Task "${task.name}" unassigned due to timeout.`,
                variant: "destructive"
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkTimeouts, 10000); 
    return () => clearInterval(interval);
  }, [mounted, tasks, updateTask, currentUser, toast, language]);

  if (!mounted || !currentUser) return null

  const t = translations[language || 'en'];
  const maduraiBg = PlaceHolderImages.find(img => img.id === 'madurai-temple-bg')?.imageUrl

  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-primary selection:text-white">
      {/* Fixed Background Layer with High Opacity for Aerial Impact */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-70 z-0 transition-opacity duration-1000" 
        style={{ backgroundImage: `url(${maduraiBg})` }}
        data-ai-hint="madurai temple aerial"
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/40 to-primary/10 z-1" />
      
      <div className="relative z-10 flex min-h-screen">
        <DashboardSidebar />
        
        <div className="flex-1 md:ml-64 flex flex-col">
          <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1 hidden sm:flex border-white/20 text-white">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? t.liveMode : t.offlineReady}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 font-bold text-xs text-white hover:bg-white/10"
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 text-white hover:bg-white/10">
                    <div className="h-8 w-8 rounded-full bg-primary/40 border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline font-medium text-sm">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-white/10 text-white">
                  <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => {
                     setCurrentUser(null)
                     router.push('/')
                  }}>{t.logout}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-12 overflow-y-auto">
            {/* Centered Content Wrapper with Glassmorphism */}
            <div className="max-w-6xl mx-auto w-full">
              <div className="bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white/20 min-h-[calc(100vh-10rem)]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
