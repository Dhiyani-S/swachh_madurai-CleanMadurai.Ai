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

  if (!language) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Recycle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-foreground">CleanMadurai<span className="text-primary">.AI</span></h1>
            </div>
          </div>
          
          <Card className="p-8 rounded-xl border shadow-md">
            <h2 className="text-2xl font-bold mb-8 font-headline">மொழியைத் தேர்ந்தெடுக்கவும்</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setLanguage('en')}
                className="h-16 text-lg font-bold rounded-xl flex justify-between px-6"
                variant="outline"
              >
                <span>English</span>
                <ChevronRight className="h-5 w-5 text-primary" />
              </Button>
              <Button 
                onClick={() => setLanguage('ta')}
                className="h-16 text-lg font-bold rounded-xl flex justify-between px-6"
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center">
        <div className="mb-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          <h2 className="text-xl font-headline font-bold text-muted-foreground">{t.taglineFull}</h2>
        </div>

        <Card className="w-full border shadow-lg rounded-xl overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 h-14">
              <TabsTrigger value="signin" className="font-bold rounded-lg text-md data-[state=active]:bg-background data-[state=active]:text-primary">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold rounded-lg text-md data-[state=active]:bg-background data-[state=active]:text-primary">{t.register}</TabsTrigger>
            </TabsList>

            <div className="p-8 space-y-6">
              <TabsContent value="signin" className="mt-0 space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">{t.userId}</Label>
                    <Input placeholder="ID" className="h-12" required value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">{t.password}</Label>
                    <Input type="password" placeholder="••••" className="h-12" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">{t.accessRole}</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                        <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                        <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                        <SelectItem value="Worker">{t.worker}</SelectItem>
                        <SelectItem value="Citizen">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4">
                    {t.signIn} <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">User ID</Label>
                    <Input placeholder="Enter ID" className="h-12" required value={regId} onChange={e => setRegId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">Password</Label>
                    <Input type="password" placeholder="••••" className="h-12" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">Select Role</Label>
                    <Select value={regRole} onValueChange={(val) => setRegRole(val as UserRole)}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporation Commissioner">{t.commissioner}</SelectItem>
                        <SelectItem value="Ward Admin">{t.wardAdmin}</SelectItem>
                        <SelectItem value="Zone Admin">{t.zoneAdmin}</SelectItem>
                        <SelectItem value="Worker">{t.worker}</SelectItem>
                        <SelectItem value="Citizen">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4">
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
