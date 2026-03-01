
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
import { Recycle, Globe, ChevronRight, Sparkles, Building2, MapPin, Trophy, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, users, addUser, language, setLanguage } = useStore()
  
  const [role, setRole] = React.useState<UserRole>('Citizen')
  const [userId, setUserId] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  const [regId, setRegId] = React.useState('')
  const [regPassword, setRegPassword] = React.useState('')
  const [regRole, setRegRole] = React.useState<UserRole>('Citizen')
  const [regZone, setRegZone] = React.useState('')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Unified Heritage Image
  const unifiedBg = PlaceHolderImages.find(img => img.id === 'madurai-unified')?.imageUrl

  if (!language) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-100 z-0" 
          style={{ backgroundImage: `url(${unifiedBg})` }}
        />
        <div className="absolute inset-0 bg-black/20 z-[1]" />
        
        <div className="max-w-md w-full space-y-8 animate-in fade-in duration-700 relative z-10">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="h-28 w-28 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20">
              <Recycle className="h-14 w-14 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-headline font-bold text-white tracking-tighter drop-shadow-2xl">CleanMadurai<span className="text-primary">.AI</span></h1>
            </div>
          </div>
          
          <Card className="border-white/20 shadow-2xl p-8 rounded-[3.5rem] bg-black/30 backdrop-blur-[100px] border-2">
            <h2 className="text-2xl font-bold mb-8 text-white font-headline">மொழியைத் தேர்ந்தெடுக்கவும்</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-20 text-xl font-bold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white flex justify-between px-8"
                variant="outline"
              >
                <span>English</span>
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-20 text-xl font-bold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white flex justify-between px-8"
                variant="outline"
              >
                <span>தமிழ் (Tamil)</span>
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const t = translations[language];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const existingUser = users.find(u => u.id === userId.trim() && u.password === password && (u.role === role || role === 'Citizen'))
    if (!existingUser) {
      toast({ title: t.signIn + " Failed", description: "Invalid credentials.", variant: "destructive" })
      return
    }
    setCurrentUser(existingUser)
    router.push('/dashboard')
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.find(u => u.id === regId)) {
      toast({ title: "Registration Failed", description: "User ID already exists.", variant: "destructive" })
      return
    }
    const newUser = { id: regId, password: regPassword, name: regId, role: regRole, zoneId: regZone || undefined, rewardPoints: 0 };
    addUser(newUser)
    toast({ title: "Success", description: "Account created! You can now sign in." })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-100 z-0" 
        style={{ backgroundImage: `url(${unifiedBg})` }}
      />
      <div className="fixed inset-0 bg-black/10 z-[1]" />
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
              <Recycle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-headline font-bold text-white tracking-tighter drop-shadow-lg">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-7xl font-headline font-bold leading-none text-white drop-shadow-2xl">{t.tagline}</h2>
            <p className="text-2xl text-white/90 max-w-lg bg-black/30 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/20 shadow-2xl">{t.taglineFull}</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="border-white/10 shadow-2xl rounded-[4rem] bg-black/20 backdrop-blur-[100px] overflow-hidden border-2">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 p-2 h-20 rounded-none border-b border-white/10">
                <TabsTrigger value="signin" className="font-bold rounded-[2.5rem] text-white text-lg data-[state=active]:bg-primary">{t.signIn}</TabsTrigger>
                <TabsTrigger value="signup" className="font-bold rounded-[2.5rem] text-white text-lg data-[state=active]:bg-primary">{t.register}</TabsTrigger>
              </TabsList>

              <div className="p-10 space-y-6">
                <TabsContent value="signin" className="mt-0 space-y-6">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">{t.userId}</Label>
                        <Input placeholder="ID" className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg" required value={userId} onChange={e => setUserId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">{t.password}</Label>
                        <Input type="password" placeholder="••••" className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg" required value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">{t.accessRole}</Label>
                        <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                          <SelectTrigger className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-zinc-900/90 border-white/20 text-white backdrop-blur-2xl">
                            <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                            <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                            <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                            <SelectItem value="Worker">{t.worker}</SelectItem>
                            <SelectItem value="Citizen">Citizen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 rounded-[2.5rem] text-white">
                      {t.signIn} <ChevronRight className="h-8 w-8 ml-2" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-6">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">User ID</Label>
                        <Input placeholder="Enter ID" className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg" required value={regId} onChange={e => setRegId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">Password</Label>
                        <Input type="password" placeholder="••••" className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white font-bold ml-1">Select Role</Label>
                        <Select value={regRole} onValueChange={(val) => setRegRole(val as UserRole)}>
                          <SelectTrigger className="h-16 bg-black/40 border-white/10 text-white rounded-[1.5rem] text-lg"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-zinc-900/90 border-white/20 text-white backdrop-blur-2xl">
                            <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                            <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                            <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                            <SelectItem value="Worker">{t.worker}</SelectItem>
                            <SelectItem value="Citizen">Citizen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-20 text-2xl font-bold bg-primary hover:bg-primary/90 rounded-[2.5rem] text-white">
                      <UserPlus className="mr-2 h-8 w-8" /> Register Account
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
