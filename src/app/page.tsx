
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, UserRole, User, AppLanguage } from "@/lib/store"
import { Recycle, Globe, ChevronRight, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, users, addUser, language, setLanguage } = useStore()
  
  const [role, setRole] = React.useState<UserRole>('Citizen')
  const [userId, setUserId] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [zone, setZone] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const t = translations[language || 'en'];

  if (!language) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl">
              <Recycle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          
          <Card className="border-none shadow-2xl p-8 rounded-3xl bg-white/80 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Choose Your Language / மொழியைத் தேர்ந்தெடுக்கவும்
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-16 text-lg font-bold rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all"
                variant="outline"
              >
                English
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-16 text-lg font-bold rounded-2xl border-2 border-transparent hover:border-primary/50 transition-all font-body"
                variant="outline"
              >
                தமிழ் (Tamil)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const existingUser = users.find(u => 
      u.id === userId.trim() && 
      u.password === password && 
      u.role === role
    )
    if (!existingUser) {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials or incorrect role.",
        variant: "destructive",
      })
      return
    }
    setCurrentUser(existingUser)
    const routes: Record<UserRole, string> = {
      'Corporation Commissioner': '/dashboard/commissioner',
      'Ward Admin': '/dashboard/ward-admin',
      'Zone Admin': '/dashboard/zone-admin',
      'Worker': '/dashboard/worker',
      'Citizen': '/dashboard/citizen',
    }
    router.push(routes[role])
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.find(u => u.id === userId.trim())) {
      toast({ title: "Registration Failed", description: "This User ID is already taken.", variant: "destructive" })
      return
    }
    addUser({
      id: userId.trim(), password, name: userId.trim(), role, rewardPoints: 0,
      zoneId: (role === 'Worker' || role === 'Zone Admin') ? zone : undefined,
    })
    toast({ title: "Success", description: "Account created! You can now sign in." })
    setUserId(''); setPassword('');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-100 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">{t.appName}</h1>
          </div>
          <h2 className="text-5xl font-headline font-bold leading-tight">{t.tagline}</h2>
          <div className="flex items-center gap-2 pt-4">
             <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} className="gap-2 font-bold">
               <Globe className="h-4 w-4" /> Switch to {language === 'en' ? 'Tamil' : 'English'}
             </Button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1.5 h-14 rounded-2xl">
              <TabsTrigger value="signin" className="font-bold rounded-xl">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold rounded-xl">{t.register}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <Card className="border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-xl">
                <CardHeader><CardTitle className="font-headline text-2xl">{t.signIn}</CardTitle></CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="font-bold">{t.userId}</Label>
                      <Input placeholder={t.userId} className="h-12" required value={userId} onChange={e => setUserId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">{t.password}</Label>
                      <Input type="password" className="h-12" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">{t.accessRole}</Label>
                      <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                          <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                          <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                          <SelectItem value="Worker">{t.worker}</SelectItem>
                          <SelectItem value="Citizen">Citizen / பொதுமக்கள்</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl gap-2 group">
                      {t.signIn} <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
               <Card className="border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-xl">
                 <CardHeader><CardTitle className="font-headline text-2xl">{t.register}</CardTitle></CardHeader>
                 <form onSubmit={handleSignUp}>
                   <CardContent className="space-y-4">
                     <div className="space-y-2">
                       <Label>{t.userId}</Label>
                       <Input className="h-12" required value={userId} onChange={e => setUserId(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <Label>{t.password}</Label>
                       <Input type="password" className="h-12" required value={password} onChange={e => setPassword(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <Label>{t.accessRole}</Label>
                       <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                         <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Worker">{t.worker}</SelectItem>
                           <SelectItem value="Citizen">Citizen / பொதுமக்கள்</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     {(role === 'Worker') && (
                        <div className="space-y-2">
                          <Label>Zone</Label>
                          <Select value={zone} onValueChange={setZone}>
                            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ZA - Zone A (North)">ZA - Zone A (North)</SelectItem>
                              <SelectItem value="ZB - Zone B (South)">ZB - Zone B (South)</SelectItem>
                              <SelectItem value="ZC - Zone C (East)">ZC - Zone C (East)</SelectItem>
                              <SelectItem value="ZD - Zone D (West)">ZD - Zone D (West)</SelectItem>
                              <SelectItem value="ZE - Zone E (Central)">ZE - Zone E (Central)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                     )}
                   </CardContent>
                   <CardFooter>
                     <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-white rounded-2xl">{t.register}</Button>
                   </CardFooter>
                 </form>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
