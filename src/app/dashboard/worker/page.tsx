
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

  // Handle Attendance Modal on Mount
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
        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 text-white rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2 text-2xl">
              <UserCheck className="h-6 w-6 text-primary" /> {t.attendanceCheck}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {t.attendanceDesc} ({today}). This status is managed by your profile and Zone Admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
            {attendanceState.map((member, idx) => (
              <div key={member.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-sm">{member.name}</span>
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
                    <Label htmlFor={`p-${idx}`} className="text-xs cursor-pointer text-emerald-500 font-bold">{t.present}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} className="border-rose-500 text-rose-500" />
                    <Label htmlFor={`a-${idx}`} className="text-xs cursor-pointer text-rose-500 font-bold">{t.absent}</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
            {attendanceState.length === 0 && (
              <div className="text-center py-8">
                 <AlertCircle className="h-10 w-10 mx-auto text-white/20 mb-3" />
                 <p className="text-white/40 italic text-sm">Your Zone Admin has not registered any team members for your squad yet.</p>
              </div>
            )}
          </div>
          <DialogFooterUI>
            <Button className="w-full font-bold h-12 shadow-lg shadow-primary/30 rounded-2xl" onClick={handleAttendanceSubmit} disabled={attendanceState.length === 0}>
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
                  <p className="text-white/60 text-sm flex items-center gap-2 font-medium">
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
                <p className="text-white/40 font-headline font-bold text-lg">{t.allCaughtUp}</p>
              </div>
            ) : (
              assignedTasks.map((task) => (
                <Card key={task.id} className={cn(
                  "border-none shadow-2xl overflow-hidden transition-all bg-white/10 backdrop-blur-3xl rounded-[2.5rem]",
                  task.status === 'In Progress' ? "ring-2 ring-primary" : "",
                  task.status === 'Partially Completed' ? "ring-2 ring-amber-500" : ""
                )}>
                  <CardHeader className="pb-2 px-8 pt-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl text-white">{task.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 text-white/60 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-primary" /> {task.location}
                        </CardDescription>
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border",
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
                  <CardContent className="px-8 py-6">
                    {task.status === 'Pending' && (
                      <div className="flex items-center justify-between text-xs text-rose-500 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 font-bold">
                        <div className="flex items-center gap-3">
                          <Timer className="h-6 w-6 animate-pulse" /> {t.mustRespondWithin}
                        </div>
                        <span className="font-mono text-2xl tracking-tighter">{timeLefts[task.id] || '--:--'}</span>
                      </div>
                    )}
                    {task.status === 'Partially Completed' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm font-bold text-amber-500 bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10">
                          <AlertCircle className="h-6 w-6" />
                          {t.pendingDisposalVerification}
                        </div>
                        <p className="text-xs text-white/40 px-2 leading-relaxed">
                          {language === 'ta' ? "பணியை இறுதி செய்ய கழிவு மேலாண்மை தளத்தில் QR-ஐ ஸ்கேன் செய்யவும்." : "Your team QR is now active for this task. Proceed to a nearby disposal terminal to finalize."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-4 bg-black/20 p-8">
                    {task.status === 'Pending' && (
                      <>
                        <Button onClick={() => handleTaskAction(task.id, 'Accept')} className="flex-1 bg-primary font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 text-md">
                          <CheckCircle2 className="h-5 w-5 mr-2" /> {t.accept}
                        </Button>
                        <Button onClick={() => handleTaskAction(task.id, 'Reject')} variant="outline" className="flex-1 text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 font-bold h-14 rounded-2xl text-md">
                          <XCircle className="h-5 w-5 mr-2" /> {t.reject}
                        </Button>
                      </>
                    )}
                    {task.status === 'In Progress' && (
                      <Button onClick={() => handleMarkAsFinished(task.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-emerald-900/20 text-md">
                        <CheckCircle2 className="h-5 w-5 mr-2" /> {t.markWorkFinished}
                      </Button>
                    )}
                    {task.status === 'Partially Completed' && (
                      <Dialog open={isQRModalOpen && selectedTaskId === task.id} onOpenChange={(open) => {
                        setIsQRModalOpen(open);
                        if (open) setSelectedTaskId(task.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 text-md">
                            <QrCode className="h-5 w-5 mr-2" /> {t.showVerificationQr}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-950/90 border-white/10 text-white rounded-[3.5rem] backdrop-blur-[100px] shadow-2xl">
                          <DialogHeader className="pt-6">
                            <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                              <QrCode className="h-8 w-8 text-primary" /> {t.verificationQrTitle}
                            </DialogTitle>
                            <DialogDescription className="text-white/60 text-md mt-2">
                              {t.verificationQrDesc}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center gap-10 py-12">
                            <div className="p-10 bg-white rounded-[3rem] shadow-2xl scale-110">
                              <div className="w-56 h-56 bg-slate-50 flex items-center justify-center border-4 border-slate-100 rounded-2xl">
                                 <QrCode className="h-36 w-36 text-primary opacity-50" />
                              </div>
                            </div>
                            <Button 
                              onClick={() => simulateExternalScan(task.id)} 
                              variant="outline"
                              className="w-full h-14 font-bold border-white/10 hover:bg-white/10 rounded-2xl text-lg"
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
            <CardHeader className="py-8 flex flex-row items-center justify-between border-b border-white/10 bg-white/5 px-8">
              <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" /> Team Roster & Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {hasMarkedAttendance ? (
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] px-2 mb-2">Today's Presence</p>
                  {currentTeamAttendance.members.map((member, i) => (
                    <div key={i} className={cn(
                      "p-5 rounded-[2rem] text-sm font-bold border flex items-center justify-between transition-all",
                      member.status === 'Present' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-60"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn("h-3 w-3 rounded-full", member.status === 'Present' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                        <span className="font-headline text-md tracking-tight">{member.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{member.status === 'Present' ? t.present : t.absent}</span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-white/10 mt-6">
                     <div className="flex items-center justify-center gap-2 text-emerald-500 bg-emerald-500/5 py-3 rounded-2xl border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t.attendanceMarkedToday}</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-10 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/20">
                    <AlertCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-md font-bold text-white/80 leading-relaxed">{t.attendanceDesc}</p>
                    <Button 
                      className="mt-8 w-full font-bold h-14 shadow-xl shadow-primary/30 rounded-2xl text-md" 
                      onClick={() => setIsAttendanceModalOpen(true)}
                      disabled={!currentUser?.teamRoster || currentUser.teamRoster.length === 0}
                    >
                      {t.submitNow}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] px-2">Team Members List</p>
                    {currentUser?.teamRoster?.map((member, i) => (
                      <div key={i} className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-md text-white/90 font-bold tracking-tight">{member.name}</span>
                         </div>
                         <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{member.age} Yrs</span>
                      </div>
                    )) || (
                      <div className="text-center py-10">
                        <Users className="h-10 w-10 mx-auto text-white/10 mb-2" />
                        <p className="text-xs text-white/20 font-medium italic">No members registered by Zone Admin.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-primary shadow-2xl shadow-primary/40 rounded-[3.5rem] text-white">
            <CardHeader className="pt-10 px-10">
              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                <Award className="h-7 w-7 text-white" /> Performance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-10 pt-4">
               <div className="p-8 bg-white/15 backdrop-blur-xl rounded-[2.5rem] text-center border border-white/30 shadow-inner">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-white/80">Available Points</p>
                  <p className="text-6xl font-headline font-bold tracking-tighter">{currentUser?.rewardPoints || 0}</p>
               </div>
               <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                     <span className="uppercase tracking-[0.1em] text-white/80">Monthly Goal Progress</span>
                     <span className="text-lg">85%</span>
                  </div>
                  <Progress value={85} className="h-3 bg-white/20 rounded-full" />
                  <p className="text-[10px] text-center font-medium text-white/60 italic">Keep maintaining daily attendance and resolving sensor alerts for bonus points!</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
