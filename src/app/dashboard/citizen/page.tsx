
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Send, History, Trash2, Home, MapPin, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StatusBadge } from "@/components/dashboard/StatusBadge"

export default function CitizenDashboard() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = (type: 'public' | 'private') => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast({
        title: "Request Submitted",
        description: type === 'public' ? "The authorities have been notified." : "Zone admin will generate your payment receipt shortly.",
      })
    }, 1500)
  }

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
                  <Select><SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger><SelectContent><SelectItem value="z1">Zone 1 (Main)</SelectItem></SelectContent></Select>
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
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="What do you need?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waste">Waste Collection</SelectItem>
                    <SelectItem value="cleaning">Premises Cleaning</SelectItem>
                    <SelectItem value="both">Both Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Next Step: Payment</h4>
                  <p className="text-xs text-muted-foreground">After submission, the Zone Admin will review and generate a digital payment receipt.</p>
                </div>
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
              <CardDescription>Flag overflowing dustbins, drainage leaks, or dirty public spaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Location</Label>
                  <Input placeholder="e.g. Near Kalavasal Bus Stop" />
                </div>
                <div className="space-y-2">
                  <Label>Issue Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="What is wrong?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overflow">Dustbin Overflow</SelectItem>
                      <SelectItem value="leakage">Drainage Leakage</SelectItem>
                      <SelectItem value="litter">Heavy Littering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Photo Proof</Label>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-all">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to take a photo or upload</p>
                  <p className="text-xs text-muted-foreground">Clear images help admins prioritize faster</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full font-bold h-12 text-lg gap-2 bg-rose-600 hover:bg-rose-700" 
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
            <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 p-3 rounded-xl bg-secondary/30">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Complaint #9821 Resolved</p>
                <p className="text-xs text-muted-foreground">Street cleaning completed at West Masi St.</p>
                <p className="text-[10px] text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-xl bg-secondary/30">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Request #4402 Processing</p>
                <p className="text-xs text-muted-foreground">Waiting for Zone Admin payment verification.</p>
                <p className="text-[10px] text-muted-foreground mt-1">Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Local Efficiency</CardTitle>
            <CardDescription>Performance of your assigned zone (Zone 4)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cleaning Frequency</span>
              <StatusBadge status="Green" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Citizen Satisfaction</span>
              <span className="font-bold text-primary text-xl">4.8/5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">Zone 4 is currently ranked #2 in Madurai City for cleanliness and response time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
