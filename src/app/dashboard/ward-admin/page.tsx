
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MapPin, 
  AlertTriangle, 
  Users,
  ClipboardCheck,
  UserPlus,
  ShieldCheck,
  Building,
  Zap,
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function WardAdminDashboard() {
  const { tasks, users, addUser, currentUser } = useStore()
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  
  // Form States
  const [newZoneAdmin, setNewZoneAdmin] = React.useState({ id: '', password: '', name: '', zone: '' })

  React.useEffect(() => { setMounted(true) }, [])

  const handleCreateZoneAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newZoneAdmin.id || !newZoneAdmin.password || !newZoneAdmin.name || !newZoneAdmin.zone) {
      toast({ variant: 'destructive', title: "Error", description: "Please fill all Zone Admin fields." })
      return
    }
    if (users.find(u => u.id === newZoneAdmin.id)) {
      toast({ variant: 'destructive', title: "Error", description: "User ID already exists." })
      return
    }
    addUser({
      id: newZoneAdmin.id,
      name: newZoneAdmin.name,
      password: newZoneAdmin.password,
      role: 'zone_admin',
      zone: newZoneAdmin.zone,
      wardId: currentUser?.wardId,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    })
    toast({ title: "Zone Admin Created", description: `Account for Zone ${newZoneAdmin.zone} is ready.` })
    setNewZoneAdmin({ id: '', password: '', name: '', zone: '' })
  }

  // Calculate Zone Performance within this Ward
  const getZonePerformance = () => {
    const zones = ['ZA', 'ZB', 'ZC', 'ZD', 'ZE'];
    const zoneNames: Record<string, string> = {
      'ZA': 'North Zone',
      'ZB': 'South Zone',
      'ZC': 'East Zone',
      'ZD': 'West Zone',
      'ZE': 'Central Zone'
    };

    return zones.map(zoneId => {
      const zoneTasks = tasks.filter(t => t.zone === zoneId);
      const total = zoneTasks.length || 1; // Avoid division by zero
      const completed = zoneTasks.filter(t => t.status === 'completed').length;
      const rate = (completed / total) * 100;

      let status: 'Green' | 'Yellow' | 'Red' = 'Red';
      if (rate >= 80) status = 'Green';
      else if (rate >= 40) status = 'Yellow';

      return {
        id: zoneId,
        name: zoneNames[zoneId],
        total: zoneTasks.length,
        completed,
        rate,
        status
      };
    });
  }

  const zonePerformance = React.useMemo(() => getZonePerformance(), [tasks]);

  if (!mounted) return null

  const zoneAdmins = users.filter(u => u.role === 'zone_admin' && u.createdByAdmin === currentUser?.id)
  const wardTasks = tasks.filter(t => t.zone.startsWith('Z')); // Simplified for prototype
  const wardCompleted = wardTasks.filter(t => t.status === 'completed').length;
  const wardTotal = wardTasks.length || 1;
  const wardEfficiency = Math.round((wardCompleted / wardTotal) * 100);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">Ward Command</h1>
          <p className="text-white/40 flex items-center gap-2 font-medium italic">
            <Building className="h-4 w-4 text-primary" /> {currentUser?.wardId || 'Active Ward'} - Administrative Jurisdiction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <ClipboardCheck className="h-3 w-3 text-primary" /> Ward Efficiency
            </CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-white">{wardEfficiency}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={wardEfficiency} className="h-1.5 bg-white/5" />
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <Users className="h-3 w-3 text-amber-500" /> Zone Admins
            </CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-white">{zoneAdmins.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Deployments</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <Activity className="h-3 w-3 text-rose-500" /> Active Alarms
            </CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-rose-500">
              {tasks.filter(t => t.status === 'pending' && t.priority === 'HIGH').length.toString().padStart(2, '0')}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full space-y-8">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-fit">
          <TabsTrigger value="performance" className="rounded-3xl font-bold px-8 h-12 data-[state=active]:bg-primary">Zone Performance</TabsTrigger>
          <TabsTrigger value="admin" className="rounded-3xl font-bold px-8 h-12 data-[state=active]:bg-primary">Zone Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Zone Intelligence Hub</h2>
              <p className="text-white/40 text-sm">Monitoring operational status across all zones in {currentUser?.wardId}.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-white/60 uppercase">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-[9px] font-bold text-white/60 uppercase">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-[9px] font-bold text-white/60 uppercase">Low</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {zonePerformance.map((zone) => (
              <Card key={zone.id} className="rounded-[2.5rem] glass-panel border-none shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                <div className={cn(
                  "absolute top-0 left-0 w-2 h-full",
                  zone.status === 'Green' ? 'bg-emerald-500' : zone.status === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'
                )} />
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Zone ID: {zone.id}</span>
                      <CardTitle className="text-xl font-headline font-bold text-white">{zone.name}</CardTitle>
                    </div>
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      zone.status === 'Green' ? 'bg-emerald-500 animate-pulse' : zone.status === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'
                    )} />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-4 space-y-4">
                  <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    <span>Efficiency</span>
                    <span className={cn(
                      zone.status === 'Green' ? 'text-emerald-500' : zone.status === 'Yellow' ? 'text-amber-500' : 'text-rose-500'
                    )}>{Math.round(zone.rate)}%</span>
                  </div>
                  <Progress value={zone.rate} className="h-2 bg-white/5" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Completed</span>
                      <span className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> {zone.completed}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Pending</span>
                      <span className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/20" /> {zone.total - zone.completed}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Register Zone Admin</CardTitle>
                <CardDescription className="text-white/40">Assign an administrator to manage a specific city zone within your ward.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateZoneAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Zone Admin ID / Login ID</Label>
                    <Input value={newZoneAdmin.id} onChange={e => setNewZoneAdmin({...newZoneAdmin, id: e.target.value})} className="h-12 rounded-xl" placeholder="ZONE-A-ADMIN" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</Label>
                      <Input value={newZoneAdmin.name} onChange={e => setNewZoneAdmin({...newZoneAdmin, name: e.target.value})} className="h-12 rounded-xl" placeholder="Admin Name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Initial Password</Label>
                      <Input type="password" value={newZoneAdmin.password} onChange={e => setNewZoneAdmin({...newZoneAdmin, password: e.target.value})} className="h-12 rounded-xl" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Assigned Zone</Label>
                    <Select value={newZoneAdmin.zone} onValueChange={val => setNewZoneAdmin({...newZoneAdmin, zone: val})}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-xl backdrop-blur-3xl">
                        <SelectItem value="ZA">Zone A (North)</SelectItem>
                        <SelectItem value="ZB">Zone B (South)</SelectItem>
                        <SelectItem value="ZC">Zone C (East)</SelectItem>
                        <SelectItem value="ZD">Zone D (West)</SelectItem>
                        <SelectItem value="ZE">Zone E (Central)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20 bg-primary text-black uppercase">
                    <UserPlus className="h-5 w-5 mr-2" /> Register Zone Admin
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Active Zone Admins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {zoneAdmins.length === 0 ? (
                  <p className="text-center py-20 text-white/20 italic">No zone admins registered.</p>
                ) : (
                  zoneAdmins.map((admin) => (
                    <div key={admin.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                      <div>
                        <p className="font-bold text-white text-lg">{admin.name}</p>
                        <div className="flex gap-2 items-center">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase tracking-widest font-bold">Zone {admin.zone}</Badge>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ID: {admin.id}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-bold tracking-widest">Operational</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
