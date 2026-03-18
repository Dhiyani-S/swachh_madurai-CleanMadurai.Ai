
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore, TeamMember, User } from "@/lib/store"
import { 
  Users, 
  UserPlus, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit2, 
  Plus, 
  Save, 
  UserCheck, 
  HardHat,
  UserCircle,
  Users2,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ZoneAdminTeams() {
  const { users, currentUser, addUser, updateUser, teams, addTeam, addTeamMember, removeTeamMember } = useStore()
  const { toast } = useToast()
  
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = React.useState(false)
  const [selectedWorker, setSelectedWorker] = React.useState<User | null>(null)
  
  // Registration Form State (Team Account)
  const [newWorker, setNewWorker] = React.useState({
    id: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    teamId: '',
  })

  // New Member Form State (Individual Personnel)
  const [newMember, setNewMember] = React.useState<TeamMember>({
    workerId: '',
    name: '',
    age: 0,
    phone: '',
    address: ''
  })

  const currentZone = currentUser?.zone || 'ZA'
  const zoneWorkers = users.filter(u => u.role === 'worker' && u.zone === currentZone)

  const handleRegisterTeamAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorker.id || !newWorker.password || !newWorker.name || !newWorker.teamId) {
      toast({ title: "Error", description: "Team ID, Name, Password and Team Code are required.", variant: "destructive" })
      return
    }

    if (users.find(u => u.id === newWorker.id)) {
      toast({ title: "Error", description: "Login ID already exists.", variant: "destructive" })
      return
    }

    // 1. Create Login Account
    addUser({
      id: newWorker.id,
      name: newWorker.name,
      password: newWorker.password,
      role: 'worker',
      teamId: newWorker.teamId,
      zone: currentZone,
      phone: newWorker.phone,
      address: newWorker.address,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    })

    // 2. Initialize the Team Roster object
    addTeam({
      id: newWorker.teamId,
      zone: currentZone,
      name: newWorker.name,
      members: [],
      supervisorId: currentUser?.id || ''
    })

    toast({ title: "Team Registered", description: `Account ${newWorker.id} created for Team ${newWorker.teamId}.` })
    setNewWorker({ id: '', password: '', name: '', phone: '', address: '', teamId: '' })
    setIsRegisterOpen(false)
  }

  const handleUpdateTeamDetails = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorker) return
    
    updateUser(selectedWorker.id, {
      name: selectedWorker.name,
      phone: selectedWorker.phone,
      address: selectedWorker.address
    })
    
    toast({ title: "Details Updated", description: "Team account details updated." })
    setIsManageMembersOpen(false)
  }

  const handleAddPersonnelToTeam = () => {
    if (!selectedWorker?.teamId || !newMember.name || !newMember.phone) {
      toast({ title: "Validation Error", description: "Member Name and Phone are required.", variant: "destructive" })
      return
    }
    const memberWithId = { ...newMember, workerId: `M-${Date.now()}` }
    addTeamMember(selectedWorker.teamId, memberWithId)
    setNewMember({ workerId: '', name: '', age: 0, phone: '', address: '' })
    toast({ title: "Member Added", description: `${newMember.name} added to the roster.` })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">Field Management</h1>
          <p className="text-white/40 font-medium tracking-tight">Assign Team Login IDs and manage personnel rosters for Zone {currentZone}</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-black rounded-2xl">
              <UserPlus className="h-5 w-5" /> New Team Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-panel text-white rounded-[2.5rem] border-primary/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl text-primary">Register Field Team</DialogTitle>
              <DialogDescription className="text-white/60">
                Create a single login account for the entire team and assign an operational area.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterTeamAccount} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Team Login ID</Label>
                  <Input id="id" placeholder="e.g. TEAM-NORTH-01" value={newWorker.id} onChange={e => setNewWorker({...newWorker, id: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password"  className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Login Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={newWorker.password} onChange={e => setNewWorker({...newWorker, password: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Team Display Name</Label>
                  <Input id="teamName" placeholder="e.g. North Alpha" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamId" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Team Code (Internal)</Label>
                  <Input id="teamId" placeholder="e.g. T1" value={newWorker.teamId} onChange={e => setNewWorker({...newWorker, teamId: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Assigned Area</Label>
                <Input id="area" placeholder="e.g. Anna Nagar Junction" value={newWorker.address} onChange={e => setNewWorker({...newWorker, address: e.target.value})} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold h-14 rounded-2xl bg-primary text-black">Create Team Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {zoneWorkers.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-panel border-2 border-dashed border-white/10 rounded-[3rem]">
            <HardHat className="h-16 w-16 mx-auto text-white/10 mb-4" />
            <p className="text-white/40 font-bold font-headline text-2xl uppercase tracking-tighter">No field units active.</p>
          </div>
        ) : (
          zoneWorkers.map((worker) => {
            const teamInfo = teams.find(t => t.id === worker.teamId);
            const memberCount = teamInfo?.members.length || 0;
            
            return (
              <Card key={worker.id} className="border-none shadow-2xl relative overflow-hidden rounded-[3rem] glass-panel group hover:border-primary/40 transition-all">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-headline font-bold text-white">{worker.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase tracking-widest">Code: {worker.teamId}</Badge>
                        <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-bold flex items-center gap-1">
                          <Key className="h-2 w-2" /> ID: {worker.id}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/40 text-[10px] font-bold flex items-center gap-1">
                      <Users2 className="h-3 w-3" /> {memberCount} Personnel
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{worker.address || 'Location Pending'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{worker.phone || 'No Contact Info'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full font-bold text-sm border-white/10 hover:bg-primary/10 hover:text-primary rounded-2xl h-12"
                    onClick={() => {
                      setSelectedWorker(worker)
                      setIsManageMembersOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Manage Personnel & Roster
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="max-w-3xl glass-panel text-white rounded-[3.5rem] shadow-2xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-headline text-4xl text-primary mt-4 uppercase tracking-tighter">Unit Profile: {selectedWorker?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="roster" className="w-full mt-4">
            <TabsList className="bg-white/5 p-1 h-12 rounded-2xl border border-white/10 mb-6 w-full">
              <TabsTrigger value="roster" className="flex-1 rounded-xl font-bold px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[10px] tracking-widest">Team Personnel (Roster)</TabsTrigger>
              <TabsTrigger value="details" className="flex-1 rounded-xl font-bold px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[10px] tracking-widest">Account & Area</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleUpdateTeamDetails} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest ml-2">Team Name</Label>
                    <Input 
                      value={selectedWorker?.name || ''} 
                      onChange={e => setSelectedWorker(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest ml-2">Assigned Area</Label>
                    <Input 
                      value={selectedWorker?.address || ''} 
                      onChange={e => setSelectedWorker(prev => prev ? {...prev, address: e.target.value} : null)}
                      className="h-12 rounded-xl border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest ml-2">Contact Number</Label>
                    <Input 
                      value={selectedWorker?.phone || ''} 
                      onChange={e => setSelectedWorker(prev => prev ? {...prev, phone: e.target.value} : null)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-primary text-black shadow-2xl shadow-primary/20">
                  <Save className="h-5 w-5 mr-2" /> Save Team Updates
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="roster">
              <div className="space-y-8">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-primary/10">
                  <h4 className="font-headline font-bold text-lg mb-4 flex items-center gap-2 uppercase tracking-tighter"><Plus className="h-5 w-5 text-primary" /> Add Team Member</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase font-bold text-white/40 ml-1">Member Name</Label>
                      <Input placeholder="Full Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-10 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase font-bold text-white/40 ml-1">Phone Number</Label>
                      <Input placeholder="9876543210" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="h-10 text-xs" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddPersonnelToTeam} className="w-full h-10 font-bold bg-primary text-black rounded-xl">Add to Team</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <h4 className="font-bold text-white/60 uppercase text-[10px] tracking-widest ml-2 flex items-center gap-2">
                     <Users className="h-3 w-3" /> Unit Personnel List ({teams.find(t => t.id === selectedWorker?.teamId)?.members.length || 0})
                   </h4>
                   <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                     {teams.find(t => t.id === selectedWorker?.teamId)?.members.length === 0 ? (
                       <p className="text-center py-10 text-white/20 italic">No members have been added to this team yet.</p>
                     ) : (
                       teams.find(t => t.id === selectedWorker?.teamId)?.members.map((member, i) => (
                         <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black/30 border border-white/5 group transition-all hover:border-primary/20">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-primary/40" />
                              </div>
                              <div>
                                <p className="font-bold text-md text-white">{member.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                  <Phone className="h-2 w-2" /> {member.phone || 'No Contact'}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeTeamMember(selectedWorker?.teamId!, member.workerId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
