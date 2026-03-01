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
import { Recycle, ChevronRight, UserPlus } from "lucide-react"
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

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const backgroundImage = PlaceHolderImages.find(img => img.id === 'madurai-unified')?.imageUrl;

  if (!language) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm" />
        
        <div className="max-w-md w-full space-y-8 z-20 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
              <Recycle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-white">CleanMadurai<span className="text-primary">.AI</span></h1>
            </div>
          </div>
          
          <Card className="p-8 rounded-[2.5rem] border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 font-headline text-white">மொழியைத் தேர்ந்தெடுக்கவும்</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-16 text-lg font-bold rounded-2xl flex justify-between px-6 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                variant="outline"
              >
                <span>English</span>
                <ChevronRight className="h-5 w-5 text-primary" />
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-16 text-lg font-bold rounded-2xl flex justify-between px-6 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                variant="outline"
              >
                <span>தமிழ் (Tamil)</span>
                <ChevronRight className="h-5 w-5 text-primary" />
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
    const newUser = { id: regId, password: regPassword, name: regId, role: regRole, rewardPoints: 0 };
    addUser(newUser)
    toast({ title: "Success", description: "Account created! You can now sign in." })
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[2px]" />

      <div className="max-w-md w-full flex flex-col items-center z-20">
        <div className="mb-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-white">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          <h2 className="text-xl font-headline font-bold text-white/80">{t.taglineFull}</h2>
        </div>

        <Card className="w-full border-white/20 bg-white/5 backdrop-blur-[80px] shadow-2xl rounded-[3rem] overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 h-14">
              <TabsTrigger value="signin" className="font-bold rounded-2xl text-md data-[state=active]:bg-primary data-[state=active]:text-white text-white/60">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold rounded-2xl text-md data-[state=active]:bg-primary data-[state=active]:text-white text-white/60">{t.register}</TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-6">
              <TabsContent value="signin" className="mt-0 space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">{t.userId}</Label>
                    <Input placeholder="ID" className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl" required value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">{t.password}</Label>
                    <Input type="password" placeholder="••••" className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">{t.accessRole}</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                        <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                        <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                        <SelectItem value="Worker">{t.worker}</SelectItem>
                        <SelectItem value="Citizen">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4 rounded-2xl shadow-lg shadow-primary/30">
                    {t.signIn} <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">User ID</Label>
                    <Input placeholder="Enter ID" className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl" required value={regId} onChange={e => setRegId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">Password</Label>
                    <Input type="password" placeholder="••••" className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-white/80">Select Role</Label>
                    <Select value={regRole} onValueChange={(val) => setRegRole(val as UserRole)}>
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                        <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                        <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                        <SelectItem value="Worker">{t.worker}</SelectItem>
                        <SelectItem value="Citizen">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4 rounded-2xl shadow-lg shadow-primary/30">
                    <UserPlus className="mr-2 h-5 w-5" /> Register Account
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
