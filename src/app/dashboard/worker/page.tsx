
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
import { useStore, MemberAttendance, TeamMember } from "@/lib/store"
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
  UserX,
  Phone,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { translations } from "@/lib/translations"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask, attendance, setAttendance, language, users } = useStore()
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
    if (mounted && !hasMarkedAttendance && currentUser?.teamRoster && currentUser.teamRoster.length > 0) {
      setAttendanceState(currentUser.teamRoster.map(m => ({ name: m.name, status: 'Present' })))
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Attendance Check Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 text-white rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2 text-2xl">
              <UserCheck className="h-6 w-6 text-primary" /> {t.attendanceCheck}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {t.attendanceDesc} ({today}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {attendanceState.map((member, idx) => (
              <div key={member.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Present" id={`p-${idx}`} className="border-emerald-500 text-emerald-500" />
                    <Label htmlFor={`p-${idx}`} className="text-xs cursor-pointer text-emerald-500">{t.present}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} className="border-rose-500 text-rose-500" />
                    <Label htmlFor={`a-${idx}`} className="text-xs cursor-pointer text-rose-500">{t.absent}</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
            {attendanceState.length === 0 && (
              <p className="text-center text-white/40 italic py-8">Your Zone Admin has not added any members to your roster yet.</p>
            )}
          </div>
          <DialogFooterUI>
            <Button className="w-full font-bold h-12 shadow-lg shadow-primary/30" onClick={handleAttendanceSubmit} disabled={attendanceState.length === 0}>
              {t.submitAttendance}
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center text-white font-headline text-3xl font-bold shadow-xl shadow-primary/40">
                {currentUser?.teamNumber?.split('-')[1]?.charAt(0) || currentUser?.id?.charAt(0) || '0'}
              </div>
              <div>
                <h1 className="text-3xl font-headline font-bold text-white">{currentUser?.teamNumber}</h1>
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-white/60 text-sm flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" /> {currentUser?.name} • {currentUser?.zoneId || 'Zone Area'}
                  </p>
                  {hasMarkedAttendance && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 w-fit">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.attendanceMarkedToday}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2 text-white">
              <Clock className="h-6 w-6 text-primary" /> {t.activeTasks}
            </h3>
            {assignedTasks.length === 0 ? (
              <div className="text-center py-20 bg-white/5 backdrop-blur-3xl rounded-[3rem] border-2 border-dashed border-white/10">
                <CheckCircle className="h-16 w-16 mx-auto text-white/10 mb-4" />
                <p className="text-white/40 font-headline font-bold">{t.allCaughtUp}</p>
              </div>
            ) : (
              assignedTasks.map((task) => (
                <Card key={task.id} className={cn(
                  "border-none shadow-2xl overflow-hidden transition-all bg-white/10 backdrop-blur-3xl rounded-[2.5rem]",
                  task.status === 'In Progress' ? "ring-2 ring-primary" : "",
                  task.status === 'Partially Completed' ? "ring-2 ring-amber-500" : ""
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl text-white">{task.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-white/60">
                          <MapPin className="h-4 w-4 text-primary" /> {task.location}
                        </CardDescription>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                        task.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        task.status === 'In Progress' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {task.status === 'Pending' ? t.pending : 
                         task.status === 'In Progress' ? t.inProgress : 
                         task.status === 'Completed' ? t.completed : task.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.status === 'Pending' && (
                      <div className="flex items-center justify-between text-xs text-rose-500 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/10 font-bold">
                        <div className="flex items-center gap-2">
                          <Timer className="h-5 w-5 animate-pulse" /> {t.mustRespondWithin}
                        </div>
                        <span className="font-mono text-lg">{timeLefts[task.id] || '--:--'}</span>
                      </div>
                    )}
                    {task.status === 'Partially Completed' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-amber-500 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                          <AlertCircle className="h-5 w-5" />
                          {t.pendingDisposalVerification}
                        </div>
                        <p className="text-xs text-white/40 px-1">
                          {language === 'ta' ? "பணியை இறுதி செய்ய கழிவு மேலாண்மை தளத்தில் QR-ஐ ஸ்கேன் செய்யவும்." : "Your team QR is now active for this task. Proceed to a nearby disposal terminal to finalize."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-4 bg-black/20 p-6">
                    {task.status === 'Pending' && (
                      <>
                        <Button onClick={() => handleTaskAction(task.id, 'Accept')} className="flex-1 bg-primary font-bold h-12 rounded-2xl shadow-lg shadow-primary/20">
                          <CheckCircle2 className="h-5 w-5 mr-2" /> {t.accept}
                        </Button>
                        <Button onClick={() => handleTaskAction(task.id, 'Reject')} variant="outline" className="flex-1 text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 font-bold h-12 rounded-2xl">
                          <XCircle className="h-5 w-5 mr-2" /> {t.reject}
                        </Button>
                      </>
                    )}
                    {task.status === 'In Progress' && (
                      <Button onClick={() => handleMarkAsFinished(task.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-2xl">
                        <CheckCircle2 className="h-5 w-5 mr-2" /> {t.markWorkFinished}
                      </Button>
                    )}
                    {task.status === 'Partially Completed' && (
                      <Dialog open={isQRModalOpen && selectedTaskId === task.id} onOpenChange={(open) => {
                        setIsQRModalOpen(open);
                        if (open) setSelectedTaskId(task.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/20">
                            <QrCode className="h-5 w-5 mr-2" /> {t.showVerificationQr}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-950/90 border-white/10 text-white rounded-[3rem] backdrop-blur-3xl">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                              <QrCode className="h-6 w-6 text-primary" /> {t.verificationQrTitle}
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                              {t.verificationQrDesc}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center gap-8 py-10">
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl">
                              <div className="w-56 h-56 bg-slate-50 flex items-center justify-center border-4 border-slate-100 rounded-2xl">
                                 <QrCode className="h-32 w-32 text-primary opacity-50" />
                              </div>
                            </div>
                            <Button 
                              onClick={() => simulateExternalScan(task.id)} 
                              variant="outline"
                              className="w-full h-12 font-bold border-white/10 hover:bg-white/5"
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

        <div className="space-y-8">
          <Card className="border-none bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="py-6 flex flex-row items-center justify-between border-b border-white/10 bg-white/5">
              <CardTitle className="text-lg font-headline font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Team Roster & Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {hasMarkedAttendance ? (
                <div className="space-y-3">
                  {currentTeamAttendance.members.map((member, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-[1.5rem] text-sm font-bold border flex items-center justify-between transition-all",
                      member.status === 'Present' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-60"
                    )}>
                      <div className="flex items-center gap-3">
                        {member.status === 'Present' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        <span className="font-headline">{member.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold">{member.status === 'Present' ? t.present : t.absent}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/10">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Status: {t.attendanceMarkedToday}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-8 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/20">
                    <AlertCircle className="h-10 w-10 mx-auto text-primary mb-3" />
                    <p className="text-sm font-medium text-white/80">{t.attendanceDesc}</p>
                    <Button 
                      className="mt-6 w-full font-bold h-11 shadow-lg shadow-primary/20" 
                      onClick={() => setIsAttendanceModalOpen(true)}
                      disabled={!currentUser?.teamRoster || currentUser.teamRoster.length === 0}
                    >
                      {t.submitNow}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">Team Members List</p>
                    {currentUser?.teamRoster?.map((member, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-sm text-white/80 font-medium">{member.name}</span>
                         </div>
                         <span className="text-[9px] text-white/40 font-bold uppercase">{member.age} Yrs</span>
                      </div>
                    )) || <p className="text-center text-xs text-white/20">No members registered.</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-primary shadow-2xl shadow-primary/30 rounded-[3rem] text-white">
            <CardHeader>
              <CardTitle className="text-xl font-headline font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-white" /> Performance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] text-center border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/80">Available Points</p>
                  <p className="text-5xl font-headline font-bold">{currentUser?.rewardPoints || 0}</p>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold px-2">
                     <span className="uppercase text-white/80">Goal Progress</span>
                     <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-white/20" />
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
