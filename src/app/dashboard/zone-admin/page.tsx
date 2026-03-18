
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Map as MapIcon, 
  LayoutGrid, 
  ArrowRight
} from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function ZoneAdminDashboard() {
  const { tasks, users, teams, currentUser, updateTask } = useStore()
  const currentZone = currentUser?.zone || 'ZA'
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null;

  const zoneTasks = tasks.filter(t => t.zone === currentZone)
  const zoneTeams = teams.filter(t => t.zone === currentZone)
  const zoneWorkers = users.filter(u => u.role === 'worker' && u.zone === currentZone)

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Zone Operations</h1>
          <p className="text-white/40 font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4" /> Zone {currentZone} - Active Deployment
          </p>
        </div>
      </header>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10 w-full grid grid-cols-3">
          <TabsTrigger value="kanban" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Task Board</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Team Roster</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-3xl font-bold h-full data-[state=active]:bg-primary">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: '📡 Critical Alerts', status: 'pending' as const, color: 'text-rose-500' },
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
                        <CardTitle className="text-sm font-bold text-white line-clamp-1">{task.work || task.name}</CardTitle>
                        <CardDescription className="text-[10px] font-medium flex items-center gap-1">
                          <MapIcon className="h-3 w-3" /> {task.place || task.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 py-4 space-y-3">
                         {task.status === 'pending' && (
                           <select className="w-full text-[10px] bg-black/40 border border-white/10 rounded-lg p-2 font-bold" onChange={(e) => updateTask(task.id, { assignedTo: e.target.value, status: 'assigned' })}>
                             <option value="">Assign Worker...</option>
                             {zoneWorkers.map(w => (
                               <option key={w.id} value={w.id}>{w.name} (Team {w.teamId})</option>
                             ))}
                           </select>
                         )}
                         {task.status === 'assigned' && (
                            <p className="text-[10px] text-white/60">Assigned to: {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}</p>
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
                  <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary">Unit {team.id}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                   <div className="space-y-3">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Member Units</p>
                     {zoneWorkers.filter(w => w.teamId === team.id).map((m, i) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold">{m.name}</span>
                            <span className="text-[8px] text-white/40">{m.id}</span>
                         </div>
                         <ArrowRight className="h-3 w-3 text-white/20" />
                       </div>
                     ))}
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
