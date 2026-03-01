
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter as DialogFooterUI
} from "@/components/ui/dialog"
import { useStore, MemberAttendance } from "@/lib/store"
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
  AlertCircle,
  Info,
  UserCheck,
  UserX
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask, attendance, setAttendance } = useStore()
  const { toast } = useToast()
  
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false)
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false)
  const [attendanceState, setAttendanceState] = React.useState<MemberAttendance[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const today = React.useMemo(() => new Date().toLocaleDateString(), [])
  
  // Use currentUser.id as the attendance key for consistency
  const currentTeamAttendance = currentUser?.id ? attendance[currentUser.id] : null
  const hasMarkedAttendance = currentTeamAttendance?.date === today

  // Filter tasks assigned to this team that are not yet fully completed
  const assignedTasks = tasks.filter(t => 
    t.assignedTo === currentUser?.id && t.status !== 'Completed'
  )

  React.useEffect(() => {
    if (mounted && !hasMarkedAttendance && currentUser?.teamMembers) {
      setAttendanceState(currentUser.teamMembers.map(m => ({ name: m, status: 'Present' })))
      setIsAttendanceModalOpen(true)
    }
  }, [mounted, hasMarkedAttendance, currentUser])

  const handleAttendanceSubmit = () => {
    if (currentUser?.id) {
      setAttendance(currentUser.id, attendanceState)
      setIsAttendanceModalOpen(false)
      toast({
        title: "Attendance Marked",
        description: "Today's team status has been shared with the Zone Admin.",
      })
    }
  }

  const handleTaskAction = (taskId: string, action: 'Accept' | 'Reject') => {
    if (action === 'Accept') {
      updateTask(taskId, { status: 'In Progress' })
      toast({
        title: "Task Accepted",
        description: "Proceed to the location to begin work.",
      })
    } else {
      updateTask(taskId, { status: 'Pending', assignedTo: undefined })
      toast({
        title: "Task Rejected",
        description: "The task has been released for other teams.",
      })
    }
  }

  const handleMarkAsFinished = (taskId: string) => {
    updateTask(taskId, { status: 'Partially Completed' })
    toast({
      title: "Work Recorded",
      description: "Work marked as finished. Please show your team QR at the disposal site for final verification.",
    })
  }

  const simulateExternalScan = (taskId: string) => {
    updateTask(taskId, { status: 'Completed' })
    setIsQRModalOpen(false)
    setSelectedTaskId(null)
    toast({
      title: "Verification Successful",
      description: "Disposal site scanner verified your team. Task fully completed!",
    })
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Attendance Check Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Daily Attendance Check
            </DialogTitle>
            <DialogDescription>
              Please mark the attendance for all team members before starting work today ({today}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {attendanceState.map((member, idx) => (
              <div key={member.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="font-medium text-sm">{member.name}</span>
                <RadioGroup 
                  defaultValue="Present" 
                  className="flex gap-4"
                  onValueChange={(val) => {
                    const newAttendance = [...attendanceState]
                    newAttendance[idx].status = val as 'Present' | 'Absent'
                    setAttendanceState(newAttendance)
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Present" id={`p-${idx}`} />
                    <Label htmlFor={`p-${idx}`} className="text-xs cursor-pointer">Present</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} />
                    <Label htmlFor={`a-${idx}`} className="text-xs cursor-pointer text-destructive">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <DialogFooterUI>
            <Button className="w-full font-bold" onClick={handleAttendanceSubmit}>
              Submit Attendance
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-headline text-2xl font-bold">
              {currentUser?.teamNumber?.split(' ')[1]?.charAt(0) || currentUser?.id?.charAt(0) || '0'}
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold">{currentUser?.name}</h1>
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Users className="h-3 w-3" /> {currentUser?.teamNumber || `Worker ${currentUser?.id}`} • {currentUser?.zoneId || 'Zone 4'}
                </p>
                {hasMarkedAttendance && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md w-fit">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Attendance marked for today</span>
                  </div>
                )}
              </div>
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
                  <span className="text-xl font-headline font-bold text-primary">{currentUser?.rewardPoints || 0} pts</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none bg-secondary/20 shadow-sm">
          <CardHeader className="py-4 flex flex-row items-center justify-between border-b bg-secondary/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Team Members & Attendance
            </CardTitle>
            {hasMarkedAttendance ? (
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                 Updated Today
               </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsAttendanceModalOpen(true)} className="h-7 text-[10px] font-bold bg-white">
                Submit Now
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-2">
              {hasMarkedAttendance ? (
                currentTeamAttendance.members.map((member, i) => (
                  <div key={i} className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold border shadow-sm flex items-center justify-between",
                    member.status === 'Present' ? "bg-white text-emerald-700 border-emerald-100" : "bg-white text-rose-700 border-rose-100 opacity-60"
                  )}>
                    <div className="flex items-center gap-2">
                      {member.status === 'Present' ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                      {member.name}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider">{member.status}</span>
                  </div>
                ))
              ) : currentUser?.teamMembers?.map((member, i) => (
                <div key={i} className="px-3 py-2 bg-white rounded-xl text-xs font-bold border shadow-sm opacity-50 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
                  {member} (Pending)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Active Tasks
        </h3>
        {assignedTasks.length === 0 ? (
          <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground font-medium">All caught up! No active tasks assigned to you.</p>
          </div>
        ) : (
          assignedTasks.map((task) => (
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      Pending Disposal Verification
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                      Your team QR is now active for this task. Proceed to a nearby disposal terminal to finalize.
                    </p>
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
                  <Button onClick={() => handleMarkAsFinished(task.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Mark Work Finished
                  </Button>
                )}
                {task.status === 'Partially Completed' && (
                  <Dialog open={isQRModalOpen && selectedTaskId === task.id} onOpenChange={(open) => {
                    setIsQRModalOpen(open);
                    if (open) setSelectedTaskId(task.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                        <QrCode className="h-4 w-4" /> Show Verification QR
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-primary" /> Team Verification QR
                        </DialogTitle>
                        <DialogDescription>
                          Scan this at the official disposal site terminal to confirm completion.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center gap-6 py-8">
                        <div className="p-4 bg-white rounded-2xl border shadow-inner">
                          <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                             <QrCode className="h-24 w-24 text-primary opacity-50" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Team ID: {currentUser?.teamNumber || currentUser?.id}</p>
                          <p className="text-[10px] text-muted-foreground italic flex items-center justify-center gap-1">
                            <Info className="h-3 w-3" /> External scan will trigger full completion
                          </p>
                        </div>
                        <Button 
                          onClick={() => simulateExternalScan(task.id)} 
                          variant="outline"
                          className="w-full h-10 text-xs font-bold"
                        >
                          Simulate Terminal Scan (Prototype only)
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
    </div>
  )
}
