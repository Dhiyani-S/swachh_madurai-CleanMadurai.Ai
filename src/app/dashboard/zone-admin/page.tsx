
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  ClipboardList, 
  Map as MapIcon, 
  Plus, 
  AlertTriangle, 
  UserPlus, 
  BarChart3, 
  Zap, 
  LayoutGrid, 
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Timer
} from "lucide-react"
import { useStore, User, Team, Task } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function ZoneAdminDashboard() {
  const { tasks, users, teams, currentUser, addUser, updateTask, updateSensors, sensors } = useStore()
  const { toast } = useToast()
  const currentZone = currentUser?.zone || 'ZA'
  
  const [isWorkerModalOpen, setIsWorkerModalOpen] = React.useState(false)
  const [newWorker, setNewWorker] = React.useState({ name: '', age: '', phone: '', address: '', teamId: 'T1' })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null;

  const handleCreateWorker = () => {
    const nextId = `WRK-${currentZone}-${(users.filter(u => u.role === 'worker').length + 1).toString().padStart(3, '0')}`;
    addUser({
      id: nextId,
      name: newWorker.name,
      password: 'work@1234',
      role: 'worker',
      zone: currentZone,
      teamId: newWorker.teamId,
      phone: newWorker.phone,
      age: parseInt(newWorker.age),
      address: newWorker.address,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    });
    toast({ title: "Worker Account Created", description: `Credentials: ${nextId} / work@1234` });
    setIsWorkerModalOpen(false);
  }

  const zoneTasks = tasks.filter(t => t.zone === currentZone)
  const zoneTeams = teams.filter(t => t.zone === currentZone)

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Zone Control</h1>
          <p className="text-white/40 font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4" /> Zone {currentZone} - Active Management
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isWorkerModalOpen} onOpenChange={setIsWorkerModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-black font-bold h-12 rounded-2xl shadow-2xl shadow-primary/20">
                <UserPlus className="h-5 w-5" /> Register New Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 text-white rounded-[3rem] backdrop-blur-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-headline text-3xl">Create Worker Account</DialogTitle>
                <DialogDescription className="text-white/60">Worker login IDs are auto-generated based on zone code.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</Label>
                  <Input value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Age</Label>
                    <Input type="number" value={newWorker.age} onChange={e => setNewWorker({...newWorker, age: e.target.value})} className="rounded-xl h-12" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Team</Label>
                    <select className="bg-zinc-900 border border-white/10 rounded-xl h-12 px-4" value={newWorker.teamId} onChange={e => setNewWorker({...newWorker, teamId: e.target.value})}>
                      {zoneTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Phone</Label>
                  <Input value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} className="rounded-xl h-12" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateWorker} className="w-full bg-primary h-14 rounded-2xl font-bold">Create Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-full grid grid-cols-3">
          <TabsTrigger value="kanban" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">
            <LayoutGrid className="h-4 w-4 mr-2" /> Kanban Board
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">
            <Users className="h-4 w-4 mr-2" /> Team Management
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">
            <BarChart3 className="h-4 w-4 mr-2" /> Live Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: '📡 Sensor Alerts', status: 'pending' as const, color: 'text-rose-500' },
              { label: '📋 Assigned', status: 'assigned' as const, color: 'text-amber-500' },
              { label: '🔄 In Progress', status: 'in_progress' as const, color: 'text-primary' },
              { label: '✅ Completed', status: 'completed' as const, color: 'text-emerald-500' }
            ].map((col) => (
              <div key={col.status} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", col.color)}>{col.label}</h3>
                   <Badge className="bg-white/5 text-white/40 border-none">{zoneTasks.filter(t => t.status === col.status).length}</Badge>
                </div>
                <div className="space-y-4">
                  {zoneTasks.filter(t => t.status === col.status).map((task) => (
                    <Card key={task.id} className="rounded-[2.5rem] border-none shadow-xl glass-panel group hover:translate-y-[-4px] transition-all">
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-sm font-bold text-white line-clamp-1">{task.work}</CardTitle>
                        <CardDescription className="text-[10px] font-medium flex items-center gap-1">
                          <MapIcon className="h-3 w-3" /> {task.place}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 py-4 space-y-3">
                         <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-white/40">
                           <span>{task.source}</span>
                           <span>{task.id}</span>
                         </div>
                         {task.status === 'pending' && (
                           <select className="w-full text-[10px] bg-black/40 border border-white/10 rounded-lg p-2 font-bold" onChange={(e) => updateTask(task.id, { assignedTo: e.target.value, status: 'assigned' })}>
                             <option value="">Assign Team...</option>
                             {users.filter(u => u.role === 'worker' && u.zone === currentZone).map(w => (
                               <option key={w.id} value={w.id}>{w.name} ({w.teamId})</option>
                             ))}
                           </select>
                         )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {zoneTeams.map((team) => (
              <Card key={team.id} className="rounded-[3rem] border-none shadow-2xl glass-panel">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold">{team.name}</CardTitle>
                  <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary">Team {team.id}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                   <div className="space-y-3">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Member List</p>
                     {team.members.map((m, i) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold">{m.name}</span>
                            <span className="text-[8px] text-white/40">{m.workerId}</span>
                         </div>
                         <ArrowRight className="h-3 w-3 text-white/20" />
                       </div>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <Button className="flex-1 rounded-xl h-10 text-[10px] font-bold" variant="outline">Edit Team</Button>
                     <Button className="flex-1 rounded-xl h-10 text-[10px] font-bold bg-primary text-black">View Reports</Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
