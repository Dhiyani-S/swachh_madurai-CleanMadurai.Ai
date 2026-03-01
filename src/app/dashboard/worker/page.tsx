
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
import { translations } from "@/lib/translations"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask, attendance, setAttendance, language } = useStore()
  const { toast } = useToast()
  const t = translations[language || 'en'];
  
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false)
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false)
  const [attendanceState, setAttendanceState] = React.useState<MemberAttendance[]>([])
  const [mounted, setMounted] = React.useState(false)
  const [timeLefts, setTimeLefts] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const today = React.useMemo(() => new Date().toLocaleDateString(), [])
  
  const currentTeamAttendance = currentUser?.id ? attendance[currentUser.id] : null
  const hasMarkedAttendance = currentTeamAttendance?.date === today

  const assignedTasks = tasks.filter(t => 
    t.assignedTo === currentUser?.id && t.status !== 'Completed'
  )

  // Timer Update Loop for assigned tasks
  React.useEffect(() => {
    if (!mounted) return;

    const updateTimers = () => {
      const now = new Date();
      const newTimeLefts: Record<string, string> = {};

      assignedTasks.forEach(task => {
        if (task.status === 'Pending' && task.assignedAt) {
          const assignedTime = new Date(task.assignedAt);
          const diff = now.getTime() - assignedTime.getTime();
          const remainingMs = Math.max(0, (30 * 60 * 1000) - diff);
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          newTimeLefts[task.id] = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      });
      setTimeLefts(newTimeLefts);
    };

    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [mounted, assignedTasks]);

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
        title: language === 'ta' ? "வருகை பதிவு செய்யப்பட்டது" : "Attendance Marked",
        description: language === 'ta' ? "இன்றைய குழு நிலை மண்டல நிர்வாகியுடன் பகிரப்பட்டது." : "Today's team status has been shared with the Zone Admin.",
      })
    }
  }

  const handleTaskAction = (taskId: string, action: 'Accept' | 'Reject') => {
    if (action === 'Accept') {
      updateTask(taskId, { status: 'In Progress' })
      toast({
        title: language === 'ta' ? "பணி ஏற்கப்பட்டது" : "Task Accepted",
        description: language === 'ta' ? "பணியைத் தொடங்க அந்த இடத்திற்குச் செல்லுங்கள்." : "Proceed to the location to begin work.",
      })
    } else {
      updateTask(taskId, { status: 'Pending', assignedTo: undefined })
      toast({
        title: language === 'ta' ? "பணி நிராகரிக்கப்பட்டது" : "Task Rejected",
        description: language === 'ta' ? "பணி மற்ற குழுக்களுக்கு விடுவிக்கப்பட்டது." : "The task has been released for other teams.",
      })
    }
  }

  const handleMarkAsFinished = (taskId: string) => {
    updateTask(taskId, { status: 'Partially Completed' })
    toast({
      title: language === 'ta' ? "வேலை பதிவு செய்யப்பட்டது" : "Work Recorded",
      description: language === 'ta' ? "கடைசி சரிபார்ப்பிற்கு உங்கள் குழு QR-ஐ கழிவுத் தளத்தில் காண்பிக்கவும்." : "Work marked as finished. Please show your team QR at the disposal site for final verification.",
    })
  }

  const simulateExternalScan = (taskId: string) => {
    updateTask(taskId, { status: 'Completed' })
    setIsQRModalOpen(false)
    setSelectedTaskId(null)
    toast({
      title: language === 'ta' ? "சரிபார்ப்பு வெற்றிகரமாக முடிந்தது" : "Verification Successful",
      description: language === 'ta' ? "கழிவுத் தளம் உங்கள் குழுவை உறுதி செய்தது. பணி முடிந்தது!" : "Disposal site scanner verified your team. Task fully completed!",
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
              <UserCheck className="h-5 w-5 text-primary" /> {t.attendanceCheck}
            </DialogTitle>
            <DialogDescription>
              {t.attendanceDesc} ({today}).
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
                    <Label htmlFor={`p-${idx}`} className="text-xs cursor-pointer">{t.present}</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} />
                    <Label htmlFor={`a-${idx}`} className="text-xs cursor-pointer text-destructive">{t.absent}</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <DialogFooterUI>
            <Button className="w-full font-bold" onClick={handleAttendanceSubmit}>
              {t.submitAttendance}
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
                    <span className="text-[10px] font-bold uppercase tracking-tight">{t.attendanceMarkedToday}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="bg-secondary/50 border-none cursor-pointer hover:bg-secondary/70 transition-colors">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.rewardPointsUpper}</p>
                  <p className="text-xl font-headline font-bold text-primary flex items-center justify-center gap-1">
                    <Award className="h-5 w-5 text-amber-500" /> {currentUser?.rewardPoints || 0}
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" /> {t.rewardBreakdown}
                </DialogTitle>
                <DialogDescription>
                  {t.pointsEarnedInfo}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm font-medium">{t.completed}</span>
                  <span className="font-bold text-emerald-600">+100 pts</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center px-1">
                  <span className="font-bold">{t.totalPoints}</span>
                  <span className="text-xl font-headline font-bold text-primary">{currentUser?.rewardPoints || 0} pts</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none bg-secondary/20 shadow-sm">
          <CardHeader className="py-4 flex flex-row items-center justify-between border-b bg-secondary/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {t.teamMembersAttendance}
            </CardTitle>
            {hasMarkedAttendance ? (
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                 {t.updatedToday}
               </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsAttendanceModalOpen(true)} className="h-7 text-[10px] font-bold bg-white">
                {t.submitNow}
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
                    <span className="text-[9px] uppercase tracking-wider">{member.status === 'Present' ? t.present : t.absent}</span>
                  </div>
                ))
              ) : currentUser?.teamMembers?.map((member, i) => (
                <div key={i} className="px-3 py-2 bg-white rounded-xl text-xs font-bold border shadow-sm opacity-50 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
                  {member} ({t.pending})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> {t.activeTasks}
        </h3>
        {assignedTasks.length === 0 ? (
          <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground font-medium">{t.allCaughtUp}</p>
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
                    {task.status === 'Pending' ? t.pending : 
                     task.status === 'In Progress' ? t.inProgress : 
                     task.status === 'Completed' ? t.completed : task.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {task.status === 'Pending' && (
                  <div className="flex items-center justify-between text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 font-bold">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 animate-pulse" /> {t.mustRespondWithin}
                    </div>
                    <span className="font-mono text-sm">{timeLefts[task.id] || '--:--'}</span>
                  </div>
                )}
                {task.status === 'Partially Completed' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      {t.pendingDisposalVerification}
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                      {language === 'ta' ? "பணியை இறுதி செய்ய கழிவு மேலாண்மை தளத்தில் QR-ஐ ஸ்கேன் செய்யவும்." : "Your team QR is now active for this task. Proceed to a nearby disposal terminal to finalize."}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2 bg-secondary/20 p-4">
                {task.status === 'Pending' && (
                  <>
                    <Button onClick={() => handleTaskAction(task.id, 'Accept')} className="flex-1 bg-primary font-bold gap-2">
                      <CheckCircle2 className="h-4 w-4" /> {t.accept}
                    </Button>
                    <Button onClick={() => handleTaskAction(task.id, 'Reject')} variant="outline" className="flex-1 text-destructive font-bold gap-2">
                      <XCircle className="h-4 w-4" /> {t.reject}
                    </Button>
                  </>
                )}
                {task.status === 'In Progress' && (
                  <Button onClick={() => handleMarkAsFinished(task.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {t.markWorkFinished}
                  </Button>
                )}
                {task.status === 'Partially Completed' && (
                  <Dialog open={isQRModalOpen && selectedTaskId === task.id} onOpenChange={(open) => {
                    setIsQRModalOpen(open);
                    if (open) setSelectedTaskId(task.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                        <QrCode className="h-4 w-4" /> {t.showVerificationQr}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-primary" /> {t.verificationQrTitle}
                        </DialogTitle>
                        <DialogDescription>
                          {t.verificationQrDesc}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center gap-6 py-8">
                        <div className="p-4 bg-white rounded-2xl border shadow-inner">
                          <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                             <QrCode className="h-24 w-24 text-primary opacity-50" />
                          </div>
                        </div>
                        <Button 
                          onClick={() => simulateExternalScan(task.id)} 
                          variant="outline"
                          className="w-full h-10 text-xs font-bold"
                        >
                          {t.simulateScan}
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
