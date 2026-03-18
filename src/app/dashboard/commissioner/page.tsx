"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  TrendingUp, 
  Zap,
  Activity,
  Award,
  ShieldCheck,
  UserPlus,
  Users,
  MapPin
} from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CommissionerDashboard() {
  const { tasks, sensors, isDemoRunning, setDemoState, addNotification, users, addUser, currentUser } = useStore()
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [newWardAdmin, setNewWardAdmin] = React.useState({ id: '', password: '', name: '', wardId: '' })

  React.useEffect(() => { setMounted(true) }, [])

  const handleCreateWardAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWardAdmin.id || !newWardAdmin.password || !newWardAdmin.name || !newWardAdmin.wardId) {
      toast({ variant: 'destructive', title: "Error", description: "All fields are required, including Ward Number." })
      return
    }
    if (users.find(u => u.id === newWardAdmin.id)) {
      toast({ variant: 'destructive', title: "Error", description: "User ID already exists." })
      return
    }
    addUser({
      id: newWardAdmin.id,
      name: newWardAdmin.name,
      password: newWardAdmin.password,
      role: 'ward_admin',
      wardId: newWardAdmin.wardId,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    })
    toast({ title: "Ward Admin Created", description: `Account for Ward ${newWardAdmin.wardId} has been registered.` })
    setNewWardAdmin({ id: '', password: '', name: '', wardId: '' })
  }

  const handleStartDemo = () => {
    setDemoState(true, 1)
    addNotification({ title: 'DEMO STARTED', message: '60-second city automation sequence initiated.', type: 'info' })
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDemoState(true, current);
      if (current >= 7) {
        clearInterval(interval);
        setTimeout(() => setDemoState(false, 0), 2000);
      }
    }, 5000);
  }

  if (!mounted) return null

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length || 1
  const efficiency = Math.round((completedCount / totalCount) * 100)
  const wardAdmins = users.filter(u => u.role === 'ward_admin')

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Commissioner Intelligence</h1>
          <p className="text-white/40 font-medium italic">Supreme Administrative Authority — Madurai Corporation</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className={cn(
              "gap-2 font-bold h-12 px-6 rounded-2xl shadow-2xl transition-all",
              isDemoRunning ? "bg-rose-500 animate-pulse" : "bg-primary hover:bg-primary/90 shadow-primary/30"
            )}
            onClick={handleStartDemo}
            disabled={isDemoRunning}
          >
            {isDemoRunning ? <Activity className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {isDemoRunning ? "Demo Running..." : "Start System Demo"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', val: tasks.length, icon: TrendingUp, color: 'text-primary' },
          { label: 'Efficiency', val: efficiency + '%', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Ward Admins', val: wardAdmins.length, icon: Users, color: 'text-amber-500' },
          { label: 'Active Wards', val: '100', icon: MapPin, color: 'text-primary' }
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <stat.icon className={cn("h-3 w-3", stat.color)} /> {stat.label}
              </CardDescription>
              <CardTitle className="text-4xl font-headline font-bold text-white">{stat.val}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="admin" className="w-full space-y-8">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-fit">
          <TabsTrigger value="admin" className="rounded-3xl font-bold px-8 h-full data-[state=active]:bg-primary">Administration</TabsTrigger>
          <TabsTrigger value="lab" className="rounded-3xl font-bold px-8 h-full data-[state=active]:bg-primary">Intelligence Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-white">Register Ward Admin</CardTitle>
                <CardDescription>Assign an administrator to oversee specific city wards.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWardAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="ml-2 text-[10px] font-bold uppercase text-white/40 tracking-widest">Ward Number</Label>
                      <Input value={newWardAdmin.wardId} onChange={e => setNewWardAdmin({...newWardAdmin, wardId: e.target.value})} className="h-12 rounded-xl" placeholder="Ward 14" />
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-2 text-[10px] font-bold uppercase text-white/40 tracking-widest">Admin Name</Label>
                      <Input value={newWardAdmin.name} onChange={e => setNewWardAdmin({...newWardAdmin, name: e.target.value})} className="h-12 rounded-xl" placeholder="Full Name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase text-white/40 tracking-widest">User ID (Login ID)</Label>
                    <Input value={newWardAdmin.id} onChange={e => setNewWardAdmin({...newWardAdmin, id: e.target.value})} className="h-12 rounded-xl" placeholder="WARD-ADMIN-01" />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase text-white/40 tracking-widest">Initial Password</Label>
                    <Input type="password" value={newWardAdmin.password} onChange={e => setNewWardAdmin({...newWardAdmin, password: e.target.value})} className="h-12 rounded-xl" placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20 bg-primary text-black">
                    <UserPlus className="h-5 w-5 mr-2" /> Register Ward Admin
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-white">Active Ward Roster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {wardAdmins.length === 0 ? (
                  <p className="text-center py-20 text-white/20 italic">No ward admins registered yet.</p>
                ) : (
                  wardAdmins.map((admin) => (
                    <div key={admin.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                      <div>
                        <p className="font-bold text-white text-lg">{admin.name}</p>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px] font-bold tracking-widest">{admin.wardId}</Badge>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ID: {admin.id}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/20 text-emerald-500">Active</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lab">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-white">Live Sensor Intelligence</CardTitle>
                <CardDescription>Real-time predictive analysis for Madurai city zones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(sensors).map(([zone, data]: [string, any]) => (
                  <div key={zone} className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-4 w-4 rounded-full",
                          data.dustbin > 90 ? "bg-rose-500 animate-pulse" : data.dustbin > 75 ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                        <h4 className="font-bold text-lg">Zone {zone} Intelligence</h4>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary">{data.dustbin}% Fill Rate</Badge>
                    </div>
                    <Progress value={data.dustbin} className="h-2 bg-white/5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-panel border-none shadow-2xl rounded-[3rem] h-fit">
              <CardHeader className="bg-primary text-black">
                <CardTitle className="font-headline text-xl">AI System Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-sm font-medium leading-relaxed italic text-white/80">
                  "City performance is up by 14%. Recommendation: Increase morning sweep teams in North Zone (Thirunagar) to maintain efficiency."
                </p>
                <div className="pt-4 border-t border-white/10">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">System Status</p>
                   <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-xs font-bold text-white/60">Cloud Synced & Live</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
