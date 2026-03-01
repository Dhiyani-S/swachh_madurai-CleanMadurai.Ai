"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, UserRole, User } from "@/lib/store"
import { Recycle, ShieldCheck, MapPin, Users, UserCircle, Globe, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentUser, users, addUser } = useStore()
  
  const [role, setRole] = React.useState<UserRole>('Citizen')
  const [userId, setUserId] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [zone, setZone] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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
        description: "Invalid credentials or incorrect role. Please check your details.",
        variant: "destructive",
      })
      return
    }

    setCurrentUser(existingUser)
    
    const dashboardRoutes: Record<UserRole, string> = {
      'Corporation Commissioner': '/dashboard/commissioner',
      'Ward Admin': '/dashboard/ward-admin',
      'Zone Admin': '/dashboard/zone-admin',
      'Worker': '/dashboard/worker',
      'Citizen': '/dashboard/citizen',
    }
    
    router.push(dashboardRoutes[role])
    
    toast({
      title: "Welcome Back",
      description: `Logged in as ${existingUser.name}`,
    })
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()

    if (users.find(u => u.id === userId.trim())) {
      toast({
        title: "Registration Failed",
        description: "This User ID is already taken.",
        variant: "destructive",
      })
      return
    }

    const newUser: User = {
      id: userId.trim(),
      password: password,
      name: userId.trim(), 
      role: role,
      rewardPoints: 0,
      zoneId: (role === 'Worker' || role === 'Zone Admin') ? zone : undefined,
      teamNumber: role === 'Worker' ? `Team ${userId.trim()}` : undefined,
      teamMembers: role === 'Worker' ? ["Member 1", "Member 2"] : undefined
    }

    addUser(newUser)
    
    toast({
      title: "Success",
      description: "Account created! You can now sign in.",
    })
    
    setUserId('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-100 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">CleanMadurai<span className="text-primary">.AI</span></h1>
          </div>
          <h2 className="text-5xl font-headline font-bold leading-tight">Smart City <br/>Waste Ecosystem.</h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-md">
            The official AI-powered management portal for Madurai Corporation's waste, sensors, and citizen services.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-slate-200" />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 font-bold">400+ Teams</span> city-wide</p>
          </div>
        </div>

        {/* Login Section */}
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden text-center mb-10 space-y-2">
            <h1 className="text-3xl font-headline font-bold text-primary">CleanMadurai.AI</h1>
            <p className="text-muted-foreground font-medium">Smart Waste Management System</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1.5 h-14 rounded-2xl">
              <TabsTrigger value="signin" className="font-bold rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="font-headline text-2xl">Secure Login</CardTitle>
                  <CardDescription>Enter your official credentials to proceed</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-id" className="text-slate-600 font-bold">User ID</Label>
                      <Input id="signin-id" placeholder="Official ID" className="h-12 bg-slate-50 border-slate-200" required value={userId} onChange={e => setUserId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input id="signin-password" type="password" className="h-12 bg-slate-50 border-slate-200" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-role">Access Role</Label>
                      <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporation Commissioner">Corporation Commissioner</SelectItem>
                          <SelectItem value="Ward Admin">Ward Admin</SelectItem>
                          <SelectItem value="Zone Admin">Zone Admin</SelectItem>
                          <SelectItem value="Worker">Worker</SelectItem>
                          <SelectItem value="Citizen">Citizen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl gap-2 group">
                      Access Dashboard <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <Card className="border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Join the Mission</CardTitle>
                  <CardDescription>Register for a cleaner, smarter Madurai</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-id">User ID</Label>
                      <Input id="signup-id" placeholder="Choose a unique ID" className="h-12 bg-slate-50 border-slate-200" required value={userId} onChange={e => setUserId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" className="h-12 bg-slate-50 border-slate-200" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Role</Label>
                      <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporation Commissioner">Corporation Commissioner</SelectItem>
                          <SelectItem value="Ward Admin">Ward Admin</SelectItem>
                          <SelectItem value="Zone Admin">Zone Admin</SelectItem>
                          <SelectItem value="Worker">Worker</SelectItem>
                          <SelectItem value="Citizen">Citizen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(role === 'Worker' || role === 'Zone Admin') && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="signup-zone">Assigned Zone</Label>
                        <Select value={zone} onValueChange={setZone}>
                          <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select Zone" />
                          </SelectTrigger>
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
                    <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-white rounded-2xl">Create Account</Button>
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