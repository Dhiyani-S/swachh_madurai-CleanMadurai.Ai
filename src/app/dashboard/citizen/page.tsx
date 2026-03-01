"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Send, Trash2, Home, RefreshCw, Award, Zap, Loader2, AlertCircle, MapPin, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore, Task } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { verifyPublicReport } from "@/ai/flows/verify-public-report-flow"

export default function CitizenDashboard() {
  const { toast } = useToast()
  const { tasks, addTask, updateTask, currentUser, addCitizenRewards, users } = useStore()
  const [submitting, setSubmitting] = React.useState(false)
  const [selectedZone, setSelectedZone] = React.useState<string>("")
  const [address, setAddress] = React.useState<string>("")
  const [issueType, setIssueType] = React.useState<string>("")
  const [mounted, setMounted] = React.useState(false)
  
  // Camera State
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to report public issues.',
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    getCameraPermission();
  };

  const handleSubmit = async (type: 'public' | 'private') => {
    if (!selectedZone || !address) {
      toast({
        variant: 'destructive',
        title: "Missing Information",
        description: "Please select a zone and provide an address.",
      });
      return;
    }

    if (type === 'public' && !capturedImage) {
      toast({
        variant: 'destructive',
        title: "Photo Required",
        description: "Please capture a photo of the issue for AI verification.",
      });
      return;
    }

    setSubmitting(true)

    try {
      if (type === 'public' && capturedImage) {
        toast({
          title: "AI Deep Learning Verification",
          description: "Our AI is currently verifying your report image...",
        });

        const aiResult = await verifyPublicReport({
          photoDataUri: capturedImage,
          description: `Citizen reports ${issueType} at ${address}`
        });

        if (!aiResult.isValid) {
          toast({
            variant: 'destructive',
            title: "Verification Rejected",
            description: aiResult.reasoning,
          });
          setSubmitting(false);
          return;
        }

        // Automatic Assignment Logic for verified issues
        const zoneWorkers = users.filter(u => u.role === 'Worker' && u.zoneId === selectedZone);
        // Simulate finding the "nearest" or first available worker
        const suggestedWorker = zoneWorkers[Math.floor(Math.random() * zoneWorkers.length)] || zoneWorkers[0];

        const newTask: Task = {
          id: `task-${Date.now()}`,
          name: `Verified: ${issueType || 'Waste Cleanup'}`,
          location: address,
          status: 'Pending',
          type: 'Citizen Public',
          wardId: 'Ward 14',
          zoneId: selectedZone,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
          imageProof: capturedImage,
          assignedTo: suggestedWorker?.id
        };

        addTask(newTask);
        addCitizenRewards(currentUser?.id || "", 50);

        toast({
          title: "Issue Verified & Dispatched!",
          description: `AI confirmed valid ${aiResult.issueType}. Task assigned to ${suggestedWorker?.name || 'Zone Queue'}. +50 Rewards earned!`,
        });
      } else {
        // Private Service Flow
        const newTask: Task = {
          id: `task-${Date.now()}`,
          name: 'Private Collection Request',
          location: address,
          status: 'Pending',
          type: 'Citizen Private',
          wardId: 'Ward 14',
          zoneId: selectedZone,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
          paymentStatus: 'Unpaid'
        };
        addTask(newTask);
        toast({
          title: "Request Submitted",
          description: "Zone admin will generate your payment receipt shortly.",
        });
      }

      setAddress("");
      setCapturedImage(null);
      setSelectedZone("");
      setIssueType("");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: 'destructive',
        title: "System Busy",
        description: "Could not complete AI verification. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  const myRequests = tasks.filter(t => t.citizenId === currentUser?.id)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Citizen Portal</h1>
          <p className="text-muted-foreground">AI-powered reporting for a cleaner Madurai</p>
        </div>
        <Card className="bg-primary/5 border-primary/20 shadow-none px-4 py-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">My Rewards</p>
              <p className="text-xl font-headline font-bold text-primary">{currentUser?.rewardPoints || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 h-12">
          <TabsTrigger value="public" className="font-bold flex gap-2" onClick={() => !capturedImage && getCameraPermission()}><Trash2 className="h-4 w-4" /> Public Complaint</TabsTrigger>
          <TabsTrigger value="private" className="font-bold flex gap-2"><Home className="h-4 w-4" /> Private Service</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-rose-600 flex items-center gap-2">
                <Zap className="h-6 w-6 fill-rose-600" /> DL Verification Layer
              </CardTitle>
              <CardDescription>Deep Learning analysis verifies your photo instantly. Only valid issues are forwarded to admins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zone 1 (Central)">Zone 1 (Central)</SelectItem>
                      <SelectItem value="Zone 2 (Anna Nagar)">Zone 2 (Anna Nagar)</SelectItem>
                      <SelectItem value="Zone 3 (Madurai West)">Zone 3 (Madurai West)</SelectItem>
                      <SelectItem value="Zone 4 (Vaikunth Nagar)">Zone 4 (Vaikunth Nagar)</SelectItem>
                      <SelectItem value="Zone 5 (Goripalayam)">Zone 5 (Goripalayam)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Issue Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger><SelectValue placeholder="What is wrong?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Overflowing Dustbin">Overflowing Dustbin</SelectItem>
                      <SelectItem value="Drainage Leakage">Drainage Leakage</SelectItem>
                      <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                      <SelectItem value="Littering">Littering on Street</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specific Location / Landmarks</Label>
                <Input placeholder="e.g. Near Mattuthavani Bus Stand" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Photo Proof (Deep Learning Analysis)</Label>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  {capturedImage ? (
                    <img src={capturedImage} alt="Captured proof" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        playsInline
                      />
                      {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/60">
                           <Alert variant="destructive" className="bg-background">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera access to take a photo of the issue.
                              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={getCameraPermission}>
                                Try Again
                              </Button>
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                      {hasCameraPermission === null && (
                         <Button onClick={getCameraPermission} variant="secondary" className="gap-2">
                            <Camera className="h-4 w-4" /> Enable Camera
                         </Button>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 mt-2">
                  {!capturedImage && hasCameraPermission && (
                    <Button type="button" onClick={capturePhoto} className="flex-1 font-bold gap-2">
                      <Camera className="h-4 w-4" /> Take Photo
                    </Button>
                  )}
                  {capturedImage && (
                    <Button type="button" onClick={retakePhoto} variant="outline" className="flex-1 font-bold gap-2">
                      <RefreshCw className="h-4 w-4" /> Retake
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full font-bold h-12 text-lg gap-2" 
                onClick={() => handleSubmit('public')}
                disabled={submitting || (!capturedImage && hasCameraPermission !== false)}
              >
                {submitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Verifying Image...</>
                ) : (
                  <><Send className="h-5 w-5" /> Submit for AI Review</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="private">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Request Private Service</CardTitle>
              <CardDescription>Scheduled waste collection or cleaning for your premises</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zone 1 (Central)">Zone 1 (Central)</SelectItem>
                      <SelectItem value="Zone 2 (Anna Nagar)">Zone 2 (Anna Nagar)</SelectItem>
                      <SelectItem value="Zone 3 (Madurai West)">Zone 3 (Madurai West)</SelectItem>
                      <SelectItem value="Zone 4 (Vaikunth Nagar)">Zone 4 (Vaikunth Nagar)</SelectItem>
                      <SelectItem value="Zone 5 (Goripalayam)">Zone 5 (Goripalayam)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Enter your full home/office address" value={address} onChange={e => setAddress(e.target.value)} />
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
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">My Requests & History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic">
                No requests found.
              </div>
            ) : (
              myRequests.map(task => (
                <div key={task.id} className="flex gap-4 p-3 rounded-xl bg-secondary/30 border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {task.type === 'Citizen Private' ? <Home className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm truncate max-w-[150px]">{task.name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{task.status}</span>
                    </div>
                    {task.assignedTo && task.status !== 'Completed' && (
                      <p className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Auto-assigned to {users.find(u => u.id === task.assignedTo)?.name || 'Worker'}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-accent/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Rewards Center</CardTitle>
            <CardDescription>Earn credits for helping CleanMadurai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> AI-Verified Public Report</span>
                <span className="font-bold text-emerald-600">+50 Points</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Photo Verification</span>
                <span className="font-bold text-emerald-600">+20 Points</span>
              </div>
              <div className="flex items-center justify-between text-sm opacity-50">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nearby Hotspot Bonus</span>
                <span className="font-bold">+10 Points</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-3 border-t">Points are automatically credited upon successful Deep Learning verification.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
