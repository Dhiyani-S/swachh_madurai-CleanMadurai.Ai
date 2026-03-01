
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
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
  CheckCircle,
  Camera,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask } = useStore()
  const { toast } = useToast()
  const [scanningTaskId, setScanningTaskId] = React.useState<string | null>(null)
  const [isScannerOpen, setIsScannerOpen] = React.useState(false)

  const handleTaskAction = (taskId: string, action: 'Accept' | 'Reject') => {
    if (action === 'Accept') {
      updateTask(taskId, { status: 'In Progress', assignedTo: currentUser?.teamNumber })
      toast({
        title: "Task Accepted",
        description: "Proceed to the location to begin work.",
      })
    } else {
      updateTask(taskId, { status: 'Pending', assignedTo: undefined })
    }
  }

  const handlePartialComplete = (taskId: string) => {
    updateTask(taskId, { status: 'Partially Completed' })
    toast({
      title: "Task Partially Completed",
      description: "Work is done. Please scan the zone QR code to mark as fully completed.",
    })
  }

  const handleFullComplete = (taskId: string) => {
    updateTask(taskId, { status: 'Completed' })
    setIsScannerOpen(false)
    setScanningTaskId(null)
    toast({
      title: "Task Fully Completed",
      description: "Great job! Reward points have been added to your team.",
    })
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Card className="bg-secondary/50 border-none cursor-pointer hover:bg-secondary/70 transition-colors">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reward Points</p>
                <p className="text-xl font-headline font-bold text-primary flex items-center justify-center gap-1">
                  <Award className="h-5 w-5 text-amber-500" /> {currentUser?.rewardPoints || 0}
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Reward Breakdown
              </DialogTitle>
              <DialogDescription>
                Points earned for your team's consistent performance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm font-medium">On-time Completion</span>
                <span className="font-bold text-emerald-600">+300 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm font-medium">Positive Citizen Feedback</span>
                <span className="font-bold text-emerald-600">+120 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm font-medium">Daily Streak Bonus</span>
                <span className="font-bold text-emerald-600">+30 pts</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center px-1">
                <span className="font-bold">Total Points</span>
                <span className="text-xl font-headline font-bold text-primary">450 pts</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Tasks
        </h3>
        {tasks.filter(t => t.status !== 'Completed').length === 0 ? (
          <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground font-medium">All caught up! No active tasks.</p>
          </div>
        ) : (
          tasks.filter(t => t.status !== 'Completed').map((task) => (
            <Card key={task.id} className={cn(
              "border-none shadow-md overflow-hidden transition-all",
              task.status === 'In Progress' ? "ring-2 ring-primary" : "",
              task.status === 'Partially Completed' ? "ring-2 ring-amber-500" : ""
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
                    task.status === 'Pending' ? "bg-amber-100 text-amber-700" : 
                    task.status === 'In Progress' ? "bg-blue-100 text-blue-700" : 
                    "bg-amber-100 text-amber-700 border border-amber-300"
                  )}>
                    {task.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {task.status === 'Pending' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                    <Timer className="h-3 w-3" /> Must respond within 30 minutes
                  </div>
                )}
                {task.status === 'In Progress' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">Work is currently in progress. Proceed to the location and finish cleaning.</p>
                    <Progress value={45} className="h-1.5" />
                  </div>
                )}
                {task.status === 'Partially Completed' && (
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    Final step: Scan the location QR code to verify completion.
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2 bg-secondary/20 p-4">
                {task.status === 'Pending' && (
                  <>
                    <Button onClick={() => handleTaskAction(task.id, 'Accept')} className="flex-1 bg-primary font-bold gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Accept
                    </Button>
                    <Button onClick={() => handleTaskAction(task.id, 'Reject')} variant="outline" className="flex-1 text-destructive font-bold gap-2">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {task.status === 'In Progress' && (
                  <Button onClick={() => handlePartialComplete(task.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Mark Completed
                  </Button>
                )}
                {task.status === 'Partially Completed' && (
                  <Dialog open={isScannerOpen && scanningTaskId === task.id} onOpenChange={(open) => {
                    setIsScannerOpen(open);
                    if (open) setScanningTaskId(task.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2 animate-pulse">
                        <QrCode className="h-4 w-4" /> Scan QR to Finish
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-primary" /> QR Verification
                        </DialogTitle>
                        <DialogDescription>
                          Scan the code at <strong>{task.location}</strong> to finalize task completion.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center gap-6 py-8">
                        <div className="relative w-64 h-64 border-4 border-primary/20 rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                          <Camera className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors" />
                          <div className="absolute bottom-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Align code within frame
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleFullComplete(task.id)} 
                          className="w-full h-12 font-bold text-lg"
                        >
                          Simulate Successful Scan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  )
}
