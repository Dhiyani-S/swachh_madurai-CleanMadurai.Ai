
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
  UserCircle
} from "lucide-react"
import { useStore, Task, User, TeamMember } from "@/lib/store"
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
  const { tasks, updateTask, teams, addTeam, updateTeam, currentUser } = useStore()
  const { toast } = useToast()

  const currentZone = currentUser?.zoneId || 'Zone 4 (Vaikunth Nagar)'
  const zoneTasks = tasks.filter(t => t.zoneId === currentZone)
  const zoneTeams = teams.filter(t => t.zoneId === currentZone)

  const [selectedTeam, setSelectedTeam] = React.useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  // Auto-forwarding logic simulator
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
              description: `Task ${task.id} has been forwarded to a nearby zone admin due to inactivity.`,
              variant: "destructive"
            })
          }
        }
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [zoneTasks, updateTask])

  const handleAssignTask = (taskId: string, teamNumber: string) => {
    const task = zoneTasks.find(t => t.id === taskId)
    if (!task) return

    const updates: Partial<Task> = { assignedTo: teamNumber, status: 'Pending' }
    
    if (task.type === 'Citizen Private') {
      updates.paymentStatus = 'Unpaid'
    }

    updateTask(taskId, updates)
    toast({
      title: "Task Assigned",
      description: `Task has been assigned to ${teamNumber}.`,
    })
  }

  const handleAddMember = (teamNumber: string, formData: FormData) => {
    const team = teams.find(t => t.teamNumber === teamNumber)
    if (!team) return

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: formData.get('name') as string,
      age: parseInt(formData.get('age') as string),
      contactNumber: formData.get('contact') as string,
      address: formData.get('address') as string,
    }

    const updatedMembers = [...(team.members || []), newMember]
    updateTeam(teamNumber, { members: updatedMembers })
    setIsAddModalOpen(false)
    toast({ title: "Member Added", description: `${newMember.name} joined ${teamNumber}.` })
  }

  const handleEditMember = (teamNumber: string, memberId: string, formData: FormData) => {
    const team = teams.find(t => t.teamNumber === teamNumber)
    if (!team) return

    const updatedMembers = team.members?.map(m => 
      m.id === memberId ? {
        ...m,
        name: formData.get('name') as string,
        age: parseInt(formData.get('age') as string),
        contactNumber: formData.get('contact') as string,
        address: formData.get('address') as string,
      } : m
    )

    updateTeam(teamNumber, { members: updatedMembers })
    setIsEditModalOpen(false)
    toast({ title: "Profile Updated", description: "Member details have been saved." })
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
        <Button className="gap-2 bg-primary font-bold">
          <UserPlus className="h-4 w-4" /> New Team
        </Button>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-12">
          <TabsTrigger value="assignments" className="font-bold flex gap-2"><ClipboardList className="h-4 w-4" /> Assignments</TabsTrigger>
          <TabsTrigger value="performance" className="font-bold flex gap-2"><BarChart3 className="h-4 w-4" /> Performance</TabsTrigger>
          <TabsTrigger value="teams" className="font-bold flex gap-2"><Users className="h-4 w-4" /> Team Mgmt</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" /> Sensor & Public Queue
                </CardTitle>
                <CardDescription>Incoming alerts needing immediate action</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type !== 'Citizen Private' && !t.assignedTo).map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-secondary/10">
                      <div>
                        <h4 className="font-bold text-sm">{task.name}</h4>
                        <p className="text-xs text-muted-foreground">{task.location}</p>
                        <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {task.subType || task.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {task.imageProof && <Button variant="ghost" size="sm" className="text-[10px]">Check Proof</Button>}
                        <select 
                          className="text-xs p-1 border rounded"
                          onChange={(e) => handleAssignTask(task.id, e.target.value)}
                        >
                          <option value="">Assign To...</option>
                          {zoneTeams.map(team => <option key={team.id} value={team.teamNumber}>{team.teamNumber}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" /> Private Service Requests
                </CardTitle>
                <CardDescription>Requires assignment and payment verification</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {zoneTasks.filter(t => t.type === 'Citizen Private').map((task) => (
                    <div key={task.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{task.name}</h4>
                          <p className="text-xs text-muted-foreground">{task.location}</p>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          task.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {task.paymentStatus || 'Awaiting Assignment'}
                        </div>
                      </div>
                      {!task.assignedTo && (
                        <div className="flex gap-2">
                          <select 
                            className="text-xs p-1 border rounded flex-1"
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Select Worker...</option>
                            {zoneTeams.map(team => <option key={team.id} value={team.teamNumber}>{team.teamNumber}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="pt-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
              <CardDescription>Metrics based on task completion and reward points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {zoneTeams.map(team => (
                  <div key={team.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm">{team.teamNumber}</span>
                        <span className="ml-2 text-xs text-muted-foreground">Lead: {team.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-emerald-600">{team.rewardPoints} Reward Pts</span>
                        <StatusBadge status={team.rewardPoints! > 400 ? 'Green' : team.rewardPoints! > 300 ? 'Yellow' : 'Red'} />
                      </div>
                    </div>
                    <Progress value={(team.rewardPoints! / 600) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneTeams.map(team => (
              <Card key={team.id} className="border-none shadow-md">
                <CardHeader className="pb-3 border-b bg-secondary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-headline">{team.teamNumber}</CardTitle>
                      <CardDescription>Lead: {team.name}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedTeam(team)
                      setIsAddModalOpen(true)
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {team.members?.map(member => (
                    <div key={member.id} className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-sm">{member.name} ({member.age})</p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-2 w-2" /> {member.contactNumber}</span>
                          <span className="flex items-center gap-1"><Home className="h-2 w-2" /> {member.address}</span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Member Profile</DialogTitle>
                          </DialogHeader>
                          <form action={(fd) => handleEditMember(team.teamNumber!, member.id, fd)} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="name" defaultValue={member.name} required />
                              </div>
                              <div className="space-y-2">
                                <Label>Age</Label>
                                <Input name="age" type="number" defaultValue={member.age} required />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Contact Number</Label>
                              <Input name="contact" defaultValue={member.contactNumber} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Address</Label>
                              <Input name="address" defaultValue={member.address} required />
                            </div>
                            <Button type="submit" className="w-full">Save Changes</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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
          <form action={(fd) => handleAddMember(selectedTeam?.teamNumber!, fd)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" placeholder="Name" required />
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
              <Input name="address" placeholder="Full address" required />
            </div>
            <Button type="submit" className="w-full">Register Member</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
