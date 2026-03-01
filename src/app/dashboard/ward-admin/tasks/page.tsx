
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { ClipboardList, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function WardAdminTasks() {
  const { tasks } = useStore()
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Master Task Registry</h1>
          <p className="text-muted-foreground">Comprehensive log of all ward activities</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search tasks..." className="pl-9 w-64" />
           </div>
           <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Task ID</th>
                  <th className="px-6 py-4">Issue Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{task.id}</td>
                    <td className="px-6 py-4 font-bold">{task.name}</td>
                    <td className="px-6 py-4 text-sm">{task.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={task.status === 'Completed' ? 'Green' : task.status === 'In Progress' ? 'Yellow' : 'Red'} 
                        label={task.status} 
                      />
                    </td>
                    <td className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">{task.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
