
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
  UserCheck
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
  const zoneTasks = tasks.filter(t => t.zoneId === currentZone)
  const zoneTeams = teams.filter(t => t.zoneId === currentZone)

  const [selectedTeam, setSelectedTeam] = React.useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = React.useState(false)
  const [isEditTeamInfoModalOpen, setIsEditTeamInfoModalOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<{ workerId: string, member: TeamMember } | null>(null)
  const [editingTeam, setEditingTeam] = React.useState<User | null>(null)

  // Auto-forwarding logic: Check tasks unassigned for > 30 mins
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      zoneTasks.forEach(task => {
        if (task.status === 'Pending' && !task.assignedTo) {
          const createdTime = new Date(task.createdAt).getTime()
          if (now - createdTime > 30 * 60 * 1000) { // 30 minutes
            updateTask(task.id, { zoneId: 'Nearby Zone (Auto-Forwarded)' })
            toast({
              title: "Task Auto-Forwarded",
              description: `Task for ${task.name} forwarded to nearby zone due to 30min delay.`,
              variant: "destructive"
            })
          }
        }
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [zoneTasks, updateTask, toast])

  const handleAssignTask = (taskId: string, workerId: string) => {
    if (!workerId) return
    updateTask(taskId, { 
      assignedTo: workerId, 
      status: 'Pending'
    })
    
    toast({
      title: "Task Assigned",
      description: `Task allocated to team associated with ${workerId}.`,
    })
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
      location: 'Simulated Location St.',
      status: 'Pending',
      type: 'Sensor',
      subType: type,
      wardId: 'ward-14',
      zoneId: currentZone,
      createdAt: new Date().toISOString()
    }
    addTask(newTask)
    toast({ title: "Sensor Alert Received", description: `${names[type]} detected.` })
  }

  const handleCreateTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const workerUserId = fd.get('workerUserId') as string
    const leaderName = fd.get('leaderName') as string
    const age = parseInt(fd.get('age') as string)
    const contactNumber = fd.get('contact') as string
    const address = fd.get('address') as string

    const newTeam: User = {
      id: workerUserId,
      name: leaderName,
      role: 'Worker',
      teamNumber: `Team ${workerUserId}`,
      zoneId: currentZone,
      rewardPoints: 0,
      members: [],
      age,
      contactNumber,
      address
    }

    addTeam(newTeam)
    setIsNewTeamModalOpen(false)
    toast({ title: "New Team Created", description: `${newTeam.teamNumber} is now active.` })
  }

  const handleEditTeamInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeam) return
    const fd = new FormData(e.currentTarget)
    
    const updates: Partial<User> = {
      name: fd.get('leaderName') as string,
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string,
    }

    updateTeam(editingTeam.id, updates)
    setIsEditTeamInfoModalOpen(false)
    setEditingTeam(null)
    toast({ title: "Team Profile Updated", description: "Leader information has been saved." })
  }

  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTeam) return
    const fd = new FormData(e.currentTarget)
    
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: fd.get('name') as string,
      age: parseInt(fd.get('age') as string),
      contactNumber: fd.get('contact') as string,
      address: fd.get('address') as string,
    }

    const updatedMembers = [...(selectedTeam.members || []), newMember]
    updateTeam(selectedTeam.id, { members: updatedMembers })
    setIsAddModalOpen(false)
    toast({ title: "Member Added", description: `${newMember.name} joined the team.` })
  }

  const handleEditMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMember) return
    const fd = new FormData(e.currentTarget)
    
    const team = teams.find(t => t.id === editingMember.workerId)
    if (!team) return

    const updatedMembers = team.members?.map(m => 
      m.id === editingMember.member.id ? {
        ...m,
        name: fd.get('name') as string,
        age: parseInt(fd.get('age') as string),
        contactNumber: fd.get('contact') as string,
        address: fd.get('address') as string,
      } : m
    )

    updateTeam(editingMember.workerId, { members: updatedMembers })
    setIsEditModalOpen(false)
    setEditingMember(null)
    toast({ title: "Profile Updated", description: "Member details saved successfully." })
  }

  const today = new Date().toLocaleDateString();
  const teamPerformanceData = zoneTeams.map(team => {
    const teamTasks = tasks.filter(t => t.assignedTo === team.id);
    const completed = teamTasks.filter(t => t.status === 'Completed').length;
    const incomplete = teamTasks.filter(t => t.status !== 'Completed').length;
    
    // Key is team.id (which is the worker's user id)
    const teamAttendance = attendance[team.id];
    const isAttendanceToday = teamAttendance?.date === today;

    return {
      ...team,
      completed,
      incomplete,
      todaysAttendance: isAttendanceToday ? teamAttendance.members : null
    };
  });

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
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary text-primary">
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
          <Button onClick={() => setIsNewTeamModalOpen(true)} className="gap-2 bg-primary font-bold">
            <UserPlus className="h-4 w-4" /> New Team
          </Button>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-12 p-1">
          <TabsTrigger value="assignments" className="font-bold gap-2">
            <ClipboardList className="h-4 w-4" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="performance" className="font-bold gap-2">
            <BarChart3 className="h-4 w-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="teams" className="font-bold gap-2">
            <Users className="h-4 w-4" /> Team Mgmt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" /> Sensor & Public Queue
                </CardTitle>
                <CardDescription>Automated alerts and citizen public complaints</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type !== 'Citizen Private' && !t.assignedTo).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">No pending public alerts in this zone.</div>
                  ) : (
                    zoneTasks.filter(t => t.type !== 'Citizen Private' && !t.assignedTo).map((task) => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm capitalize">{task.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapIcon className="h-3 w-3" /> {task.location}</p>
                          <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-2 py-0.5 rounded mt-2 inline-block">
                            {task.subType || task.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="text-xs p-2 border rounded-md bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Assign Worker...</option>
                            {zoneTeams.map(team => (
                              <option key={team.id} value={team.id}>
                                {team.name} ({team.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" /> Private Service Requests
                </CardTitle>
                <CardDescription>Household requests requiring payment verification</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                   {zoneTasks.filter(t => t.type === 'Citizen Private').length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">No private requests found.</div>
                  ) : (
                    zoneTasks.filter(t => t.type === 'Citizen Private').map((task) => (
                      <div key={task.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm">{task.name}</h4>
                            <p className="text-xs text-muted-foreground">{task.location}</p>
                          </div>
                          <StatusBadge 
                            status={task.paymentStatus === 'Paid' ? 'Green' : 'Red'} 
                            label={task.paymentStatus || 'Awaiting Payment'} 
                            className="text-[10px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select 
                            className="text-xs p-2 border rounded-md flex-1 bg-white"
                            value={task.assignedTo || ""}
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Assign Worker...</option>
                            {zoneTeams.map(team => (
                              <option key={team.id} value={team.id}>
                                {team.name} ({team.id})
                              </option>
                            ))}
                          </select>
                          {task.assignedTo && task.status === 'In Progress' && task.paymentStatus === 'Unpaid' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-8" onClick={() => updateTask(task.id, { paymentStatus: 'Paid' })}>
                              Verify Payment
                            </Button>
                          )}
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
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" /> Team Performance Analysis
                </CardTitle>
                <CardDescription>Live tracking of task completion, rewards, and member attendance in {currentZone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {teamPerformanceData.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground italic">
                    <Users className="h-12 w-12 mx-auto opacity-20 mb-4" />
                    No team performance data available.
                  </div>
                ) : (
                  teamPerformanceData.map(team => (
                    <div key={team.id} className="bg-secondary/20 rounded-2xl p-6 border group hover:border-primary/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-headline text-xl font-bold">
                            {team.id.charAt(team.id.length - 1).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-primary">{team.teamNumber}</h3>
                            <p className="text-sm text-muted-foreground">Lead: {team.name}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border">ID: {team.id}</span>
                              <StatusBadge 
                                status={team.rewardPoints && team.rewardPoints > 400 ? 'Green' : team.rewardPoints && team.rewardPoints > 200 ? 'Yellow' : 'Red'} 
                                className="text-[9px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 px-6 md:border-l md:border-r border-slate-300">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Completed</p>
                            <div className="flex items-center justify-center gap-1 text-emerald-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-2xl font-headline font-bold">{team.completed}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Incomplete</p>
                            <div className="flex items-center justify-center gap-1 text-rose-500">
                              <XCircle className="h-4 w-4" />
                              <span className="text-2xl font-headline font-bold">{team.incomplete}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Rewards</p>
                            <div className="flex items-center justify-center gap-1 text-primary">
                              <Zap className="h-4 w-4 fill-current" />
                              <span className="text-2xl font-headline font-bold">{team.rewardPoints || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-48 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="text-primary">{Math.round((team.completed / (team.completed + team.incomplete || 1)) * 100)}%</span>
                          </div>
                          <Progress value={(team.completed / (team.completed + team.incomplete || 1)) * 100} className="h-2" />
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-300">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <UserCheck className="h-3 w-3" /> Daily Member Attendance (Today)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {team.todaysAttendance ? (
                            team.todaysAttendance.map((member, idx) => (
                              <div key={idx} className={cn(
                                "flex items-center justify-between p-2 rounded-lg border text-[11px] font-medium shadow-sm",
                                member.status === 'Present' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                              )}>
                                <span className="truncate pr-2">{member.name}</span>
                                <span className="font-bold shrink-0">{member.status}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic bg-secondary/10 rounded-lg border border-dashed">
                              Attendance record not yet available for today
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneTeams.length === 0 ? (
               <div className="col-span-full py-20 text-center space-y-4">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <p className="text-muted-foreground">No teams registered in this zone.</p>
               </div>
            ) : zoneTeams.map(team => (
              <Card key={team.id} className="border-none shadow-md flex flex-col group hover:ring-2 hover:ring-primary/20 transition-all">
                <CardHeader className="pb-3 border-b bg-secondary/10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-headline text-primary">Leader: {team.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                          setEditingTeam(team)
                          setIsEditTeamInfoModalOpen(true)
                        }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="font-bold text-primary/80">Age: {team.age}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {team.contactNumber}</span>
                        <span className="flex items-center gap-1"><MapIcon className="h-3 w-3" /> {team.address}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-white w-fit px-1.5 py-0.5 rounded border">
                        <Fingerprint className="h-3 w-3" /> User ID: {team.id}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={() => {
                      setSelectedTeam(team)
                      setIsAddModalOpen(true)
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Team Roster ({team.members?.length || 0})</p>
                  {team.members?.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg bg-secondary/5">
                      No members assigned yet
                    </div>
                  ) : team.members?.map(member => (
                    <div key={member.id} className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between group/member hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{member.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">{member.age}y</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {member.contactNumber}</span>
                          <span className="flex items-center gap-1"><MapIcon className="h-2.5 w-2.5" /> {member.address}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                          setEditingMember({ workerId: team.id, member })
                          setIsEditModalOpen(true)
                        }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                   <Button variant="ghost" className="w-full text-[10px] font-bold text-muted-foreground h-8 hover:text-primary">
                     <Settings2 className="h-3 w-3 mr-1" /> Team Controls
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Team Modal */}
      <Dialog open={isNewTeamModalOpen} onOpenChange={setIsNewTeamModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New Team Leader</DialogTitle>
            <DialogDescription>Setup a new team for {currentZone}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Worker User ID (Login Username)</Label>
              <Input name="workerUserId" placeholder="e.g. worker-101" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leader Name</Label>
                <Input name="leaderName" placeholder="Full Name" required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input name="age" type="number" placeholder="Leader Age" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leader Phone Number</Label>
              <Input name="contact" placeholder="987xxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label>Leader Address</Label>
              <Input name="address" placeholder="Full residential address" required />
            </div>
            <Button type="submit" className="w-full font-bold h-11">Register Team</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Info Modal */}
      <Dialog open={isEditTeamInfoModalOpen} onOpenChange={setIsEditTeamInfoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Leader Information</DialogTitle>
            <DialogDescription>Update the profile for Team ID: {editingTeam?.id}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTeamInfoSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leader Name</Label>
                <Input name="leaderName" defaultValue={editingTeam?.name} required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input name="age" type="number" defaultValue={editingTeam?.age} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leader Phone Number</Label>
              <Input name="contact" defaultValue={editingTeam?.contactNumber} required />
            </div>
            <div className="space-y-2">
              <Label>Leader Address</Label>
              <Input name="address" defaultValue={editingTeam?.address} required />
            </div>
            <Button type="submit" className="w-full font-bold h-11">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" placeholder="Member Name" required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input name="age" type="number" placeholder="Age" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="contact" placeholder="987xxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" placeholder="Residential address" required />
            </div>
            <Button type="submit" className="w-full font-bold">Add Member</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMemberSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" defaultValue={editingMember?.member.name} required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input name="age" type="number" defaultValue={editingMember?.member.age} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="contact" defaultValue={editingMember?.member.contactNumber} required />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" defaultValue={editingMember?.member.address} required />
            </div>
            <Button type="submit" className="w-full font-bold">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
