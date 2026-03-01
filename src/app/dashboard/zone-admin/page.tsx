
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { 
  Users, 
  ClipboardList, 
  Map as MapIcon, 
  Plus,
  CheckCircle,
  AlertCircle,
  Send,
  UserPlus,
  UserCheck,
  ChevronDown,
  Clock,
  Trash2
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ZoneAdminDashboard() {
  const { tasks, updateTask, addTask, attendance, currentUser } = useStore()
  const { toast } = useToast()

  const currentZone = currentUser?.zoneId || 'Zone 4 (Vaikunth Nagar)'
  
  // Filter tasks for this zone
  const zoneTasks = tasks.filter(t => t.zoneId === currentZone)
  const unassignedTasks = zoneTasks.filter(t => !t.assignedTo)
  const activeTasksCount = zoneTasks.filter(t => t.status !== 'Completed').length
  const pendingTasksCount = zoneTasks.filter(t => t.status === 'Pending').length
  const progressTasksCount = zoneTasks.filter(t => t.status === 'In Progress' || t.status === 'Partially Completed').length

  const handleAssignTask = (taskId: string) => {
    // Assign to Team 04 as default for this prototype
    updateTask(taskId, { assignedTo: 'Team 04', status: 'Pending' })
    toast({
      title: "Task Assigned",
      description: `Task has been pushed to Worker Team Team 04 in ${currentZone}.`,
    })
  }

  const handleQuickDispatch = (location: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: 'Emergency Cleanup Dispatch',
      location: location,
      status: 'Pending',
      type: 'Citizen Public' as const,
      assignedTo: 'Team 04',
      wardId: 'ward-1',
      zoneId: currentZone,
      createdAt: new Date().toISOString(),
    }
    addTask(newTask)
    toast({
      title: "Quick Dispatch Active",
      description: `Emergency team sent to ${location}.`,
    })
  }

  const handleApproveReceipt = (id: string) => {
    toast({
      title: "Receipt Approved",
      description: `Payment link generated and sent to citizen for Request #${id}.`,
    })
  }

  const today = new Date().toLocaleDateString()

  const teams = [
    { id: 'Team 04', leader: 'Karthik', status: 'Green', members: 4, load: 30 },
    { id: 'T08', leader: 'Meena', status: 'Yellow', members: 3, load: 75 },
    { id: 'T12', leader: 'Ravi', status: 'Red', members: 5, load: 95 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Zone Control</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapIcon className="h-3 w-3" /> {currentZone}
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 bg-white">
            <ClipboardList className="h-4 w-4" /> Zone Logs
          </Button>
          <Button className="gap-2 bg-primary font-bold shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" /> Add New Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Worker Teams</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">14 Teams</div>
            <p className="text-xs text-muted-foreground mt-1">42 active workers in zone</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Active Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{activeTasksCount} Tasks</div>
            <div className="flex gap-2 mt-2">
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">{pendingTasksCount} Pending</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">{progressTasksCount} In Progress</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Citizen Happiness</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">4.9/5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Based on last 50 feedbacks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Task Assignment Queue</CardTitle>
              <CardDescription>Incoming requests from sensors and citizens</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Live Feed</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {unassignedTasks.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                   <CheckCircle className="h-10 w-10 text-emerald-200 mx-auto" />
                   <p className="text-muted-foreground text-sm font-medium">Assignment queue is currently empty</p>
                </div>
              ) : (
                unassignedTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-secondary/20 transition-all flex items-center justify-between animate-in fade-in slide-in-from-left-4">
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        task.type === 'Sensor' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-primary/5 text-primary border border-primary/10"
                      )}>
                        {task.type === 'Sensor' ? <AlertCircle className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{task.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapIcon className="h-3 w-3" /> {task.location}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] font-bold uppercase text-primary bg-primary/5 px-1.5 py-0.5 rounded">{task.type}</span>
                          <span className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> Just now
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button size="sm" className="font-bold gap-2 px-4" onClick={() => handleAssignTask(task.id)}>
                        Assign <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/20 p-4 justify-center">
            <Button variant="ghost" className="text-primary font-bold text-sm">View full task board</Button>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Worker Team Health</CardTitle>
            <CardDescription>Daily attendance tracking ({today})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teams.map((team) => {
              const teamAttendance = attendance[team.id];
              const isToday = teamAttendance?.date === today;
              const presentCount = isToday ? teamAttendance.members.filter(m => m.status === 'Present').length : 0;
              const totalCount = isToday ? teamAttendance.members.length : team.members;

              return (
                <div key={team.id} className="p-4 rounded-xl border bg-card hover:border-primary transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold">
                        {team.id.replace('Team ', 'T')}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Team {team.leader}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-muted-foreground">{team.members} members</p>
                          {isToday ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <UserCheck className="h-2 w-2" /> {presentCount}/{totalCount} Present
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                              <AlertCircle className="h-2 w-2" /> Attendance Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={team.status as any} />
                  </div>

                  {isToday && (
                    <Collapsible className="mt-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full h-6 text-[9px] font-bold py-0 flex justify-between px-1 bg-secondary/30">
                          View Detailed Attendance <ChevronDown className="h-3 w-3" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-1 bg-secondary/5 rounded p-1">
                        {teamAttendance.members.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[10px] px-1">
                            <span className="text-muted-foreground font-medium">{member.name}</span>
                            <span className={cn(
                              "font-bold uppercase",
                              member.status === 'Present' ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {member.status}
                            </span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-muted-foreground">Current Workload</span>
                      <span className="font-bold">{team.load}%</span>
                    </div>
                    <Progress value={team.load} className={cn(
                      "h-1.5",
                      team.status === 'Red' ? "bg-rose-100" : team.status === 'Yellow' ? "bg-amber-100" : "bg-emerald-100"
                    )} />
                  </div>
                </div>
              )
            })}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full font-bold">Manage All Teams</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md bg-accent text-accent-foreground">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Send className="h-5 w-5" /> Private Service Receipts
            </CardTitle>
            <CardDescription className="text-accent-foreground/70">Approve citizen requests and generate payment links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[1, 2].map(i => (
               <div key={i} className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/5">
                 <div>
                   <p className="font-bold text-sm">Request #P440{i}</p>
                   <p className="text-xs opacity-70">Anna Nagar East - Waste Collection</p>
                 </div>
                 <Button 
                    variant="secondary" 
                    size="sm" 
                    className="font-bold text-xs h-8 px-4"
                    onClick={() => handleApproveReceipt(`P440${i}`)}
                  >
                    Verify & Invoice
                  </Button>
               </div>
             ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" /> Urgent Citizen Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-rose-700">Overflowing Dustbin @ Kalavasal</p>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase">Critical</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Reported by Citizen #9182 with photo proof from Anna Nagar West.</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-rose-600 text-white hover:bg-rose-700 font-bold text-[10px] h-8 px-4 flex-1"
                      onClick={() => handleQuickDispatch('Kalavasal Junction')}
                    >
                      Quick Dispatch
                    </Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-8 px-4 font-bold flex-1 bg-white">View Proof</Button>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
