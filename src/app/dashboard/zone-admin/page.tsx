
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
  Eye
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
  const { tasks, updateTask, teams, addTask, updateTeam, currentUser } = useStore()
  const { toast } = useToast()

  const currentZone = currentUser?.zoneId || 'Zone 4 (Vaikunth Nagar)'
  const zoneTasks = tasks.filter(t => t.zoneId === currentZone)
  const zoneTeams = teams.filter(t => t.zoneId === currentZone)

  const [selectedTeam, setSelectedTeam] = React.useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<{ teamNumber: string, member: TeamMember } | null>(null)

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

  const handleAssignTask = (taskId: string, teamNumber: string) => {
    if (!teamNumber) return
    const task = zoneTasks.find(t => t.id === taskId)
    if (!task) return

    updateTask(taskId, { 
      assignedTo: teamNumber, 
      status: 'Pending',
      paymentStatus: task.type === 'Citizen Private' ? 'Unpaid' : undefined
    })
    
    toast({
      title: "Task Assigned",
      description: `Task allocated to ${teamNumber}. Citizen will be notified.`,
    })
  }

  const handleSimulateSensor = (type: SensorSubType) => {
    const names: Record<SensorSubType, string> = {
      Dustbin: 'work-disprose waste',
      Drainage: 'drainage leakage',
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
    updateTeam(selectedTeam.teamNumber!, { members: updatedMembers })
    setIsAddModalOpen(false)
    toast({ title: "Member Added", description: `${newMember.name} joined ${selectedTeam.teamNumber}.` })
  }

  const handleEditMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMember) return
    const fd = new FormData(e.currentTarget)
    
    const team = teams.find(t => t.teamNumber === editingMember.teamNumber)
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

    updateTeam(editingMember.teamNumber, { members: updatedMembers })
    setIsEditModalOpen(false)
    setEditingMember(null)
    toast({ title: "Profile Updated", description: "Member details saved successfully." })
  }

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
                <Button variant="secondary" onClick={() => handleSimulateSensor('Dustbin')}>Dustbin Overflow</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Drainage')}>Drainage Leakage</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Water')}>Water Leakage</Button>
                <Button variant="secondary" onClick={() => handleSimulateSensor('Toilet')}>Toilet Maintenance</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2 bg-primary font-bold">
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
                        <div>
                          <h4 className="font-bold text-sm capitalize">{task.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapIcon className="h-3 w-3" /> {task.location}</p>
                          <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-2 py-0.5 rounded mt-2 inline-block">
                            {task.subType || task.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.type === 'Citizen Public' && (
                             <Button variant="ghost" size="icon" className="text-primary" title="Check Image Proof">
                               <Eye className="h-4 w-4" />
                             </Button>
                          )}
                          <select 
                            className="text-xs p-2 border rounded-md bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Assign Worker...</option>
                            {zoneTeams.map(team => <option key={team.id} value={team.teamNumber}>{team.teamNumber}</option>)}
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
                            {zoneTeams.map(team => <option key={team.id} value={team.teamNumber}>{team.teamNumber}</option>)}
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
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Team Wise Performance Comparison</CardTitle>
              <CardDescription>Comparative metrics for all teams in {currentZone}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {zoneTeams.map(team => (
                  <div key={team.id} className="space-y-3 p-4 rounded-xl border bg-secondary/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                           {team.teamNumber?.split(' ')[1]}
                         </div>
                         <div>
                           <p className="font-bold">{team.teamNumber}</p>
                           <p className="text-xs text-muted-foreground">Lead: {team.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Reward Points</p>
                          <p className="font-headline font-bold text-lg text-primary">{team.rewardPoints} pts</p>
                        </div>
                        <StatusBadge status={team.rewardPoints! > 400 ? 'Green' : team.rewardPoints! > 300 ? 'Yellow' : 'Red'} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                        <span>Efficiency Level</span>
                        <span>{Math.round((team.rewardPoints! / 600) * 100)}%</span>
                      </div>
                      <Progress value={(team.rewardPoints! / 600) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneTeams.map(team => (
              <Card key={team.id} className="border-none shadow-md flex flex-col">
                <CardHeader className="pb-3 border-b bg-secondary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-headline">{team.teamNumber}</CardTitle>
                      <CardDescription>Leader: {team.name}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => {
                      setSelectedTeam(team)
                      setIsAddModalOpen(true)
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Team Roster</p>
                  {team.members?.map(member => (
                    <div key={member.id} className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between group hover:bg-secondary/30 transition-colors border border-transparent hover:border-primary/20">
                      <div>
                        <p className="font-bold text-sm">{member.name} <span className="text-muted-foreground font-normal">({member.age})</span></p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {member.contactNumber}</span>
                          <span className="flex items-center gap-1"><MapIcon className="h-2.5 w-2.5" /> {member.address}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                        setEditingMember({ teamNumber: team.teamNumber!, member })
                        setIsEditModalOpen(true)
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member to {selectedTeam?.teamNumber}</DialogTitle>
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
              <Label>Contact Number</Label>
              <Input name="contact" placeholder="987xxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" placeholder="Residential address" required />
            </div>
            <Button type="submit" className="w-full font-bold">Register Member</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member: {editingMember?.member.name}</DialogTitle>
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
              <Label>Contact Number</Label>
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
