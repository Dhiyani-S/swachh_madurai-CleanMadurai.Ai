"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Map as MapIcon, 
  LayoutGrid, 
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Users,
  Zap,
  Clock,
  UserCheck
} from "lucide-react"
import { useStore, Task } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function ZoneAdminDashboard() {
  const { tasks, users, teams, currentUser, updateTask, addNotification } = useStore()
  const currentZone = currentUser?.zone || 'ZA'
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null;

  // Filter tasks specifically for THIS zone
  const zoneTasks = tasks.filter(t => t.zone === currentZone)
  
  // Filter workers specifically in THIS zone
  const zoneWorkers = users.filter(u => u.role === 'worker' && u.zone === currentZone)

  const handleAssignTask = (taskId: string, workerId: string) => {
    const worker = users.find(u => u.id === workerId);
    if (!worker) return;

    updateTask(taskId, { 
      assignedTo: workerId, 
      status: 'assigned',
      teamId: worker.teamId,
      assignedAt: new Date().toISOString()
    });

    addNotification({
      title: "Task Assigned",
      message: `Task ${taskId} has been assigned to Team ${worker.teamId} (${worker.name}).`,
      type: 'success'
    });

    toast({
      title: "Task Assigned",
      description: `Dispatched to Team ${worker.teamId} successfully.`,
    });
  }

  // AI Suggestion Logic: Prefer teams in the same zone with fewer active tasks
  const getRecommendedWorkers = () => {
    return zoneWorkers
      .map(worker => {
        const activeTasks = tasks.filter(t => t.assignedTo === worker.id && t.status !== 'completed').length;
        return { ...worker, activeTaskCount: activeTasks };
      })
      .sort((a, b) => a.activeTaskCount - b.activeTaskCount); // Lowest load first
  }

  const recommendedWorkers = getRecommendedWorkers();

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">Zone Operations</h1>
          <p className="text-white/40 font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary" /> Zone {currentZone} - Command Intelligence
          </p>
        </div>
      </header>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-full grid grid-cols-3">
          <TabsTrigger value="kanban" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Task Registry</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Team Deployment</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Efficiency Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: '📡 UNASSIGNED', status: 'pending' as const, color: 'text-rose-500', icon: Zap },
              { label: '📋 DISPATCHED', status: 'assigned' as const, color: 'text-amber-500', icon: ClipboardList },
              { label: '🔄 IN ACTION', status: 'in_progress' as const, color: 'text-primary', icon: Clock },
              { label: '✅ RESOLVED', status: 'completed' as const, color: 'text-emerald-500', icon: CheckCircle }
            ].map((col) => (
              <div key={col.status} className="space-y-6">
                <div className="flex items-center justify-between px-4 bg-white/5 py-3 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2">
                     <col.icon className={cn("h-4 w-4", col.color)} />
                     <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", col.color)}>{col.label}</h3>
                   </div>
                   <Badge className="bg-white/5 text-white/40 border-none font-bold">{zoneTasks.filter(t => t.status === col.status).length}</Badge>
                </div>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                  {zoneTasks.filter(t => t.status === col.status).map((task) => (
                    <Card key={task.id} className="rounded-[2.5rem] border-none shadow-2xl glass-panel group hover:translate-y-[-4px] transition-all relative overflow-hidden">
                      {task.priority === 'HIGH' && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />}
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-sm font-bold text-white line-clamp-2 uppercase tracking-tight">{task.work}</CardTitle>
                        <CardDescription className="text-[10px] font-medium flex items-center gap-1 text-white/40 mt-1">
                          <MapIcon className="h-3 w-3 text-primary" /> {task.place}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 py-4 space-y-4">
                         {task.status === 'pending' && (
                           <div className="space-y-3">
                             <div className="flex items-center gap-2 mb-1">
                               <Zap className="h-3 w-3 text-primary animate-pulse" />
                               <span className="text-[8px] font-bold uppercase text-primary tracking-widest">Recommended Teams</span>
                             </div>
                             <select 
                               className="w-full text-[10px] bg-black/40 border border-white/10 rounded-xl p-3 font-bold text-white focus:border-primary outline-none" 
                               onChange={(e) => handleAssignTask(task.id, e.target.value)}
                               defaultValue=""
                             >
                               <option value="" disabled>Select Worker ID...</option>
                               {recommendedWorkers.map(w => (
                                 <option key={w.id} value={w.id}>
                                   {w.teamId} - {w.name} ({w.activeTaskCount} active)
                                 </option>
                               ))}
                             </select>
                           </div>
                         )}
                         
                         {task.status !== 'pending' && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                               <div className="flex items-center gap-2">
                                 <UserCheck className="h-3 w-3 text-emerald-500" />
                                 <span className="text-[10px] font-bold text-white/60">
                                   {users.find(u => u.id === task.assignedTo)?.teamId || 'TEAM-X'}
                                 </span>
                               </div>
                               <Badge variant="outline" className="border-white/10 text-[8px] uppercase">{task.status}</Badge>
                            </div>
                         )}
                         
                         <div className="flex justify-between items-center text-[8px] font-bold uppercase text-white/20 tracking-widest">
                            <span>ID: {task.id.slice(-6)}</span>
                            <span>{new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {zoneTasks.filter(t => t.status === col.status).length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                      <ClipboardList className="h-8 w-8 mx-auto text-white/10 mb-2" />
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">No tasks in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedWorkers.map((worker) => (
              <Card key={worker.id} className="rounded-[3rem] border-none shadow-2xl glass-panel relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <CardHeader className="p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-headline font-bold text-white">{worker.name}</CardTitle>
                      <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary mt-1">Unit ID: {worker.id} • Team {worker.teamId}</CardDescription>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">{worker.activeTaskCount} Tasks</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Unit Status</p>
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "h-3 w-3 rounded-full animate-pulse",
                           worker.activeTaskCount > 3 ? "bg-rose-500" : worker.activeTaskCount > 1 ? "bg-amber-500" : "bg-emerald-500"
                         )} />
                         <span className="text-xs font-bold uppercase tracking-tight">
                           {worker.activeTaskCount > 3 ? "High Load" : worker.activeTaskCount > 1 ? "Active" : "Available"}
                         </span>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 hover:bg-primary/10 hover:text-primary font-bold">
                     View Team Activity <ArrowRight className="h-4 w-4 ml-2" />
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
