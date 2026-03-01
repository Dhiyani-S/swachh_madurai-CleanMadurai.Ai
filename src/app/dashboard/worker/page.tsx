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
  DialogFooter as DialogFooterUI
} from "@/components/ui/dialog"
import { useStore, AttendanceRecord } from "@/lib/store"
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
  ShieldCheck,
  UserCheck,
  Radio
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { translations } from "@/lib/translations"

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask, attendance, submitAttendance, language, teams } = useStore()
  const { toast } = useToast()
  const t = translations[language || 'en'];
  
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false)
  const [attendanceState, setAttendanceState] = React.useState<AttendanceRecord[]>([])
  const [mounted, setMounted] = React.useState(false)

  const today = React.useMemo(() => new Date().toLocaleDateString(), [])
  const myTeam = React.useMemo(() => teams.find(team => team.id === currentUser?.teamId), [teams, currentUser])
  const currentAttendance = myTeam ? attendance[`${myTeam.id}-${today}`] : null
  const hasMarkedAttendance = !!currentAttendance

  React.useEffect(() => {
    setMounted(true)
    if (myTeam && !hasMarkedAttendance) {
      setAttendanceState(myTeam.members.map(m => ({ workerId: m.workerId, name: m.name, status: 'Present' })))
      setIsAttendanceModalOpen(true)
    }
  }, [mounted, hasMarkedAttendance, myTeam])

  const handleAttendanceSubmit = () => {
    if (myTeam) {
      submitAttendance(myTeam.id, today, attendanceState)
      setIsAttendanceModalOpen(false)
      toast({ title: t.attendanceSubmitted })
    }
  }

  if (!mounted || !currentUser) return null

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status !== 'completed')

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Daily Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950/90 border-white/10 text-white rounded-[3rem] backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="pt-4">
            <DialogTitle className="font-headline text-3xl flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-primary" /> {t.attendanceCheck}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-md">
              Mark attendance for your team ({today}). Managed by Zone Admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6 max-h-[60vh] overflow-y-auto pr-2">
            {attendanceState.map((record, idx) => (
              <div key={record.workerId} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{record.name}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{record.workerId}</span>
                </div>
                <RadioGroup 
                  defaultValue="Present" 
                  className="flex gap-4"
                  onValueChange={(val) => {
                    const next = [...attendanceState]
                    next[idx].status = val as any
                    setAttendanceState(next)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Present" id={`p-${idx}`} className="border-primary" />
                    <Label htmlFor={`p-${idx}`} className="text-xs font-bold text-primary">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} className="border-rose-500" />
                    <Label htmlFor={`a-${idx}`} className="text-xs font-bold text-rose-500">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <DialogFooterUI className="pb-4">
            <Button className="w-full h-14 rounded-2xl font-bold bg-primary shadow-2xl shadow-primary/20" onClick={handleAttendanceSubmit}>
              Submit Attendance
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center gap-8 p-4">
            <div className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-black font-headline text-4xl font-bold shadow-2xl shadow-primary/40">
              {currentUser.id.slice(-1)}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">{currentUser.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{currentUser.id} • Team {currentUser.teamId}</p>
                {hasMarkedAttendance && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">✅ Attendance Marked</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-headline font-bold text-2xl flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" /> {t.activeTasks}
            </h3>
            {myTasks.length === 0 ? (
              <Card className="rounded-[3.5rem] p-20 text-center bg-white/5 border-2 border-dashed border-white/10">
                <CheckCircle className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
                <p className="text-white/40 font-bold text-xl">{t.allCaughtUp}</p>
              </Card>
            ) : (
              myTasks.map((task) => (
                <Card key={task.id} className="rounded-[3rem] border-none shadow-2xl overflow-hidden glass-panel">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white mb-2">{task.work}</CardTitle>
                        <CardDescription className="flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4 text-primary" /> {task.place}
                        </CardDescription>
                      </div>
                      <Badge className={cn(
                        "rounded-full px-4 h-8 uppercase text-[10px] font-bold tracking-widest",
                        task.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                      )}>
                        {t[task.status as keyof typeof t] || task.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-8 pt-0 gap-4">
                    {task.status === 'pending' ? (
                      <>
                        <Button className="flex-1 h-14 rounded-2xl bg-primary font-bold shadow-2xl shadow-primary/20" onClick={() => updateTask(task.id, { status: 'in_progress' })}>
                          <CheckCircle2 className="h-5 w-5 mr-2" /> Accept Task
                        </Button>
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl border-rose-500/20 text-rose-500 bg-rose-500/5" onClick={() => updateTask(task.id, { assignedTo: undefined, status: 'pending' })}>
                          <XCircle className="h-5 w-5 mr-2" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full h-14 rounded-2xl bg-primary font-bold shadow-2xl shadow-primary/20" onClick={() => updateTask(task.id, { status: 'completed' })}>
                        <QrCode className="h-5 w-5 mr-2" /> Show Verification QR
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-10">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-primary text-black">
             <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                   <Award className="h-7 w-7" /> Performance
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 pt-4">
                <div className="bg-black/10 p-8 rounded-[2rem] text-center border border-black/5">
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Total Green Points</p>
                   <p className="text-6xl font-headline font-bold">{currentUser.rewardPoints || 0}</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>Monthly Goal</span>
                      <span>85%</span>
                   </div>
                   <Progress value={85} className="h-2 bg-black/10" />
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
             <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                   <Users className="h-6 w-6 text-primary" /> Team Roster
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-4">
                {myTeam?.members.map((member, i) => {
                  const status = currentAttendance?.records.find(r => r.workerId === member.workerId)?.status || 'Pending';
                  return (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                       <div className="flex flex-col">
                          <span className="font-bold text-sm">{member.name}</span>
                          <span className="text-[10px] text-white/40">{member.workerId}</span>
                       </div>
                       <Badge variant="outline" className={cn(
                         "text-[8px] font-bold uppercase tracking-widest px-2",
                         status === 'Present' ? "text-emerald-500 border-emerald-500/20" : status === 'Absent' ? "text-rose-500 border-rose-500/20" : "text-white/20"
                       )}>
                         {status}
                       </Badge>
                    </div>
                  )
                })}
             </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
             <CardHeader>
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                   <ShieldCheck className="h-6 w-6 text-primary" /> Safety Checklist
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-4">
                {[
                  { label: 'Wearing Gloves', val: true },
                  { label: 'Face Mask On', val: true },
                  { label: 'Hand Sanitizer', val: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white/80">{item.label}</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}