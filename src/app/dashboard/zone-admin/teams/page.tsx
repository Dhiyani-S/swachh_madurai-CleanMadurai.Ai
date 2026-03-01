
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
    password: '123',
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

  const currentZone = currentUser?.zoneId || 'ZA - Zone A (North)'
  const zoneTeams = users.filter(u => u.role === 'Worker' && u.zoneId === currentZone)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.id || !newTeam.teamNumber) {
      toast({ title: "Error", description: "Worker ID and Team Number are required.", variant: "destructive" })
      return
    }

    addUser({
      id: newTeam.id,
      name: `Team Leader ${newTeam.id}`,
      password: newTeam.password,
      role: 'Worker',
      teamNumber: newTeam.teamNumber,
      zoneId: currentZone,
      contactNumber: newTeam.contactNumber,
      address: newTeam.address,
      rewardPoints: 0,
      teamRoster: []
    })

    toast({ title: "Team Registered", description: `Worker ID ${newTeam.id} created for ${newTeam.teamNumber}.` })
    setNewTeam({ id: '', password: '123', teamNumber: '', contactNumber: '', address: '' })
    setIsRegisterOpen(false)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: memberForm.name,
      age: parseInt(memberForm.age),
      contactNumber: memberForm.contactNumber,
      address: memberForm.address,
    }

    const updatedRoster = [...(selectedTeam.teamRoster || []), newMember]
    updateUser(selectedTeam.id, { teamRoster: updatedRoster })
    
    // Refresh selected team to reflect changes
    const updatedTeam = users.find(u => u.id === selectedTeam.id)
    if (updatedTeam) setSelectedTeam({ ...updatedTeam, teamRoster: updatedRoster })

    toast({ title: "Member Added", description: `${memberForm.name} added to the team roster.` })
    setMemberForm({ name: '', age: '', contactNumber: '', address: '' })
  }

  const removeMember = (teamId: string, memberId: string) => {
    const team = users.find(u => u.id === teamId)
    if (!team) return
    const updatedRoster = (team.teamRoster || []).filter(m => m.id !== memberId)
    updateUser(teamId, { teamRoster: updatedRoster })
    
    if (selectedTeam?.id === teamId) {
      setSelectedTeam({ ...team, teamRoster: updatedRoster })
    }
    
    toast({ title: "Member Removed" })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Team & Roster Management</h1>
          <p className="text-muted-foreground">Register workers and manage their daily team members for {currentZone}</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              <UserPlus className="h-5 w-5" /> Register Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create Worker Account</DialogTitle>
              <DialogDescription className="text-white/60">
                This account will be used by the Team Leader to sign in and mark attendance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="id">Worker User ID</Label>
                <Input 
                  id="id" 
                  placeholder="e.g. wkr-001" 
                  className="bg-white/5 border-white/10 text-white"
                  value={newTeam.id} 
                  onChange={e => setNewTeam({...newTeam, id: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Login Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-white/5 border-white/10 text-white"
                  value={newTeam.password} 
                  onChange={e => setNewTeam({...newTeam, password: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamNo">Team Designation</Label>
                <Input 
                  id="teamNo" 
                  placeholder="e.g. Team North-A1" 
                  className="bg-white/5 border-white/10 text-white"
                  value={newTeam.teamNumber} 
                  onChange={e => setNewTeam({...newTeam, teamNumber: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Primary Contact</Label>
                <Input 
                  id="contact" 
                  placeholder="Mobile number" 
                  className="bg-white/5 border-white/10 text-white"
                  value={newTeam.contactNumber} 
                  onChange={e => setNewTeam({...newTeam, contactNumber: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold h-12">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zoneTeams.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-black/40 backdrop-blur-3xl rounded-[3rem] border-2 border-dashed border-white/10">
            <Users className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <p className="text-white/40 font-medium font-headline">No teams registered in this zone yet.</p>
          </div>
        ) : (
          zoneTeams.map((team) => (
            <Card key={team.id} className="border-none shadow-2xl hover:shadow-[0_0_60px_rgba(255,165,0,0.2)] transition-all bg-white/10 backdrop-blur-3xl group relative overflow-hidden rounded-[2.5rem]">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-white">{team.teamNumber}</CardTitle>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Worker ID: {team.id}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {team.teamRoster?.length || 0} Members
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{team.contactNumber || 'No contact set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{team.address || 'Assigned Zone Base'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className="w-full font-bold text-sm text-primary hover:bg-primary/10"
                    onClick={() => {
                      setSelectedTeam(team)
                      setIsManageMembersOpen(true)
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" /> Manage Team Roster
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manage Members Modal */}
      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="max-w-4xl bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white max-h-[90vh] overflow-y-auto rounded-[3rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">Team Roster: {selectedTeam?.teamNumber}</DialogTitle>
            <DialogDescription className="text-white/60">
              Manage members associated with this worker account. These members will appear for daily attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 border shadow-none rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-lg font-headline text-white">Add New Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="Member name" 
                        className="bg-white/10 border-white/5 text-white"
                        value={memberForm.name}
                        onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Age</Label>
                        <Input 
                          type="number" 
                          placeholder="Age" 
                          className="bg-white/10 border-white/5 text-white"
                          value={memberForm.age}
                          onChange={e => setMemberForm({...memberForm, age: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Contact</Label>
                        <Input 
                          placeholder="Phone" 
                          className="bg-white/10 border-white/5 text-white"
                          value={memberForm.contactNumber}
                          onChange={e => setMemberForm({...memberForm, contactNumber: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Address</Label>
                      <Input 
                        placeholder="Residential address" 
                        className="bg-white/10 border-white/5 text-white"
                        value={memberForm.address}
                        onChange={e => setMemberForm({...memberForm, address: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold h-11">
                      <Plus className="h-4 w-4 mr-2" /> Add to Roster
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-headline font-bold text-xl text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Current Members
              </h3>
              <div className="space-y-3">
                {selectedTeam?.teamRoster && selectedTeam.teamRoster.length > 0 ? (
                  selectedTeam.teamRoster.map((member) => (
                    <div key={member.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">{member.age} Yrs • {member.contactNumber || 'No Phone'}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white/20 hover:text-rose-500 hover:bg-rose-500/10"
                        onClick={() => removeMember(selectedTeam.id, member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-white/20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    No members added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
