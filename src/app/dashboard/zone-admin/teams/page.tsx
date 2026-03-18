
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
  X, 
  UserCheck, 
  HardHat,
  ChevronRight,
  UserCircle
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
  const { users, currentUser, addUser, updateUser, teams, addTeam, addTeamMember, updateTeamMember, removeTeamMember } = useStore()
  const { toast } = useToast()
  
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = React.useState(false)
  const [selectedWorker, setSelectedWorker] = React.useState<User | null>(null)
  
  // Registration Form State
  const [newWorker, setNewWorker] = React.useState({
    id: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    teamId: '',
  })

  // New Member Form State
  const [newMember, setNewMember] = React.useState<TeamMember>({
    workerId: '',
    name: '',
    age: 0,
    phone: '',
    address: ''
  })

  const currentZone = currentUser?.zone || 'ZA'
  const zoneWorkers = users.filter(u => u.role === 'worker' && u.zone === currentZone)

  const handleRegisterWorker = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorker.id || !newWorker.password || !newWorker.name || !newWorker.teamId) {
      toast({ title: "Error", description: "Worker ID, Name, Password and Team ID are required.", variant: "destructive" })
      return
    }

    if (users.find(u => u.id === newWorker.id)) {
      toast({ title: "Error", description: "User ID already exists.", variant: "destructive" })
      return
    }

    // Create User Account for Login
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

    // Initialize the Team record if it doesn't exist
    if (!teams.find(t => t.id === newWorker.teamId)) {
      addTeam({
        id: newWorker.teamId,
        zone: currentZone,
        name: newWorker.name,
        members: [],
        supervisorId: currentUser?.id || ''
      })
    }

    toast({ title: "Worker Registered", description: `Account ${newWorker.id} created for Team ${newWorker.teamId}.` })
    setNewWorker({ id: '', password: '', name: '', phone: '', address: '', teamId: '' })
    setIsRegisterOpen(false)
  }

  const handleUpdateWorker = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorker) return
    
    updateUser(selectedWorker.id, {
      name: selectedWorker.name,
      phone: selectedWorker.phone,
      address: selectedWorker.address
    })
    
    toast({ title: "Details Updated", description: "Worker and Area details saved successfully." })
    setIsManageMembersOpen(false)
  }

  const handleAddMember = () => {
    if (!selectedWorker?.teamId || !newMember.name || !newMember.workerId) {
      toast({ title: "Validation Error", description: "Member Name and ID are required.", variant: "destructive" })
      return
    }
    addTeamMember(selectedWorker.teamId, newMember)
    setNewMember({ workerId: '', name: '', age: 0, phone: '', address: '' })
    toast({ title: "Member Added", description: `${newMember.name} has been added to the roster.` })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Field Management</h1>
          <p className="text-white/40 font-medium">Assign Worker IDs, manage teams, and allocate areas for Zone {currentZone}</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-black">
              <UserPlus className="h-5 w-5" /> Register Worker Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-panel text-white rounded-[2.5rem] border-primary/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl text-primary">New Worker Registration</DialogTitle>
              <DialogDescription className="text-white/60">
                Create login credentials and assign an operational area for the team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterWorker} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">User ID (Login)</Label>
                  <Input id="id" placeholder="e.g. WRK-NORTH-01" value={newWorker.id} onChange={e => setNewWorker({...newWorker, id: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Login Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={newWorker.password} onChange={e => setNewWorker({...newWorker, password: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Display Name</Label>
                  <Input id="teamName" placeholder="e.g. North Alpha" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamId">Team ID (Code)</Label>
                  <Input id="teamId" placeholder="e.g. T1" value={newWorker.teamId} onChange={e => setNewWorker({...newWorker, teamId: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input id="phone" placeholder="98765 XXXXX" value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Assigned Area (e.g., Mattuthavani)</Label>
                <Input id="area" placeholder="Enter landmark or area name" value={newWorker.address} onChange={e => setNewWorker({...newWorker, address: e.target.value})} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold h-14 rounded-2xl bg-primary text-black">Create Field Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {zoneWorkers.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-panel border-2 border-dashed border-white/10 rounded-[3rem]">
            <HardHat className="h-16 w-16 mx-auto text-white/10 mb-4" />
            <p className="text-white/40 font-bold font-headline text-2xl">No field units registered in this zone.</p>
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
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase tracking-widest mt-1">Unit: {worker.teamId}</Badge>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/40 text-[10px]">{memberCount} Members</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{worker.address || 'Area Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{worker.phone || 'No Contact'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-white/40">
                      <UserCheck className="h-4 w-4" />
                      <span>ID: {worker.id}</span>
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
                    <Edit2 className="h-4 w-4 mr-2" /> Manage Team & Roster
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
            <DialogTitle className="font-headline text-4xl text-primary mt-4">Manage Unit: {selectedWorker?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full mt-4">
            <TabsList className="bg-white/5 p-1 h-12 rounded-2xl border border-white/10 mb-6">
              <TabsTrigger value="details" className="rounded-xl font-bold px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-black">Team Details</TabsTrigger>
              <TabsTrigger value="roster" className="rounded-xl font-bold px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-black">Personnel Roster</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleUpdateWorker} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest ml-2">Display Name</Label>
                    <Input 
                      value={selectedWorker?.name || ''} 
                      onChange={e => setSelectedWorker(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest ml-2">Assigned Operational Area</Label>
                    <Input 
                      value={selectedWorker?.address || ''} 
                      onChange={e => setSelectedWorker(prev => prev ? {...prev, address: e.target.value} : null)}
                      placeholder="e.g. Periyar Bus Stand"
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
                <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-primary text-black">
                  <Save className="h-5 w-5 mr-2" /> Save Updates
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="roster">
              <div className="space-y-8">
                {/* Add Member Form */}
                <div className="p-6 rounded-[2rem] bg-white/5 border border-primary/10">
                  <h4 className="font-headline font-bold text-lg mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Add New Member</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input placeholder="Full Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="h-10 text-xs" />
                    <Input placeholder="Member ID" value={newMember.workerId} onChange={e => setNewMember({...newMember, workerId: e.target.value})} className="h-10 text-xs" />
                    <Input placeholder="Phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="h-10 text-xs" />
                    <Button onClick={handleAddMember} className="h-10 font-bold bg-primary text-black">Add To Unit</Button>
                  </div>
                </div>

                {/* Member List */}
                <div className="space-y-3">
                   <h4 className="font-bold text-white/60 uppercase text-[10px] tracking-widest ml-2">Registered Personnel</h4>
                   {teams.find(t => t.id === selectedWorker?.teamId)?.members.length === 0 ? (
                     <p className="text-center py-10 text-white/20 italic">No members added to this unit yet.</p>
                   ) : (
                     teams.find(t => t.id === selectedWorker?.teamId)?.members.map((member, i) => (
                       <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black/30 border border-white/5 group transition-all hover:border-primary/20">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-primary/40" />
                            </div>
                            <div>
                              <p className="font-bold text-md text-white">{member.name}</p>
                              <p className="text-[10px] text-white/40">{member.workerId} • {member.phone || 'No Phone'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => removeTeamMember(selectedWorker?.teamId!, member.workerId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                       </div>
                     ))
                   )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
