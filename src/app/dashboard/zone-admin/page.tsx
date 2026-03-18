
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Map as MapIcon, 
  LayoutGrid, 
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Users,
  Zap,
  Clock,
  UserCheck,
  AlertTriangle,
  Activity,
  Droplets,
  Trash2,
  Syringe,
  MessageSquare
} from "lucide-react"
import { useStore, Task } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getPredictedStatus } from "@/lib/ai-sensor-engine"

export default function ZoneAdminDashboard() {
  const { tasks, users, teams, currentUser, updateTask, addNotification, sensors } = useStore()
  const currentZone = currentUser?.zone || 'ZA'
  const [mounted, setMounted] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null;

  const zoneTasks = tasks.filter(t => t.zone === currentZone)
  const zoneWorkers = users.filter(u => u.role === 'worker' && u.zone === currentZone)
  const zoneSensors = sensors[currentZone] || {}

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
      title: "Task Dispatched",
      message: `Task ${taskId.slice(-6)} assigned to Team ${worker.teamId}. Worker must accept within 30 mins.`,
      type: 'success'
    });

    toast({
      title: "Task Assigned",
      description: `Dispatched to Team ${worker.teamId} successfully.`,
    });
  }

  const getRecommendedWorkers = () => {
    return zoneWorkers
      .map(worker => {
        const activeTasks = tasks.filter(t => t.assignedTo === worker.id && t.status !== 'completed').length;
        return { ...worker, activeTaskCount: activeTasks };
      })
      .sort((a, b) => a.activeTaskCount - b.activeTaskCount);
  }

  const recommendedWorkers = getRecommendedWorkers();

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">Zone Operations</h1>
          <p className="text-white/40 font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary" /> Zone {currentZone} - Intelligence Hub
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Dustbin Fill', val: zoneSensors.dustbin + '%', icon: Trash2, color: zoneSensors.dustbin > 80 ? 'text-rose-500' : 'text-primary' },
          { label: 'Napkin Stocks', val: zoneSensors.toilet_napkins + '%', icon: Syringe, color: zoneSensors.toilet_napkins < 20 ? 'text-rose-500' : 'text-emerald-500' },
          { label: 'Drainage Status', val: zoneSensors.drainage === 'ok' ? 'Normal' : 'LEAKAGE', icon: Droplets, color: zoneSensors.drainage === 'ok' ? 'text-emerald-500' : 'text-rose-500' },
          { label: 'Citizen Feedbacks', val: zoneTasks.filter(t => t.source.startsWith('citizen')).length, icon: MessageSquare, color: 'text-amber-500' }
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-none shadow-xl rounded-[2.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <stat.icon className={cn("h-3 w-3", stat.color)} /> {stat.label}
              </CardDescription>
              <CardTitle className={cn("text-2xl font-headline font-bold", stat.color)}>{stat.val}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-full grid grid-cols-3">
          <TabsTrigger value="kanban" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Task Registry</TabsTrigger>
          <TabsTrigger value="intelligence" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">AI Sensor Lab</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Team Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: '📡 UNASSIGNED', status: 'pending' as const, color: 'text-rose-500', icon: Zap },
              { label: '📋 PROCESSING', status: 'in_progress' as const, color: 'text-amber-500', icon: Clock },
              { label: '🗑️ DISPOSAL', status: 'partially_completed' as const, color: 'text-primary', icon: AlertTriangle },
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
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="border-white/10 text-[8px] uppercase tracking-widest text-primary mb-2">
                            {task.source.replace('_', ' ')}
                          </Badge>
                          {task.imageProof && <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />}
                        </div>
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
                               <span className="text-[8px] font-bold uppercase text-primary tracking-widest">Recommended Units</span>
                             </div>
                             <select 
                               className="w-full text-[10px] bg-black/40 border border-white/10 rounded-xl p-3 font-bold text-white focus:border-primary outline-none" 
                               onChange={(e) => handleAssignTask(task.id, e.target.value)}
                               defaultValue=""
                             >
                               <option value="" disabled>Select User ID...</option>
                               {recommendedWorkers.map(w => (
                                 <option key={w.id} value={w.id}>
                                   ID: {w.id} - Team {w.teamId} ({w.activeTaskCount} active)
                                 </option>
                               ))}
                             </select>
                           </div>
                         )}
                         
                         {task.status !== 'pending' && (
                            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <UserCheck className="h-3 w-3 text-emerald-500" />
                                   <span className="text-[10px] font-bold text-white/60">
                                     {users.find(u => u.id === task.assignedTo)?.teamId || 'TEAM-X'}
                                   </span>
                                 </div>
                                 <Badge variant="outline" className="border-white/10 text-[8px] uppercase">{task.status.replace('_', ' ')}</Badge>
                               </div>
                               {task.status === 'partially_completed' && (
                                 <p className="text-[8px] text-amber-500 font-bold uppercase animate-pulse">Awaiting QR Verification</p>
                               )}
                            </div>
                         )}
                         
                         <div className="flex justify-between items-center text-[8px] font-bold uppercase text-white/20 tracking-widest">
                            <span>ID: {task.id.slice(-6)}</span>
                            <span>{new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
               <CardHeader>
                 <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                   <Activity className="h-6 w-6 text-primary" /> Real-time Predictive Analytics
                 </CardTitle>
                 <CardDescription>ML-driven forecasting based on current usage patterns in Zone {currentZone}.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-8">
                 {[
                   { type: 'dustbin' as const, label: 'Main Terminal Dustbin', icon: Trash2 },
                   { type: 'toilet_napkins' as const, label: 'Ladies Restroom Napkin Dispenser', icon: Syringe },
                   { type: 'toilet_tissue' as const, label: 'Public Restroom Tissue Stock', icon: Activity },
                 ].map((sensor) => {
                   const level = zoneSensors[sensor.type];
                   const pred = getPredictedStatus(level, sensor.type);
                   return (
                     <div key={sensor.type} className="space-y-4 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                       <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                           <sensor.icon className="h-5 w-5 text-primary" />
                           <span className="font-bold text-sm">{sensor.label}</span>
                         </div>
                         <Badge className={cn(
                           "px-4 h-8 font-bold",
                           level > 80 || level < 20 ? "bg-rose-500 text-white" : "bg-emerald-500 text-black"
                         )}>{level}%</Badge>
                       </div>
                       <Progress value={sensor.type === 'dustbin' ? level : level} className="h-2" />
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-white/40">Predicted Action: <span className="text-primary">{pred.minutesLeft} mins</span></span>
                         <span className="text-white/40">Confidence: <span className="text-emerald-500">{Math.round(pred.confidence * 100)}%</span></span>
                       </div>
                     </div>
                   );
                 })}
               </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
               <CardHeader>
                 <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                   <AlertTriangle className="h-6 w-6 text-rose-500" /> Critical Anomalies
                 </CardTitle>
                 <CardDescription>Hardware alerts and environmental risks detected by AI.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className={cn(
                   "p-6 rounded-[2rem] border-2 transition-all",
                   zoneSensors.drainage === 'ok' ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/10 border-rose-500/40 animate-pulse"
                 )}>
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-lg flex items-center gap-2">
                       <Droplets className={cn("h-5 w-5", zoneSensors.drainage === 'ok' ? "text-emerald-500" : "text-rose-500")} />
                       Underground Drainage
                     </h4>
                     <Badge className={zoneSensors.drainage === 'ok' ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500 text-white"}>
                       {zoneSensors.drainage === 'ok' ? 'SECURE' : 'LEAKAGE DETECTED'}
                     </Badge>
                   </div>
                   <p className="text-sm text-white/60 mb-4">
                     {zoneSensors.drainage === 'ok' 
                       ? "Acoustic sensors report no blockage. Pressure levels optimal." 
                       : "Sensors at Junction WD04 report significant pressure drop. High risk of overflow."}
                   </p>
                   {zoneSensors.drainage !== 'ok' && (
                     <Button className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold">
                       Dispatch Emergency Plumbers
                     </Button>
                   )}
                 </div>
               </CardContent>
            </Card>
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
                      <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary mt-1">Login ID: {worker.id} • Team {worker.teamId}</CardDescription>
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
