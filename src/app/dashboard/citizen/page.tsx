
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Send, History, Trash2, Home, MapPin, CheckCircle, Clock, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore, Task } from "@/lib/store"
import { StatusBadge } from "@/components/dashboard/StatusBadge"

export default function CitizenDashboard() {
  const { toast } = useToast()
  const { tasks, addTask, updateTask, currentUser } = useStore()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = (type: 'public' | 'private') => {
    setSubmitting(true)
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: type === 'public' ? 'Public Issue Report' : 'Private Collection Request',
      location: 'Current Location',
      status: 'Pending',
      type: type === 'public' ? 'Citizen Public' : 'Citizen Private',
      wardId: 'ward-1',
      zoneId: 'Zone 4 (Vaikunth Nagar)',
      createdAt: new Date().toISOString(),
      citizenId: currentUser?.id,
      paymentStatus: type === 'private' ? 'Unpaid' : undefined
    }

    setTimeout(() => {
      addTask(newTask)
      setSubmitting(false)
      toast({
        title: "Request Submitted",
        description: type === 'public' ? "The authorities have been notified." : "Zone admin will generate your payment receipt shortly.",
      })
    }, 1500)
  }

  const handlePayment = (taskId: string) => {
    updateTask(taskId, { paymentStatus: 'Paid' })
    toast({
      title: "Payment Successful",
      description: "Worker is allocated, soon there will reached the place",
    })
  }

  const myRequests = tasks.filter(t => t.citizenId === currentUser?.id)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Citizen Portal</h1>
        <p className="text-muted-foreground">Submit cleaning requests and track progress in your area</p>
      </div>

      <Tabs defaultValue="private" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 h-12">
          <TabsTrigger value="private" className="font-bold flex gap-2"><Home className="h-4 w-4" /> Private Service</TabsTrigger>
          <TabsTrigger value="public" className="font-bold flex gap-2"><Trash2 className="h-4 w-4" /> Public Complaint</TabsTrigger>
        </TabsList>

        <TabsContent value="private">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Request Collection/Cleaning</CardTitle>
              <CardDescription>Scheduled waste collection or cleaning for private premises</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger><SelectContent><SelectItem value="z1">Zone 4 (Vaikunth Nagar)</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger><SelectContent><SelectItem value="w1">Ward 14</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Area / Address</Label>
                <Input placeholder="Enter your full address" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full font-bold h-12 text-lg gap-2" 
                onClick={() => handleSubmit('private')}
                disabled={submitting}
              >
                {submitting ? "Processing..." : <><Send className="h-5 w-5" /> Submit Private Request</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="public">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-rose-600 flex items-center gap-2">
                <Trash2 className="h-6 w-6" /> Report Public Issue
              </CardTitle>
              <CardDescription>Flag overflows or leakages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="What is wrong?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overflow">Dustbin Overflow</SelectItem>
                    <SelectItem value="drainage">Drainage Leakage</SelectItem>
                    <SelectItem value="water">Water Leakage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Photo Proof</Label>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-secondary/20">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">Upload Photo</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full font-bold h-12 text-lg gap-2" 
                onClick={() => handleSubmit('public')}
                disabled={submitting}
              >
                {submitting ? "Reporting..." : <><Send className="h-5 w-5" /> File Public Report</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">My Requests & History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.map(task => (
              <div key={task.id} className="flex gap-4 p-3 rounded-xl bg-secondary/30 border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {task.type === 'Citizen Private' ? <Home className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm">{task.name}</p>
                    <span className="text-[10px] font-bold text-muted-foreground">{task.status}</span>
                  </div>
                  {task.paymentStatus === 'Unpaid' && (
                    <Button 
                      size="sm" 
                      className="mt-2 h-7 text-[10px] font-bold gap-1"
                      onClick={() => handlePayment(task.id)}
                    >
                      <CreditCard className="h-3 w-3" /> Pay Collection Fee
                    </Button>
                  )}
                  {task.paymentStatus === 'Paid' && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Worker is allocated, soon there will reached the place
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-accent/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Local Efficiency</CardTitle>
            <CardDescription>Zone 4 (Vaikunth Nagar)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cleaning Frequency</span>
              <StatusBadge status="Green" />
            </div>
            <p className="text-xs text-muted-foreground">Your zone has a 98% response rate within the last 24 hours.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
