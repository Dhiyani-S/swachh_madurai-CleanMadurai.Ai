
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Clock, History, MapPin } from "lucide-react"

export default function CitizenHistory() {
  const { tasks, currentUser } = useStore()
  const myReports = tasks.filter(t => t.citizenId === currentUser?.id)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Your Reports History</h1>
        <p className="text-muted-foreground">Track the status of your past cleanliness complaints</p>
      </div>

      <div className="space-y-4">
        {myReports.length === 0 ? (
          <Card className="border-none shadow-md bg-secondary/20 border-dashed border-2">
            <CardContent className="py-20 text-center space-y-4">
              <History className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">You haven't submitted any reports yet.</p>
            </CardContent>
          </Card>
        ) : (
          myReports.map((report) => (
            <Card key={report.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{report.name}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {report.location}
                    </p>
                  </div>
                  <StatusBadge 
                    status={report.status === 'Completed' ? 'Green' : report.status === 'In Progress' ? 'Yellow' : 'Red'} 
                    label={report.status} 
                  />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Clock className="h-3 w-3" /> Reported on: {new Date(report.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs font-bold text-primary">
                  {report.status === 'Completed' ? '✓ Resolved' : 'Processing...'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
