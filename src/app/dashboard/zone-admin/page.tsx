
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Users, ClipboardList, Map as MapIcon, Plus, AlertTriangle, UserPlus, BarChart3, Edit2, UserCircle, Zap, UserCheck, ImageIcon, Eye } from "lucide-react"
import { useStore, Task, User, TeamMember, SensorSubType } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ZoneAdminDashboard() {
  const { tasks, updateTask, users, addTask, addUser, updateUser, currentUser, attendance } = useStore()
  const { toast } = useToast()
  const currentZone = currentUser?.zoneId || 'ZA - Zone A (North)'
  
  const zoneTasks = React.useMemo(() => tasks.filter(t => t.zoneId === currentZone), [tasks, currentZone])
  const zoneTeams = React.useMemo(() => users.filter(u => u.role === 'Worker' && u.zoneId === currentZone), [users, currentZone])

  const [mounted, setMounted] = React.useState(false)
  const [viewImage, setViewImage] = React.useState<string | null>(null)

  React.useEffect(() => { setMounted(true) }, [])

  const handleAssignTask = (taskId: string, workerId: string) => {
    if (!workerId) return
    updateTask(taskId, { assignedTo: workerId, status: 'Pending' })
    toast({ title: "Dispatched", description: `Task assigned to Team ${workerId}.` })
  }

  const handleSimulateSensor = (type: SensorSubType) => {
    addTask({
      id: `sensor-${Date.now()}`,
      name: `Sensor Alert: ${type}`,
      location: 'Ward Main Junction',
      status: 'Pending',
      type: 'Sensor',
      subType: type,
      wardId: 'WA-AUTO',
      zoneId: currentZone,
      createdAt: new Date().toISOString()
    })
    toast({ title: "Alert Logged", description: `${type} sensor triggered alert.` })
  }

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Zone Control Panel</h1>
          <p className="text-muted-foreground flex items-center gap-1"><MapIcon className="h-3 w-3" /> {currentZone}</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="gap-2 border-primary text-primary"><Zap className="h-4 w-4" /> Simulate Sensors</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Trigger Virtual Sensors (ML Alerts)</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-2 pt-4">
                <Button variant="secondary" onClick={() => handleSimulateSensor('Dustbin')}>Dustbin (work-disprose waste)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Drainage')}>Drainage (trainage leakage)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Water')}>Water (water leakage)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Toilet')}>Toilet (toilet waste disposal)</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-14 p-1 rounded-xl">
          <TabsTrigger value="assignments" className="font-bold gap-2 text-md"><ClipboardList className="h-4 w-4" /> Live Task Board</TabsTrigger>
          <TabsTrigger value="performance" className="font-bold gap-2 text-md"><BarChart3 className="h-4 w-4" /> Team Performance</TabsTrigger>
          <TabsTrigger value="teams" className="font-bold gap-2 text-md"><Users className="h-4 w-4" /> Team Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-rose-50/50 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-700"><AlertTriangle className="h-5 w-5 animate-pulse" /> Live Sensor Alerts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type === 'Sensor' && !t.assignedTo).map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-primary">{task.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{task.location}</p>
                      </div>
                      <select className="text-xs p-2 border rounded-lg" onChange={(e) => handleAssignTask(task.id, e.target.value)}>
                        <option value="">Assign Team...</option>
                        {zoneTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader className="bg-primary/5 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2 text-primary"><UserCircle className="h-5 w-5" /> Citizen Service Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type.startsWith('Citizen') && !t.assignedTo).map((task) => (
                    <div key={task.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{task.name}</h4>
                          <p className="text-[11px] text-muted-foreground">{task.location}</p>
                          {task.imageProof && <Button variant="ghost" size="sm" className="mt-2 h-7 text-[10px] gap-1 font-bold text-primary" onClick={() => setViewImage(task.imageProof!)}><Eye className="h-3 w-3" /> View Proof</Button>}
                        </div>
                      </div>
                      <select className="text-xs p-2 border rounded-lg" onChange={(e) => handleAssignTask(task.id, e.target.value)}>
                        <option value="">Select Team for Dispatch...</option>
                        {zoneTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-2xl"><img src={viewImage!} className="w-full h-auto rounded-lg" /></DialogContent>
      </Dialog>
    </div>
  )
}
