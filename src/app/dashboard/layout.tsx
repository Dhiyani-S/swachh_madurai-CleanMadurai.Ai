
"use client"

import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, Search, Menu, Globe, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { translations } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, language, setLanguage, tasks, updateTask } = useStore()
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
                description: language === 'ta' ? "30 நிமிடம் தாமதமானதால் பணி திரும்பப் பெறப்பட்டது." : `Task "${task.name}" was unassigned due to 30-minute response timeout.`,
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

  const isWorker = currentUser.role === 'Worker'
  const t = translations[language || 'en'];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="h-16 border-b bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
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
              variant="ghost" 
              size="sm" 
              className="gap-2 font-bold text-xs"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">{currentUser.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => {
                   router.push('/')
                }}>{t.logout}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
