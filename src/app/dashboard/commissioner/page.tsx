
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { 
  BarChart3, 
  Map as MapIcon, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Zap,
  ChevronRight,
  Send
} from "lucide-react"
import { getCommissionerPerformanceInsights, CommissionerPerformanceInsightsOutput } from "@/ai/flows/commissioner-performance-insights"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const wardData = [
  { name: 'Ward 1', performance: 'Green', tasks: 120, completed: 110, admin: 'Ravi Kumar' },
  { name: 'Ward 2', performance: 'Green', tasks: 95, completed: 90, admin: 'Selvi M.' },
  { name: 'Ward 3', performance: 'Yellow', tasks: 150, completed: 105, admin: 'Anbu T.' },
  { name: 'Ward 4', performance: 'Red', tasks: 80, completed: 35, admin: 'Prakash S.' },
  { name: 'Ward 5', performance: 'Green', tasks: 110, completed: 108, admin: 'Deepa R.' },
]

const sensorAlerts = [
  { type: 'Dustbin Overflow', location: 'Goripalayam', time: '10 mins ago', severity: 'High' },
  { type: 'Water Leakage', location: 'Simmakkal', time: '25 mins ago', severity: 'Medium' },
  { type: 'Toilet Stock Level', location: 'Anna Bus Stand', time: '1 hour ago', severity: 'Low' },
]

export default function CommissionerDashboard() {
  const [aiInsights, setAiInsights] = React.useState<CommissionerPerformanceInsightsOutput | null>(null)
  const [isLoadingAi, setIsLoadingAi] = React.useState(false)
  const { toast } = useToast()

  const fetchAiInsights = async () => {
    setIsLoadingAi(true)
    try {
      const result = await getCommissionerPerformanceInsights({ period: 'this week' })
      setAiInsights(result)
    } catch (error) {
      toast({ title: "AI Assistant Offline", description: "Could not fetch latest performance insights.", variant: "destructive" })
    } finally {
      setIsLoadingAi(false)
    }
  }

  React.useEffect(() => {
    fetchAiInsights()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">City Overview</h1>
          <p className="text-muted-foreground">Corporation Commissioner Control Center</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Reports
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Zap className="h-4 w-4" /> Live Ops
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Total Tasks</CardDescription>
            <CardTitle className="text-3xl">560</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={78} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">78% completion rate city-wide</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Active Alerts</CardDescription>
            <CardTitle className="text-3xl text-rose-500">14</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <div className="h-2 w-full bg-rose-500 rounded-full" />
              <div className="h-2 w-full bg-rose-500/30 rounded-full" />
              <div className="h-2 w-full bg-rose-500/10 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 Critical sensor issues</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Avg. Efficiency</CardDescription>
            <CardTitle className="text-3xl">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-2 bg-emerald-100" />
            <p className="text-xs text-muted-foreground mt-2">+4% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><MapIcon className="h-3 w-3" /> Wards Covered</CardDescription>
            <CardTitle className="text-3xl">100/100</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusBadge status="Green" label="Healthy City" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Ward Performance Rankings</CardTitle>
            <CardDescription>Visual health check of all corporation wards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wardData.map((ward) => (
                <div key={ward.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={ward.performance as any} />
                    <div>
                      <h4 className="font-bold">{ward.name}</h4>
                      <p className="text-xs text-muted-foreground">Admin: {ward.admin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Completion</p>
                      <p className="font-bold">{Math.round((ward.completed / ward.tasks) * 100)}%</p>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 fill-current" /> AI Insights
              </CardTitle>
              {isLoadingAi && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />}
            </div>
            <CardDescription className="text-primary-foreground/70">Performance advisor for the Commissioner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights ? (
              <>
                <div className="p-3 rounded-lg bg-white/10 text-sm">
                  <p className="leading-relaxed">{aiInsights.overview}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 text-white/50">Inefficiencies Detected</h5>
                  <ul className="space-y-1">
                    {aiInsights.inefficiencies.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-rose-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary" className="w-full font-bold group" onClick={fetchAiInsights}>
                  Refresh Analysis <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            ) : (
              <div className="py-8 text-center text-primary-foreground/50">
                <Zap className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Analyzing city data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" /> Live Sensor Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {sensorAlerts.map((alert, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-muted-foreground">{alert.time}</span>
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      alert.severity === 'High' ? "bg-rose-500" : "bg-amber-500"
                    )} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary font-bold">View Alert Map</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Send Warning Message
            </CardTitle>
            <CardDescription>Issue data-backed warnings to underperforming Ward Admins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold text-muted-foreground">Select Ward Admin</label>
              <select className="w-full p-2 rounded-md bg-secondary/50 border-none text-sm outline-none">
                <option>Prakash S. (Ward 4 - Red Rank)</option>
                <option>Anbu T. (Ward 3 - Yellow Rank)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold text-muted-foreground">Performance Issue</label>
              <textarea 
                className="w-full p-3 rounded-md bg-secondary/50 border-none text-sm min-h-[100px] outline-none"
                placeholder="Describe the issues found..."
                defaultValue="Continuous drop in task completion rate in Zone 3 over the last 48 hours."
              />
            </div>
            <Button className="w-full font-bold">Compose AI Warning</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
