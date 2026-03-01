
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, UserRole } from "@/lib/store"
import { Recycle, Globe, ChevronRight, AlertCircle, Sparkles, Building2, MapPin, Users2, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, users, language, setLanguage } = useStore()
  
  const [role, setRole] = React.useState<UserRole>('Citizen')
  const [userId, setUserId] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!language) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,200,117,0.1),transparent)]" />
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(0,200,117,0.3)] border border-primary/50">
              <Recycle className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-headline font-bold text-white tracking-tighter">CleanMadurai<span className="text-primary">.AI</span></h1>
              <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase">Smart City Waste Ecosystem</p>
            </div>
          </div>
          
          <Card className="border-white/10 shadow-2xl p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl">
            <h2 className="text-xl font-bold mb-8 text-white flex items-center justify-center gap-3">
              <Globe className="h-5 w-5 text-primary" /> Select Language / மொழியைத் தேர்ந்தெடுக்கவும்
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-20 text-xl font-bold rounded-2xl border-white/10 hover:border-primary/50 transition-all flex justify-between px-8 bg-white/5 hover:bg-white/10 text-white"
                variant="outline"
              >
                <span>English</span>
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-20 text-xl font-bold rounded-2xl border-white/10 hover:border-primary/50 transition-all flex justify-between px-8 font-body bg-white/5 hover:bg-white/10 text-white"
                variant="outline"
              >
                <span>தமிழ் (Tamil)</span>
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-2xl font-bold text-white">142+</p>
              <p className="text-[10px] text-primary font-bold uppercase">Tasks Today</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-2xl font-bold text-white">2.8t</p>
              <p className="text-[10px] text-primary font-bold uppercase">Waste Managed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const t = translations[language];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const existingUser = users.find(u => u.id === userId.trim() && u.password === password && u.role === role)
    if (!existingUser) {
      toast({ title: t.signIn + " Failed", description: "Invalid credentials.", variant: "destructive" })
      return
    }
    setCurrentUser(existingUser)
    router.push('/dashboard')
  }

  const handleQuickLogin = (roleName: UserRole, id: string) => {
    setRole(roleName)
    setUserId(id)
    setPassword('123')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,200,117,0.1),transparent)]" />
      <div className="absolute top-0 right-0 p-8">
        <Button variant="ghost" onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} className="text-white hover:bg-white/10 gap-2 font-bold">
          <Globe className="h-4 w-4" /> {language === 'en' ? 'தமிழ்' : 'English'}
        </Button>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
              <Recycle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-headline font-bold text-white tracking-tighter">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-7xl font-headline font-bold leading-none text-white">{t.tagline}</h2>
            <p className="text-xl text-white/50 max-w-lg">{t.taglineFull}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Tasks Completed", value: "142", icon: Sparkles },
              { label: "Wards Active", value: "100%", icon: Building2 },
              { label: "Zones Connected", value: "5/5", icon: MapPin },
              { label: "Efficiency Rate", value: "94%", icon: Trophy }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1 group hover:bg-white/10 transition-all">
                <stat.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-3xl font-headline font-bold text-white">{stat.value}</p>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="border-white/10 shadow-2xl rounded-[3rem] bg-white/5 backdrop-blur-3xl overflow-hidden">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 p-2 h-16 rounded-none">
                <TabsTrigger value="signin" className="font-bold rounded-2xl text-white data-[state=active]:bg-primary">{t.signIn}</TabsTrigger>
                <TabsTrigger value="signup" className="font-bold rounded-2xl text-white data-[state=active]:bg-primary">{t.register}</TabsTrigger>
              </TabsList>

              <div className="p-8 space-y-6">
                <TabsContent value="signin" className="mt-0 space-y-6">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">{t.userId}</Label>
                        <Input placeholder="ID (e.g. 01)" className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary" required value={userId} onChange={e => setUserId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">{t.password}</Label>
                        <Input type="password" placeholder="••••" className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" required value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">{t.accessRole}</Label>
                        <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                          <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                            <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                            <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                            <SelectItem value="Worker">{t.worker}</SelectItem>
                            <SelectItem value="Citizen">Citizen / பொதுமக்கள்</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 group">
                      {t.signIn} <ChevronRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 text-center">Quick Demo Access</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Comm", role: "Corporation Commissioner", id: "01" },
                        { label: "Ward", role: "Ward Admin", id: "02" },
                        { label: "Zone", role: "Zone Admin", id: "03" },
                        { label: "Work", role: "Worker", id: "04" },
                        { label: "Ctz", role: "Citizen", id: "05" }
                      ].map(demo => (
                        <Button 
                          key={demo.id} 
                          variant="outline" 
                          className="h-10 text-[10px] font-bold bg-white/5 border-white/10 text-white hover:bg-primary/20"
                          onClick={() => handleQuickLogin(demo.role as UserRole, demo.id)}
                        >
                          {demo.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <p className="text-white/50 text-center py-12">Registration module enhanced for administrative validation. Please contact Ward Admin for official credentials.</p>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
