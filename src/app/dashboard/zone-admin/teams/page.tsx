
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore, User } from "@/lib/store"
import { Users, UserPlus, Phone, MapPin, Trash2, Edit2, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ZoneAdminTeams() {
  const { users, currentUser, addUser, updateUser } = useStore()
  const { toast } = useToast()
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  
  // Registration Form State
  const [newTeam, setNewTeam] = React.useState({
    name: '',
    teamNumber: '',
    password: '123',
    contactNumber: '',
    address: '',
  })

  // Edit State
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null)

  const currentZone = currentUser?.zoneId || 'ZA - Zone A (North)'
  const zoneTeams = users.filter(u => u.role === 'Worker' && u.zoneId === currentZone)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.name || !newTeam.teamNumber) {
      toast({ title: "Error", description: "Team name and number are required.", variant: "destructive" })
      return
    }

    const workerId = `worker-${Date.now()}`
    addUser({
      id: workerId,
      name: newTeam.name,
      password: newTeam.password,
      role: 'Worker',
      teamNumber: newTeam.teamNumber,
      zoneId: currentZone,
      contactNumber: newTeam.contactNumber,
      address: newTeam.address,
      rewardPoints: 0,
      teamMembers: []
    })

    toast({ title: "Team Registered", description: `${newTeam.teamNumber} has been added to ${currentZone}.` })
    setNewTeam({ name: '', teamNumber: '', password: '123', contactNumber: '', address: '' })
    setIsRegisterOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Team Management</h1>
          <p className="text-muted-foreground">Manage field staff and assignments for {currentZone}</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold h-11 bg-primary hover:bg-primary/90">
              <UserPlus className="h-5 w-5" /> Register New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Register New field Team</DialogTitle>
              <DialogDescription>
                Create a new field team account. They will use the ID and Password to sign in.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Leader Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Ramesh Kumar" 
                  value={newTeam.name} 
                  onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamNo">Team Identification (Team ID)</Label>
                <Input 
                  id="teamNo" 
                  placeholder="e.g. Team ZA-12" 
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
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input 
                  id="contact" 
                  placeholder="10-digit mobile" 
                  value={newTeam.contactNumber} 
                  onChange={e => setNewTeam({...newTeam, contactNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Base Station / Area</Label>
                <Input 
                  id="address" 
                  placeholder="e.g. North Ward Office" 
                  value={newTeam.address} 
                  onChange={e => setNewTeam({...newTeam, address: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold h-12">Create Team Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zoneTeams.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-secondary/20 rounded-3xl border-2 border-dashed">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">No teams registered in this zone yet.</p>
          </div>
        ) : (
          zoneTeams.map((team) => (
            <Card key={team.id} className="border-none shadow-md hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{team.teamNumber}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner">
                  {team.teamNumber?.split('-')[1] || team.id.slice(-2)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-slate-700">{team.contactNumber || 'No contact set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-slate-700 truncate">{team.address || 'Zone Base'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Active Field Unit</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-primary hover:bg-primary/5">
                    View Full Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
