
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  BarChart3,
  Edit2,
  Trash2,
  Clock,
  Phone,
  Home,
  UserCircle,
  Zap,
  Eye,
  Settings2,
  Fingerprint,
  TrendingUp,
  XCircle,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { useStore, Task, User, TeamMember, SensorSubType } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

export default function ZoneAdminDashboard() {
  const { tasks, updateTask, teams, addTask, addTeam, updateTeam, currentUser, attendance } = useStore()
  const { toast } = useToast()

  const currentZone = currentUser?.zoneId || 'Zone 4 (Vaikunth Nagar)'
  
  // Dynamic filtering based on current zone
  const zoneTasks = React.useMemo(() => tasks.filter(t => t.zoneId === currentZone), [tasks, currentZone])
  const zoneTeams = React.useMemo(() => teams.filter(t => t.zoneId === currentZone), [teams, currentZone])

  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = React.useState(false)
  const [isEditTeamInfoModalOpen, setIsEditTeamInfoModalOpen] = React.useState(false)
  const [editingTeam, setEditingTeam] = React.useState<User | null>(null)
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false)
  const [selectedTeamForMember, setSelectedTeamForMember] = React.useState<User | null>(null)
  
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = React.useState(false)
  const [editingMemberContext, setEditingMemberContext] = React.useState<{ teamId: string, member: TeamMember } | null>(null)

  // Auto-forwarding logic for unassigned tasks
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      zoneTasks.forEach(task => {
        if (task.status === 'Pending' && !task.assignedTo) {
          const createdTime = new Date(task.createdAt).getTime()
          if (now - createdTime > 30 * 60 * 1000) {
            updateTask(task.id, { zoneId: 'Nearby Zone (Forwarded)' })
            toast({
              title: "Task Forwarded",
              description: `Unassigned task "${task.name}" forwarded to nearby zone.`,
              variant: "destructive"
            })
          }
        }
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [zoneTasks, updateTask, toast])

  const handleAssignTask = (taskId: string, workerId: string) => {
    if (!workerId) return
    updateTask(taskId, { 
      assignedTo: workerId, 
      status: 'Pending'
    })
    toast({ title: "Task Assigned", description: `Dispatched to Team ${workerId}.` })
  }

  const handleSimulateSensor = (type: SensorSubType) => {
    const names: Record<SensorSubType, string> = {
      Dustbin: 'work-disprose waste',
      Drainage: 'trainage leakage',
      Water: 'water leakage',
      Toilet: 'toilet waste disposal',
      Napkin: 'napkin/product refill'
    }

    const newTask: Task = {
      id: `sensor-${Date.now()}`,
      name: names[type],
      location: 'Main Road Junction',
      status: 'Pending',
      type: 'Sensor',
      subType: type,
      wardId: 'ward-14',
      zoneId: currentZone,
      createdAt: new Date().toISOString()
    }
    addTask(newTask)
    toast({ title: "Alert Logged", description: `${names[type]} reported via sensor.` })
  }

  const handleCreateTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newTeam: User = {
      id: fd.get('workerUserId') as string,
      name: fd.get('leaderName') as string,
      role: 'Worker',
      teamNumber: `Team ${fd.get('workerUserId')}`,
      zoneId: currentZone,
      rewardPoints: 0,
      members: [],
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string
    }
    addTeam(newTeam)
    setIsNewTeamModalOpen(false)
    toast({ title: "Team Registered", description: `Team ${newTeam.id} added to ${currentZone}.` })
  }

  const handleEditTeamSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeam) return
    const fd = new FormData(e.currentTarget)
    updateTeam(editingTeam.id, {
      name: fd.get('leaderName') as string,
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string,
    })
    setIsEditTeamInfoModalOpen(false)
    toast({ title: "Profile Saved", description: "Team leader info updated." })
  }

  const handleAddMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTeamForMember) return
    const fd = new FormData(e.currentTarget)
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: fd.get('name') as string,
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string,
    }
    const updated = [...(selectedTeamForMember.members || []), newMember]
    updateTeam(selectedTeamForMember.id, { members: updated })
    setIsAddMemberModalOpen(false)
    toast({ title: "Member Added", description: `${newMember.name} joined the team.` })
  }

  const handleEditMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMemberContext) return
    const fd = new FormData(e.currentTarget)
    const team = teams.find(t => t.id === editingMemberContext.teamId)
    if (!team) return
    const updated = team.members?.map(m => m.id === editingMemberContext.member.id ? {
      ...m,
      name: fd.get('name') as string,
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string,
    } : m)
    updateTeam(team.id, { members: updated })
    setIsEditMemberModalOpen(false)
    toast({ title: "Changes Saved", description: "Member profile updated." })
  }

  const today = new Date().toLocaleDateString()

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Zone Control Panel</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapIcon className="h-3 w-3" /> Managing {currentZone}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                <Zap className="h-4 w-4" /> Simulate Sensors
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Trigger Virtual Sensors</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-2 pt-4">
                <Button variant="secondary" onClick={() => handleSimulateSensor('Dustbin')}>Dustbin (work-disprose waste)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Drainage')}>Drainage (trainage leakage)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Water')}>Water (water leakage)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Toilet')}>Toilet (toilet waste disposal)</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Napkin')}>Napkin (napkin/product refill)</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsNewTeamModalOpen(true)} className="gap-2 font-bold shadow-lg">
            <UserPlus className="h-4 w-4" /> New Team
          </Button>
        </div>
      </header>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-14 p-1 rounded-xl">
          <TabsTrigger value="assignments" className="font-bold gap-2 text-md">
            <ClipboardList className="h-4 w-4" /> Live Task Board
          </TabsTrigger>
          <TabsTrigger value="performance" className="font-bold gap-2 text-md">
            <BarChart3 className="h-4 w-4" /> Team Performance
          </TabsTrigger>
          <TabsTrigger value="teams" className="font-bold gap-2 text-md">
            <Users className="h-4 w-4" /> Team Roster
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl ring-2 ring-rose-500/20">
              <CardHeader className="bg-rose-50/50 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="h-5 w-5 animate-pulse" /> Live Sensor Alerts
                </CardTitle>
                <CardDescription>Real-time sensor triggers requiring immediate dispatch</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type === 'Sensor' && !t.assignedTo).length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground italic bg-secondary/5">No active sensor alerts.</div>
                  ) : (
                    zoneTasks.filter(t => t.type === 'Sensor' && !t.assignedTo).map((task) => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-primary">{task.name}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <MapIcon className="h-3 w-3" /> {task.location}
                          </p>
                        </div>
                        <select 
                          className="text-xs p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary/20"
                          onChange={(e) => handleAssignTask(task.id, e.target.value)}
                        >
                          <option value="">Assign Team...</option>
                          {zoneTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.name} ({team.id})</option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader className="bg-primary/5 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <UserCircle className="h-5 w-5" /> Citizen Service Requests
                </CardTitle>
                <CardDescription>Public complaints and private cleaning requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type.startsWith('Citizen') && !t.assignedTo).length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground italic bg-secondary/5">No pending citizen requests.</div>
                  ) : (
                    zoneTasks.filter(t => t.type.startsWith('Citizen') && !t.assignedTo).map((task) => (
                      <div key={task.id} className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm">{task.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{task.location}</p>
                          </div>
                          <StatusBadge 
                            status={task.type === 'Citizen Private' ? 'Yellow' : 'Red'} 
                            label={task.type === 'Citizen Private' ? 'Private' : 'Public'} 
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            className="text-xs p-2 border rounded-lg bg-white flex-1"
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Select Team for Dispatch...</option>
                            {zoneTeams.map(team => (
                              <option key={team.id} value={team.id}>{team.name} ({team.id})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            {zoneTeams.map(team => {
              const teamTasks = tasks.filter(t => t.assignedTo === team.id)
              const completed = teamTasks.filter(t => t.status === 'Completed').length
              const inProgress = teamTasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending').length
              const teamAttendance = attendance[team.id]
              const isMarked = teamAttendance?.date === today

              return (
                <Card key={team.id} className="border-none shadow-lg overflow-hidden">
                  <div className="bg-secondary/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {team.id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{team.name}'s Squad</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ID: {team.id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tasks</p>
                        <p className="text-2xl font-headline font-bold text-primary">{completed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">In-Progress</p>
                        <p className="text-2xl font-headline font-bold text-amber-500">{inProgress}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Rewards</p>
                        <p className="text-2xl font-headline font-bold text-emerald-500">{team.rewardPoints || 0}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-40 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Efficiency</span>
                        <span>{teamTasks.length > 0 ? Math.round((completed / teamTasks.length) * 100) : 0}%</span>
                      </div>
                      <Progress value={teamTasks.length > 0 ? (completed / teamTasks.length) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                  <CardContent className="p-6 border-t bg-white">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserCheck className="h-3 w-3" /> Today's Member Attendance ({today})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {isMarked ? (
                        teamAttendance.members.map((m, i) => (
                          <div key={i} className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-between",
                            m.status === 'Present' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                          )}>
                            <span className="truncate">{m.name}</span>
                            <span className="text-[9px]">{m.status}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg bg-secondary/10">
                          Attendance not yet logged for this team today.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneTeams.map(team => (
              <Card key={team.id} className="border-none shadow-xl flex flex-col group hover:ring-2 hover:ring-primary/20 transition-all">
                <CardHeader className="bg-secondary/10 border-b p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-headline text-primary">{team.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                          setEditingTeam(team)
                          setIsEditTeamInfoModalOpen(true)
                        }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p className="font-bold">{team.age} Years • {team.contactNumber}</p>
                        <p className="flex items-center gap-1"><MapIcon className="h-3 w-3" /> {team.address}</p>
                        <p className="font-mono text-[9px] bg-white w-fit px-1.5 py-0.5 rounded border mt-2">Login ID: {team.id}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold" onClick={() => {
                      setSelectedTeamForMember(team)
                      setIsAddMemberModalOpen(true)
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3 flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Team Members ({team.members?.length || 0})</p>
                  {team.members?.map(member => (
                    <div key={member.id} className="p-3 rounded-xl bg-secondary/20 flex items-center justify-between group/member hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-primary/10">
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{member.age}y • {member.contactNumber}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/member:opacity-100 transition-opacity" onClick={() => {
                        setEditingMemberContext({ teamId: team.id, member })
                        setIsEditMemberModalOpen(true)
                      }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {(!team.members || team.members.length === 0) && (
                    <div className="py-8 text-center text-xs text-muted-foreground italic border border-dashed rounded-xl">No members added.</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals for Management */}
      <Dialog open={isNewTeamModalOpen} onOpenChange={setIsNewTeamModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Register New Team Leader</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Worker User ID (Login Handle)</Label><Input name="workerUserId" required placeholder="e.g. team-alpha" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Leader Name</Label><Input name="leaderName" required /></div>
              <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" required /></div>
            </div>
            <div className="space-y-2"><Label>Phone Number</Label><Input name="contact" required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
            <Button type="submit" className="w-full font-bold h-11">Register Team</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTeamInfoModalOpen} onOpenChange={setIsEditTeamInfoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Leader Details</DialogTitle></DialogHeader>
          <form onSubmit={handleEditTeamSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Leader Name</Label><Input name="leaderName" defaultValue={editingTeam?.name} required /></div>
              <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" defaultValue={editingTeam?.age} required /></div>
            </div>
            <div className="space-y-2"><Label>Phone Number</Label><Input name="contact" defaultValue={editingTeam?.contactNumber} required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={editingTeam?.address} required /></div>
            <Button type="submit" className="w-full font-bold h-11">Update Profile</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <form onSubmit={handleAddMemberSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" required /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input name="contact" required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
            <Button type="submit" className="w-full font-bold h-11">Add to Team</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMemberModalOpen} onOpenChange={setIsEditMemberModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Member Profile</DialogTitle></DialogHeader>
          <form onSubmit={handleEditMemberSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={editingMemberContext?.member.name} required /></div>
              <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" defaultValue={editingMemberContext?.member.age} required /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input name="contact" defaultValue={editingMemberContext?.member.contactNumber} required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={editingMemberContext?.member.address} required /></div>
            <Button type="submit" className="w-full font-bold h-11">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
