"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Map as MapIcon, 
  AlertTriangle, 
  TrendingUp, 
  Zap,
  ChevronRight,
  PlayCircle,
  Activity,
  Trash2,
  Users,
  Award,
  RefreshCw
} from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function CommissionerDashboard() {
  const { tasks, sensors, isDemoRunning, demoStep, setDemoState, addNotification } = useStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  const handleStartDemo = () => {
    setDemoState(true, 1)
    addNotification({ title: 'DEMO STARTED', message: '60-second city automation sequence initiated.', type: 'info' })
    
    // Simple sequence for demo
    const steps = [
      "📡 ML Sensor Alert: Dustbin fill rate detected high at Mattuthavani.",
      "🤖 AI Auto-Task Created: Dispose Waste at Mattuthavani.",
      "👥 AI Resource Optimizer: Recommending Team T1 for dispatch.",
      "✅ Task Assigned to Team T1 (WRK-ZA-001).",
      "🏃 Worker WRK-ZA-001 accepted task. Response timer started.",
      "🔍 QR Verification Successful at Disposal Point.",
      "🌿 +20 Green Points awarded to Team T1."
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDemoState(true, current);
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setDemoState(false, 0), 2000);
      }
    }, 5000);
  }

  if (!mounted) return null

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length || 1
  const efficiency = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">City Overview</h1>
          <p className="text-white/40 font-medium">Corporation Commissioner Intelligence Center</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className={cn(
              "gap-2 font-bold h-12 px-6 rounded-2xl shadow-2xl transition-all",
              isDemoRunning ? "bg-rose-500 animate-pulse" : "bg-primary hover:bg-primary/90 shadow-primary/30"
            )}
            onClick={handleStartDemo}
            disabled={isDemoRunning}
          >
            {isDemoRunning ? <Activity className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
            {isDemoRunning ? "Demo Running..." : "Start Live Demo"}
          </Button>
          <Button variant="outline" className="gap-2 h-12 rounded-2xl border-white/10 bg-white/5 text-white">
            <RefreshCw className="h-4 w-4" /> Reset System
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', val: tasks.length, icon: TrendingUp, color: 'text-primary' },
          { label: 'Critical Alerts', val: 17, icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Avg Efficiency', val: efficiency + '%', icon: BarChart3, color: 'text-amber-500' },
          { label: 'Green Points', val: '2.8k', icon: Award, color: 'text-emerald-400' }
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <stat.icon className={cn("h-3 w-3", stat.color)} /> {stat.label}
              </CardDescription>
              <CardTitle className="text-4xl font-headline font-bold text-white">{stat.val}</CardTitle>
            </CardHeader>
            <CardContent>
               <Progress value={stat.label === 'Avg Efficiency' ? efficiency : 75} className="h-1.5 mt-2 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Tabs defaultValue="lab" className="lg:col-span-2 space-y-8">
          <TabsList className="bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10">
            <TabsTrigger value="lab" className="rounded-3xl font-bold text-sm h-full data-[state=active]:bg-primary">
              <Zap className="h-4 w-4 mr-2" /> Sensor Lab
            </TabsTrigger>
            <TabsTrigger value="rankings" className="rounded-3xl font-bold text-sm h-full data-[state=active]:bg-primary">
              <Award className="h-4 w-4 mr-2" /> City Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lab">
            <Card className="rounded-[3rem] border-none shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline font-bold text-white">Sensor Intelligence Dashboard</CardTitle>
                  <CardDescription>Real-time ML fill predictions per zone</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-[10px] font-bold h-8 rounded-full">Rain Mode</Button>
                  <Button size="sm" variant="outline" className="text-[10px] font-bold h-8 rounded-full">Market Day</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(sensors).map(([zone, data]: [string, any]) => (
                  <div key={zone} className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-4 w-4 rounded-full",
                          data.dustbin > 90 ? "bg-rose-500 animate-pulse" : data.dustbin > 75 ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                        <h4 className="font-bold text-lg">Zone {zone} - {zone === 'ZA' ? 'North' : zone === 'ZC' ? 'East' : 'City Center'}</h4>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">{data.dustbin}% Full</Badge>
                    </div>
                    <Progress value={data.dustbin} className="h-2 bg-white/5 mb-4" />
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
                       <span>ML Confidence: 94%</span>
                       <span>Predicted Full: {Math.max(0, 100 - data.dustbin)} min</span>
                       <Button size="sm" variant="ghost" className="h-7 text-primary hover:bg-primary/10">Trigger Alert</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card className="rounded-[3rem] border-none shadow-2xl">
               <CardContent className="py-10">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-left border-b border-white/10">
                        <th className="pb-4">Rank</th>
                        <th className="pb-4">Worker</th>
                        <th className="pb-4">Zone</th>
                        <th className="pb-4">Tasks</th>
                        <th className="pb-4">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { rank: '🥇 1', name: 'Rajan K.', zone: 'North', tasks: 142, pts: '2,480' },
                        { rank: '🥈 2', name: 'Malar S.', zone: 'East', tasks: 128, pts: '2,190' },
                        { rank: '🥉 3', name: 'Priya T.', zone: 'Central', tasks: 115, pts: '1,870' }
                      ].map((r, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                          <td className="py-5 font-bold">{r.rank}</td>
                          <td className="py-5 font-bold">{r.name}</td>
                          <td className="py-5 text-white/60">{r.zone}</td>
                          <td className="py-5 font-bold">{r.tasks}</td>
                          <td className="py-5 font-headline font-bold text-primary">{r.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-10">
          <Card className="glass-panel border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="bg-primary text-black">
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 fill-current" /> AI Advisor Insights
              </CardTitle>
              <CardDescription className="text-black/60 font-medium italic">Powered by Gemini 2.5 Flash</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {isDemoRunning ? (
                <div className="flex flex-col gap-6">
                   <div className="p-4 rounded-2xl bg-white/10 border border-white/20 animate-in slide-in-from-right duration-500">
                     <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Live Demo Step {demoStep}</p>
                     <p className="text-sm font-medium leading-relaxed">
                       {demoStep === 1 && "📡 ML Sensor Alert: Dustbin fill rate detected high at Mattuthavani."}
                       {demoStep === 2 && "🤖 AI Auto-Task Created: Dispose Waste at Mattuthavani."}
                       {demoStep === 3 && "👥 AI Resource Optimizer: Recommending Team T1 for dispatch."}
                       {demoStep === 4 && "✅ Task Assigned to Team T1 (WRK-ZA-001)."}
                       {demoStep === 5 && "🏃 Worker WRK-ZA-001 accepted task. Response timer started."}
                       {demoStep === 6 && "🔍 QR Verification Successful at Disposal Point."}
                       {demoStep === 7 && "🌿 +20 Green Points awarded to Team T1."}
                     </p>
                   </div>
                   <div className="flex gap-2">
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 1 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 2 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 3 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 4 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 5 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 6 && "bg-primary")} />
                     <div className={cn("h-1.5 flex-1 rounded-full bg-white/10", demoStep >= 7 && "bg-primary")} />
                   </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-white/80">
                    "Zone C East continues to lead with 92% completion rate this week. Zone D shows a concerning 12% drop — recommend immediate reallocation."
                  </p>
                  <Button variant="outline" className="w-full h-11 rounded-2xl border-white/10 hover:bg-white/10">Full Prediction Report</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-none shadow-2xl rounded-[3rem]">
             <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Live Alert Feed</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {[
                  { icon: AlertTriangle, color: 'text-rose-500', msg: 'ZE Dustbin CRITICAL 96%', time: '2m ago' },
                  { icon: Zap, color: 'text-primary', msg: 'Anomaly: WC01 fill rate 3x normal', time: '8m ago' },
                  { icon: Trash2, color: 'text-emerald-500', msg: 'WB04 Drainage resolved', time: '15m ago' }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <alert.icon className={cn("h-5 w-5 shrink-0", alert.color)} />
                    <div className="flex-1">
                      <p className="text-xs font-bold">{alert.msg}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}