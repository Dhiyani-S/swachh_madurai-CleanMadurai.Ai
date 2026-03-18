
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
import { useStore, AttendanceRecord, Task } from "@/lib/store"
import { 
  Award, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  Users,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  Radio,
  UserCircle,
  Phone,
  Zap,
  Loader2,
  AlertCircle,
  Timer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { translations } from "@/lib/translations"
import { Badge } from "@/components/ui/badge"

const TaskCountdown = ({ assignedAt, onTimeout }: { assignedAt?: string, onTimeout: () => void }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    if (!assignedAt) return;
    const assignedTime = new Date(assignedAt).getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = thirtyMinutes - (now - assignedTime);

      if (diff <= 0) {
        clearInterval(interval);
        onTimeout();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [assignedAt, onTimeout]);

  return (
    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase animate-pulse">
      <Timer className="h-4 w-4" />
      <span>Timeout in {timeLeft}</span>
    </div>
  );
};

export default function WorkerDashboard() {
  const { currentUser, tasks, updateTask, attendance, submitAttendance, language, teams, addNotification, checkTaskTimeouts } = useStore()
  const { toast } = useToast()
  const t = translations[language || 'en'];
  
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false)
  const [attendanceState, setAttendanceState] = React.useState<AttendanceRecord[]>([])
  const [mounted, setMounted] = React.useState(false)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [qrTaskId, setQrTaskId] = React.useState<string | null>(null)

  const today = React.useMemo(() => new Date().toLocaleDateString(), [])
  
  const myTeam = React.useMemo(() => {
    if (!currentUser?.teamId) return null;
    return teams.find(team => team.id.toUpperCase() === currentUser.teamId?.toUpperCase());
  }, [teams, currentUser])

  const currentAttendance = myTeam ? attendance[`${myTeam.id}-${today}`] : null
  const hasMarkedAttendance = !!currentAttendance

  React.useEffect(() => {
    setMounted(true)
    const timeoutChecker = setInterval(() => checkTaskTimeouts(), 5000);
    
    if (myTeam && !hasMarkedAttendance) {
      setAttendanceState(myTeam.members.map(m => ({ workerId: m.workerId, name: m.name, status: 'Present' })))
      setIsAttendanceModalOpen(true)
    }
    return () => clearInterval(timeoutChecker);
  }, [mounted, hasMarkedAttendance, myTeam, checkTaskTimeouts])

  const handleAttendanceSubmit = () => {
    if (myTeam) {
      submitAttendance(myTeam.id, today, attendanceState)
      setIsAttendanceModalOpen(false)
      addNotification({
        title: "Attendance Marked",
        message: `Shift started with ${attendanceState.filter(r => r.status === 'Present').length} members present.`,
        type: 'success'
      });
      toast({ title: t.attendanceSubmitted })
    }
  }

  const handleTaskAction = (taskId: string, newStatus: any) => {
    setProcessingId(taskId);
    setTimeout(() => {
      updateTask(taskId, { status: newStatus });
      setProcessingId(null);
      toast({
        title: `Task Status: ${newStatus.replace('_', ' ')}`,
        description: `Successfully updated task status.`
      });
    }, 800);
  }

  const handleRejectTask = (taskId: string) => {
    updateTask(taskId, { status: 'pending', assignedTo: undefined, teamId: undefined, assignedAt: undefined });
    toast({ title: "Task Rejected", description: "Task has been returned to the Zone Admin queue." });
  }

  const simulateQrScan = (taskId: string) => {
    setQrTaskId(taskId);
    setTimeout(() => {
      handleTaskAction(taskId, 'completed');
      setQrTaskId(null);
      addNotification({
        title: "Disposal Verified",
        message: "QR code verified at disposal site. Reward points awarded.",
        type: 'success'
      });
    }, 2000);
  }

  if (!mounted || !currentUser) return null

  const myTasks = tasks.filter(t => 
    (t.assignedTo === currentUser.id || t.teamId === currentUser.teamId) && 
    t.status !== 'completed'
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950/90 border-white/10 text-white rounded-[3rem] backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="pt-4">
            <DialogTitle className="font-headline text-3xl flex items-center gap-3 uppercase">
              <UserCheck className="h-8 w-8 text-primary" /> {t.attendanceCheck}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-md">
              Verify your team roster for {today}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {attendanceState.map((record, idx) => (
              <div key={record.workerId} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{record.name}</span>
                  <Badge variant="outline" className="border-white/10 text-[8px] uppercase tracking-widest text-white/40">Personnel</Badge>
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
                    <Label htmlFor={`p-${idx}`} className="text-xs font-bold text-primary cursor-pointer">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Absent" id={`a-${idx}`} className="border-rose-500" />
                    <Label htmlFor={`a-${idx}`} className="text-xs font-bold text-rose-500 cursor-pointer">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <DialogFooterUI className="pb-4">
            <Button className="w-full h-14 rounded-2xl font-bold bg-primary shadow-2xl shadow-primary/20 text-black uppercase" onClick={handleAttendanceSubmit}>
              Confirm Roster & Start Duty
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center gap-8 p-4">
            <div className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-black font-headline text-4xl font-bold shadow-2xl shadow-primary/40 relative">
              {currentUser.teamId?.slice(0, 1) || 'W'}
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-black rounded-full border-2 border-primary flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">{currentUser.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Team: {currentUser.teamId} • {currentUser.address || 'Central Zone'}</p>
                {hasMarkedAttendance && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase px-3">Live Duty</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-2xl flex items-center gap-3 uppercase tracking-tighter text-white">
                <Zap className="h-6 w-6 text-primary fill-primary" /> {t.activeTasks}
              </h3>
              <Badge variant="outline" className="text-white/40 border-white/10 uppercase tracking-widest text-[10px]">{myTasks.length} Assigned</Badge>
            </div>

            {myTasks.length === 0 ? (
              <Card className="rounded-[3.5rem] p-24 text-center bg-white/5 border-2 border-dashed border-white/10 shadow-inner">
                <CheckCircle className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
                <p className="text-white/40 font-bold text-xl uppercase tracking-widest">{t.allCaughtUp}</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myTasks.map((task) => (
                  <Card key={task.id} className="rounded-[3rem] border-none shadow-2xl overflow-hidden glass-panel group border-l-4 border-l-primary/40">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-2xl font-bold text-white uppercase tracking-tighter leading-tight">{task.work}</CardTitle>
                          <div className="flex items-center gap-3">
                            <CardDescription className="flex items-center gap-1.5 font-bold text-white/60">
                              <MapPin className="h-4 w-4 text-primary" /> {task.place}
                            </CardDescription>
                            <Badge variant="outline" className="border-white/10 text-[8px] uppercase tracking-widest text-white/40">ID: {task.id.slice(-6)}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn(
                            "rounded-full px-4 h-8 uppercase text-[10px] font-bold tracking-widest",
                            task.status === 'assigned' ? 'bg-amber-500/20 text-amber-500' : 
                            task.status === 'in_progress' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-500'
                          )}>
                            {task.status === 'assigned' ? 'New Request' : 
                             task.status === 'in_progress' ? 'Processing' : 
                             task.status === 'partially_completed' ? 'Awaiting Disposal' : task.status}
                          </Badge>
                          {task.status === 'assigned' && <TaskCountdown assignedAt={task.assignedAt} onTimeout={() => checkTaskTimeouts()} />}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardFooter className="p-8 pt-2 gap-4">
                      {task.status === 'assigned' ? (
                        <div className="grid grid-cols-2 w-full gap-4">
                          <Button 
                            className="h-16 rounded-2xl bg-primary font-bold shadow-2xl shadow-primary/20 text-black text-lg" 
                            onClick={() => handleTaskAction(task.id, 'in_progress')}
                            disabled={processingId === task.id}
                          >
                            Accept Task
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-16 rounded-2xl border-rose-500 text-rose-500 font-bold" 
                            onClick={() => handleRejectTask(task.id)}
                          >
                            Reject Task
                          </Button>
                        </div>
                      ) : task.status === 'in_progress' ? (
                        <Button 
                          className="w-full h-16 rounded-2xl bg-primary font-bold shadow-2xl shadow-primary/20 text-black text-lg uppercase" 
                          onClick={() => handleTaskAction(task.id, 'partially_completed')}
                          disabled={processingId === task.id}
                        >
                          Mark Collected
                        </Button>
                      ) : (
                        <Button 
                          className="w-full h-16 rounded-2xl bg-emerald-500 font-bold shadow-2xl shadow-emerald-500/20 text-black text-lg uppercase flex gap-2" 
                          onClick={() => simulateQrScan(task.id)}
                          disabled={qrTaskId === task.id}
                        >
                          {qrTaskId === task.id ? <Loader2 className="animate-spin" /> : <QrCode className="h-6 w-6" />}
                          {qrTaskId === task.id ? 'Scanning QR...' : 'Scan Disposal QR'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-primary text-black">
             <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3 uppercase tracking-tighter">
                   <Award className="h-7 w-7" /> Efficiency
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 pt-4">
                <div className="bg-black/10 p-8 rounded-[2rem] text-center border border-black/5">
                   <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Incentive Points</p>
                   <p className="text-6xl font-headline font-bold">{currentUser.rewardPoints || 0}</p>
                </div>
                <div className="space-y-4 px-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>Shift Progress</span>
                      <span>{myTasks.length === 0 ? '100%' : '85%'}</span>
                   </div>
                   <Progress value={myTasks.length === 0 ? 100 : 85} className="h-2 bg-black/10" />
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
             <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 uppercase tracking-tighter">
                   <Users className="h-6 w-6 text-primary" /> Team Roster
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                {myTeam?.members.map((member, i) => {
                  const status = currentAttendance?.records.find(r => r.workerId === member.workerId)?.status || 'Pending';
                  return (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 group">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                             <UserCircle className="h-6 w-6 text-primary/40" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-sm text-white">{member.name}</span>
                             <div className="flex items-center gap-1 text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                <Phone className="h-2 w-2 text-primary" /> {member.phone || 'N/A'}
                             </div>
                          </div>
                       </div>
                       <Badge variant="outline" className={cn(
                         "text-[8px] font-bold uppercase tracking-widest px-2 h-6 flex items-center",
                         status === 'Present' ? "text-emerald-500 border-emerald-500/20" : status === 'Absent' ? "text-rose-500 border-rose-500/20" : "text-white/20"
                       )}>
                         {status}
                       </Badge>
                    </div>
                  )
                })}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
