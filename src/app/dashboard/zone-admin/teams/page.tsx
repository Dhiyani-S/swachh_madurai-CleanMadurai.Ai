
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Users, UserPlus, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ZoneAdminTeams() {
  const { users, currentUser } = useStore()
  const zoneTeams = users.filter(u => u.role === 'Worker' && u.zoneId === currentUser?.zoneId)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Team Management</h1>
          <p className="text-muted-foreground">Manage field staff and assignments for {currentUser?.zoneId}</p>
        </div>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Register New Team</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zoneTeams.map((team) => (
          <Card key={team.id} className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {team.teamNumber?.split('-')[1] || team.id.charAt(0)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Team ID: {team.teamNumber || team.id}</p>
                  <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3" /> {team.contactNumber || 'Contact not set'}</p>
                  <p className="text-sm flex items-center gap-2"><MapPin className="h-3 w-3" /> {team.address || 'Assigned to Zone'}</p>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-xs font-medium text-emerald-600 font-bold uppercase tracking-wider">Active Status</span>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
