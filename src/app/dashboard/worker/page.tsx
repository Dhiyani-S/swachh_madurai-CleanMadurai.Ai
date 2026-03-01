
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useStore } from "@/lib/store"
import { 
  Award, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Clock, 
  Users,
  Timer,
  Scan
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask } = useStore()
  const [activeTask, setActiveTask] = React.useState<any>(null)

  const handleTaskAction = (taskId: string, action: 'Accept' | 'Reject') => {
    if (action === 'Accept') {
      updateTask(taskId, { status: 'In Progress', assignedTo: currentUser?.teamNumber })
      setActiveTask(tasks.find(t => t.id === taskId))
    } else {
      updateTask(taskId, { status: 'Pending', assignedTo: undefined })
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-headline text-2xl font-bold">
            {currentUser?.teamNumber?.split(' ')[1] || '0'}
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">{currentUser?.name}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Users className="h-3 w-3" /> {currentUser?.teamNumber} • {currentUser?.zoneId || 'Zone 4'}
            </p>
          </div>
        </div>
        <Card className="bg-secondary/50 border-none">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Reward Points</p>
            <p className="text-xl font-headline font-bold text-primary flex items-center gap-1">
              <Award className="h-5 w-5 text-amber-500" /> {currentUser?.rewardPoints || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground text-center">
          <CardHeader className="p-4 pb-2">
            <QrCode className="h-8 w-8 mx-auto mb-1" />
            <CardTitle className="text-sm">Team QR</CardTitle>
          </CardHeader>
          <CardFooter className="p-4 pt-0 justify-center">
            <Button variant="secondary" size="sm" className="w-full text-xs font-bold">Display Code</Button>
          </CardFooter>
        </Card>
        <Card className="border-none shadow-sm bg-accent text-accent-foreground text-center">
          <CardHeader className="p-4 pb-2">
            <Scan className="h-8 w-8 mx-auto mb-1" />
            <CardTitle className="text-sm">Scan Disposal</CardTitle>
          </CardHeader>
          <CardFooter className="p-4 pt-0 justify-center">
            <Button variant="secondary" size="sm" className="w-full text-xs font-bold">Open Camera</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Active Assignments
        </h3>
        {tasks.filter(t => t.status !== 'Completed').map((task) => (
          <Card key={task.id} className={cn(
            "border-none shadow-md overflow-hidden transition-all",
            task.status === 'In Progress' ? "ring-2 ring-primary" : ""
          )}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline">{task.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {task.location}
                  </CardDescription>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                  task.status === 'Pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {task.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {task.status === 'Pending' ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                  <Timer className="h-3 w-3" /> Must respond within 30 minutes
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground italic">Work is currently in progress. Proceed to the location and finish cleaning.</p>
                  <Progress value={45} className="h-1.5" />
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-2 bg-secondary/20 p-4">
              {task.status === 'Pending' ? (
                <>
                  <Button onClick={() => handleTaskAction(task.id, 'Accept')} className="flex-1 bg-primary font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Accept
                  </Button>
                  <Button onClick={() => handleTaskAction(task.id, 'Reject')} variant="outline" className="flex-1 text-destructive font-bold gap-2">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </>
              ) : (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                  <Scan className="h-4 w-4" /> Finish & Scan QR
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
