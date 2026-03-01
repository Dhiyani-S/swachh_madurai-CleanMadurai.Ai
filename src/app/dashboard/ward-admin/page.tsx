
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { 
  BarChart3, 
  MapPin, 
  AlertTriangle, 
  Zap,
  Users,
  ClipboardCheck,
  ChevronRight,
  MessageSquareWarning
} from "lucide-react"
import { wardAdminPerformanceAssistant, WardAdminPerformanceAssistantOutput } from "@/ai/flows/ward-admin-performance-assistant"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function WardAdminDashboard() {
  const [advisorOutput, setAdvisorOutput] = React.useState<WardAdminPerformanceAssistantOutput | null>(null)
  const [isAnalysing, setIsAnalysing] = React.useState(false)
  const { toast } = useToast()

  const runAiAdvisor = async () => {
    setIsAnalysing(true)
    try {
      const result = await wardAdminPerformanceAssistant({
        wardId: 'ward-14',
        wardName: 'Anna Nagar',
        wardOverallPerformance: { status: 'Yellow', description: 'Moderate performance with some lag in Zone 3 response times.' },
        overallTaskSummary: { totalTasks: 85, completedTasks: 62, pendingTasks: 23 },
        zones: [
          {
            zoneId: 'z1', zoneName: 'Anna Nagar East', zoneAdminName: 'Meena',
            zonePerformance: { status: 'Green', description: 'High efficiency.' },
            zoneTaskSummary: { totalTasks: 40, completedTasks: 38, pendingTasks: 2 },
            workers: [
              { workerId: 'w1', workerName: 'Ramu', teamNumber: 'T01', performanceStatus: 'Green', completedTasks: 15, pendingTasks: 0, rejectedTasks: 0, unresponsiveTasks: 0, rewardPoints: 120 }
            ]
          },
          {
            zoneId: 'z2', zoneName: 'Anna Nagar West', zoneAdminName: 'Arjun',
            zonePerformance: { status: 'Red', description: 'Low response rates.' },
            zoneTaskSummary: { totalTasks: 45, completedTasks: 24, pendingTasks: 21 },
            workers: [
              { workerId: 'w2', workerName: 'Siva', teamNumber: 'T02', performanceStatus: 'Red', completedTasks: 5, pendingTasks: 10, rejectedTasks: 4, unresponsiveTasks: 6, rewardPoints: 20 }
            ]
          }
        ]
      })
      setAdvisorOutput(result)
    } catch (error) {
      toast({ title: "Advisor Offline", description: "Could not reach AI assistant.", variant: "destructive" })
    } finally {
      setIsAnalysing(false)
    }
  }

  React.useEffect(() => {
    runAiAdvisor()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Ward Management</h1>
          <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Ward 14 - Anna Nagar Jurisdiction</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAiAdvisor} disabled={isAnalysing} className="gap-2">
            <Zap className={cn("h-4 w-4 text-amber-500", isAnalysing && "animate-pulse")} /> Run AI Analysis
          </Button>
          <Button className="bg-primary text-primary-foreground font-bold">Assign New Task</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><ClipboardCheck className="h-3 w-3" /> Completion Rate</CardDescription>
            <CardTitle className="text-3xl">72.9%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={72.9} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Users className="h-3 w-3" /> Active Teams</CardDescription>
            <CardTitle className="text-3xl">12 Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                  T{i}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                +7
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Critical Zones</CardDescription>
            <CardTitle className="text-3xl text-rose-500">2 Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <StatusBadge status="Red" label="Zone 3" />
              <StatusBadge status="Red" label="Zone 5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="bg-accent/20 p-4 border-b flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Zone Admin Performance
              </h3>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">View All Details</Button>
            </div>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { name: 'Arjun P.', zone: 'Zone 3 (Anna Nagar West)', status: 'Red', load: 85 },
                  { name: 'Meena S.', zone: 'Zone 1 (Anna Nagar East)', status: 'Green', load: 45 },
                  { name: 'Karthik R.', zone: 'Zone 4 (Vaikunth Nagar)', status: 'Yellow', load: 60 },
                ].map((admin, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Current Load</p>
                        <Progress value={admin.load} className="w-24 h-1.5" />
                      </div>
                      <StatusBadge status={admin.status as any} />
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MessageSquareWarning className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Recent Zone Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {advisorOutput?.identifiedIssues.map((issue, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/30 border-l-4 border-rose-500">
                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-rose-600">{issue.entityName} Underperformance</h4>
                    <p className="text-xs text-muted-foreground mt-1">{issue.reasonForUnderperformance}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {issue.suggestedSpecificInterventions.map((step, idx) => (
                        <div key={idx} className="bg-background text-[10px] px-2 py-1 rounded border font-medium">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-md bg-primary text-primary-foreground overflow-hidden">
            <CardHeader className="bg-black/10">
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 fill-current text-accent" /> AI Advisor Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isAnalysing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent" />
                  <p className="font-medium">Aggregating zone data and worker performance...</p>
                </div>
              ) : advisorOutput ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Summary</h4>
                    <p className="text-sm leading-relaxed text-primary-foreground/90">{advisorOutput.overallWardSummary}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent">General Strategies</h4>
                    <ul className="space-y-2">
                      {advisorOutput.generalWardWideStrategies.slice(0, 3).map((strategy, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 text-accent" /> {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="secondary" className="w-full font-bold h-11 text-primary">
                    Download Full Report
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center text-white/40">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Click "Run AI Analysis" to get deep insights for your ward.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Ward Dashboard Live Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y px-4">
                  {[
                    { text: 'New private request in Zone 4', time: '2 mins ago', icon: Zap, color: 'text-primary' },
                    { text: 'Worker T04 responded to alert', time: '15 mins ago', icon: ClipboardCheck, color: 'text-emerald-500' },
                    { text: 'Drainage leak detected - West St', time: '1 hour ago', icon: AlertTriangle, color: 'text-rose-500' },
                  ].map((item, i) => (
                    <div key={i} className="py-3 flex gap-3">
                      <item.icon className={cn("h-4 w-4 shrink-0 mt-1", item.color)} />
                      <div>
                        <p className="text-sm font-medium">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
