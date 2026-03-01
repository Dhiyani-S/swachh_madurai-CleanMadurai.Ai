"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, UserRole } from "@/lib/store"
import { Recycle, ChevronRight, UserPlus, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, users, language, setLanguage } = useStore()
  
  const [role, setRole] = React.useState<UserRole>('citizen')
  const [userId, setUserId] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!language) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 z-20 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40">
              <Recycle className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-headline font-bold text-white tracking-tighter">CleanMadurai<span className="text-primary">.AI</span></h1>
              <p className="text-white/60 font-medium">Making Madurai the Cleanest City in India</p>
            </div>
          </div>
          
          <Card className="p-10 rounded-[3rem] border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 font-headline text-white">Choose Language / மொழியைத் தேர்ந்தெடுக்கவும்</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-20 text-xl font-bold rounded-3xl flex justify-between px-8 bg-white/5 hover:bg-white/10 border-white/10 text-white group"
                variant="outline"
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">English</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Global Interface</span>
                </div>
                <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-20 text-xl font-bold rounded-3xl flex justify-between px-8 bg-white/5 hover:bg-white/10 border-white/10 text-white group"
                variant="outline"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg">தமிழ் (Tamil)</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">மதுரை வட்டார மொழி</span>
                </div>
                <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-white/40 font-bold text-xs uppercase tracking-[0.2em]">
               <div className="flex flex-col items-center"><span>142</span><span className="text-[8px] opacity-60">Tasks</span></div>
               <div className="flex flex-col items-center"><span>2,847kg</span><span className="text-[8px] opacity-60">Waste</span></div>
               <div className="flex flex-col items-center"><span>127</span><span className="text-[8px] opacity-60">Active</span></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const t = translations[language];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const existingUser = users.find(u => u.id === userId.trim() && u.password === password && (u.role === role))
    if (!existingUser) {
      toast({ title: t.signIn + " Failed", description: "Invalid credentials or unauthorized role.", variant: "destructive" })
      return
    }
    setCurrentUser(existingUser)
    router.push('/dashboard')
  }

  const handleDemoFill = (targetRole: UserRole) => {
    const demoUser = users.find(u => u.role === targetRole);
    if (demoUser) {
      setUserId(demoUser.id);
      setPassword(demoUser.password || '123');
      setRole(targetRole);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center z-20">
        <div className="mb-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          <h2 className="text-xl font-headline font-bold text-white/80">{t.taglineFull}</h2>
        </div>

        <Card className="w-full border-white/20 bg-white/5 backdrop-blur-[100px] shadow-2xl rounded-[3.5rem] overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 h-16">
              <TabsTrigger value="signin" className="font-bold rounded-3xl text-lg data-[state=active]:bg-primary data-[state=active]:text-white text-white/60">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold rounded-3xl text-lg data-[state=active]:bg-primary data-[state=active]:text-white text-white/60">{t.register}</TabsTrigger>
            </TabsList>

            <div className="p-10 space-y-8">
              <TabsContent value="signin" className="mt-0 space-y-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold ml-2 text-white/60 uppercase text-[10px] tracking-widest">{t.userId}</Label>
                    <Input placeholder="Enter ID" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl text-lg" required value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-2 text-white/60 uppercase text-[10px] tracking-widest">{t.password}</Label>
                    <Input type="password" placeholder="••••" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl text-lg" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-2 text-white/60 uppercase text-[10px] tracking-widest">{t.accessRole}</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl text-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-950/90 border-white/10 text-white rounded-2xl backdrop-blur-xl">
                        <SelectItem value="commissioner">{t.commissioner}</SelectItem>
                        <SelectItem value="ward_admin">{t.wardAdmin}</SelectItem>
                        <SelectItem value="zone_admin">{t.zoneAdmin}</SelectItem>
                        <SelectItem value="worker">{t.worker}</SelectItem>
                        <SelectItem value="citizen">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 mt-4 rounded-2xl shadow-2xl shadow-primary/30">
                    {t.signIn} <ChevronRight className="h-6 w-6 ml-2" />
                  </Button>
                </form>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-[10px] font-bold text-white/40 text-center uppercase tracking-[0.2em] mb-4">Quick Demo Access</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(['commissioner', 'ward_admin', 'zone_admin', 'worker', 'citizen'] as UserRole[]).map((r) => (
                      <Button 
                        key={r} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 rounded-full border border-white/5"
                        onClick={() => handleDemoFill(r)}
                      >
                        {t[r as keyof typeof t] || r}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 text-center py-10 space-y-6">
                <div className="h-20 w-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Public Access</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                  {t.workerSelfRegisterBlocked}
                </p>
                <Button className="w-full h-14 bg-secondary text-secondary-foreground font-bold rounded-2xl" onClick={() => handleDemoFill('citizen')}>
                  Register as Citizen
                </Button>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}