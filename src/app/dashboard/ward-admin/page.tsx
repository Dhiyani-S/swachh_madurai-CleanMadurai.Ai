
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  MapPin, 
  AlertTriangle, 
  Zap,
  Users,
  ClipboardCheck,
  UserPlus,
  ShieldCheck
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function WardAdminDashboard() {
  const { tasks, users, addUser, currentUser } = useStore()
  const { toast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [newZoneAdmin, setNewZoneAdmin] = React.useState({ id: '', password: '', name: '', zone: '' })

  React.useEffect(() => { setMounted(true) }, [])

  const handleCreateZoneAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newZoneAdmin.id || !newZoneAdmin.password || !newZoneAdmin.name || !newZoneAdmin.zone) {
      toast({ variant: 'destructive', title: "Error", description: "Fill all fields" })
      return
    }
    addUser({
      id: newZoneAdmin.id,
      name: newZoneAdmin.name,
      password: newZoneAdmin.password,
      role: 'zone_admin',
      zone: newZoneAdmin.zone,
      rewardPoints: 0,
      createdByAdmin: currentUser?.id
    })
    toast({ title: "Success", description: `Zone Admin account created for Zone ${newZoneAdmin.zone}.` })
    setNewZoneAdmin({ id: '', password: '', name: '', zone: '' })
  }

  if (!mounted) return null

  const zoneAdmins = users.filter(u => u.role === 'zone_admin')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">Ward Command Center</h1>
          <p className="text-white/40 flex items-center gap-1 font-medium"><MapPin className="h-3 w-3" /> Ward 14 - Anna Nagar Jurisdiction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40"><ClipboardCheck className="h-3 w-3" /> Efficiency</CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-white">72.9%</CardTitle>
          </CardHeader>
          <CardContent><Progress value={72.9} className="h-1.5 bg-white/5" /></CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40"><Users className="h-3 w-3" /> Zone Admins</CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-white">{zoneAdmins.length}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs font-bold text-primary">Managed by Ward Admin</p></CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40"><AlertTriangle className="h-3 w-3" /> Active Alerts</CardDescription>
            <CardTitle className="text-4xl font-headline font-bold text-rose-500">02</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold text-white">Register Zone Admin</CardTitle>
            <CardDescription>Authorize new administrators for specific zones.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateZoneAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Zone ID / Login ID</Label>
                <Input value={newZoneAdmin.id} onChange={e => setNewZoneAdmin({...newZoneAdmin, id: e.target.value})} className="h-12 rounded-xl" placeholder="ZONE-A-ADMIN" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</Label>
                  <Input value={newZoneAdmin.name} onChange={e => setNewZoneAdmin({...newZoneAdmin, name: e.target.value})} className="h-12 rounded-xl" placeholder="Admin Name" />
                </div>
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Password</Label>
                  <Input type="password" value={newZoneAdmin.password} onChange={e => setNewZoneAdmin({...newZoneAdmin, password: e.target.value})} className="h-12 rounded-xl" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Assigned Zone</Label>
                <Select value={newZoneAdmin.zone} onValueChange={val => setNewZoneAdmin({...newZoneAdmin, zone: val})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-xl">
                    <SelectItem value="ZA">Zone A (North)</SelectItem>
                    <SelectItem value="ZB">Zone B (South)</SelectItem>
                    <SelectItem value="ZC">Zone C (East)</SelectItem>
                    <SelectItem value="ZD">Zone D (West)</SelectItem>
                    <SelectItem value="ZE">Zone E (Central)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20">
                <UserPlus className="h-5 w-5 mr-2" /> Register Zone Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold text-white">Active Zone Roster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {zoneAdmins.length === 0 ? (
              <p className="text-center py-20 text-white/20 italic">No zone admins registered.</p>
            ) : (
              zoneAdmins.map((admin) => (
                <div key={admin.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="font-bold text-white text-lg">{admin.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Zone {admin.zone} — ID: {admin.id}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Operational</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
