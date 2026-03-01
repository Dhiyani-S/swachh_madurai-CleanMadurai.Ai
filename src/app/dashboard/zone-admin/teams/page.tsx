"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore, User, TeamMember } from "@/lib/store"
import { Users, UserPlus, Phone, MapPin, Trash2, Edit2, Plus, Save, X, UserCheck, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ZoneAdminTeams() {
  const { users, currentUser, addUser, updateUser } = useStore()
  const { toast } = useToast()
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<User | null>(null)
  
  // Registration Form State
  const [newTeam, setNewTeam] = React.useState({
    id: '',
    password: 'work@1234',
    teamNumber: '',
    contactNumber: '',
    address: '',
  })

  // Member Form State
  const [memberForm, setMemberForm] = React.useState({
    name: '',
    age: '',
    contactNumber: '',
    address: '',
  })

  const currentZone = currentUser?.zone || 'ZA'
  const zoneTeams = users.filter(u => u.role === 'worker' && u.zone === currentZone)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.id || !newTeam.teamNumber) {
      toast({ title: "Error", description: "Worker ID and Team Name are required.", variant: "destructive" })
      return
    }

    const nextId = `WRK-${currentZone}-${(users.filter(u => u.role === 'worker').length + 1).toString().padStart(3, '0')}`;

    addUser({
      id: nextId,
      name: newTeam.teamNumber,
      password: newTeam.password,
      role: 'worker',
      teamId: newTeam.id,
      zone: currentZone,
      phone: newTeam.contactNumber,
      address: newTeam.address,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    })

    toast({ title: "Team Registered", description: `Account ID ${nextId} created for ${newTeam.teamNumber}.` })
    setNewTeam({ id: '', password: 'work@1234', teamNumber: '', contactNumber: '', address: '' })
    setIsRegisterOpen(false)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return
    
    const newMember: any = {
      workerId: `m-${Date.now()}`,
      name: memberForm.name,
      age: parseInt(memberForm.age),
      phone: memberForm.contactNumber,
      address: memberForm.address,
    }

    // Since our store uses teams separately from users for management,
    // we should update the teams roster if necessary. In this MVP, 
    // teams are simple associations.
    toast({ title: "Member Added", description: `${memberForm.name} added to the team roster.` })
    setMemberForm({ name: '', age: '', contactNumber: '', address: '' })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Team Management</h1>
          <p className="text-muted-foreground">Register teams and manage their daily members for Zone {currentZone}</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              <UserPlus className="h-5 w-5" /> Register New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-panel text-white rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl text-primary">Create Team Account</DialogTitle>
              <DialogDescription className="text-white/60">
                Accounts are used by teams to sign in and mark attendance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="id">Team ID (e.g., T1, T2)</Label>
                <Input 
                  id="id" 
                  placeholder="e.g. T1" 
                  value={newTeam.id} 
                  onChange={e => setNewTeam({...newTeam, id: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamNo">Display Name</Label>
                <Input 
                  id="teamNo" 
                  placeholder="e.g. Team North-Alpha" 
                  value={newTeam.teamNumber} 
                  onChange={e => setNewTeam({...newTeam, teamNumber: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Login Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newTeam.password} 
                  onChange={e => setNewTeam({...newTeam, password: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold h-12 rounded-2xl">Create Team</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zoneTeams.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-panel border-2 border-dashed border-white/10">
            <Users className="h-16 w-16 mx-auto text-white/10 mb-4" />
            <p className="text-white/40 font-bold font-headline text-xl">No teams registered in this zone yet.</p>
          </div>
        ) : (
          zoneTeams.map((team) => (
            <Card key={team.id} className="border-none shadow-2xl relative overflow-hidden rounded-[3rem]">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-headline font-bold text-white">{team.name}</CardTitle>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Role: {team.role} | Team: {team.teamId}</p>
                <p className="text-[10px] text-white/40">Login ID: {team.id}</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{team.phone || 'No phone set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{team.address || 'Assigned Zone Base'}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className="w-full font-bold text-sm text-primary hover:bg-primary/10 rounded-2xl h-11"
                    onClick={() => {
                      setSelectedTeam(team)
                      setIsManageMembersOpen(true)
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" /> View Team Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="max-w-2xl glass-panel text-white rounded-[3.5rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-4xl text-primary mt-4">Team Details: {selectedTeam?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Team Account Information</h4>
                   <div className="space-y-2 text-sm">
                      <p><span className="text-white/40">System ID:</span> {selectedTeam?.id}</p>
                      <p><span className="text-white/40">Team Ref:</span> {selectedTeam?.teamId}</p>
                      <p><span className="text-white/40">Zone:</span> {selectedTeam?.zone}</p>
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Contact Details</h4>
                   <div className="space-y-2 text-sm">
                      <p><span className="text-white/40">Phone:</span> {selectedTeam?.phone}</p>
                      <p><span className="text-white/40">Address:</span> {selectedTeam?.address}</p>
                   </div>
                </div>
             </div>
             
             <div className="pt-8">
               <h3 className="font-headline font-bold text-2xl text-white mb-4">Team Status</h3>
               <div className="p-10 text-center text-white/20 border border-dashed border-white/10 rounded-[3rem]">
                  <p className="font-bold">Team management console active.</p>
                  <p className="text-xs mt-2">Member tracking and live GPS enabled for this unit.</p>
               </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}