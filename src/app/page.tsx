
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
import { Recycle, ShieldCheck, MapPin, Users, UserCircle } from "lucide-react"
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
        description: "Invalid credentials or incorrect role. Please check your details or sign up first.",
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
      description: `Signed in as ${existingUser.name}`,
    })
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()

    if (users.find(u => u.id === userId.trim())) {
      toast({
        title: "Registration Failed",
        description: "This User ID is already taken. Please choose another one.",
        variant: "destructive",
      })
      return
    }

    const needsZone = role === 'Worker' || role === 'Zone Admin'
    if (needsZone && !zone) {
      toast({
        title: "Zone Selection Required",
        description: "Please select your assigned zone to complete registration.",
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
      zoneId: needsZone ? zone : undefined,
      teamNumber: role === 'Worker' ? `Team ${userId.trim()}` : undefined,
      teamMembers: role === 'Worker' ? ["Member 1", "Member 2"] : undefined
    }

    addUser(newUser)
    
    toast({
      title: "Registration Successful",
      description: "Account created! You can now sign in with these details.",
    })
    
    setUserId('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Recycle className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">CleanMadurai.AI</h1>
          </div>
          <p className="text-muted-foreground font-medium">Smart Waste Management System for Madurai Corporation</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="signin" className="font-semibold">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="font-semibold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-id">User ID</Label>
                    <Input id="signin-id" placeholder="Enter User ID" required value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-role">Role</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                      <SelectTrigger>
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
                  <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 transition-all">Sign In</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline">Create Account</CardTitle>
                <CardDescription>Join the mission for a cleaner Madurai</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-id">User ID (Login Username)</Label>
                    <Input id="signup-id" placeholder="Create a unique User ID" required value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                      <SelectTrigger>
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
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="signup-zone">Assigned Zone</Label>
                      <Select value={zone} onValueChange={setZone}>
                        <SelectTrigger id="signup-zone">
                          <SelectValue placeholder="Select your Zone" />
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
                  <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground transition-all">Create Profile</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
