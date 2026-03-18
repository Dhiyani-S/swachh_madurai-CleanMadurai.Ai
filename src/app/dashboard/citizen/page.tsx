
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Send, Trash2, Home, RefreshCw, Award, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { verifyPublicReport } from "@/ai/flows/verify-public-report-flow"
import { translations } from "@/lib/translations"

export default function CitizenDashboard() {
  const { toast } = useToast()
  const { addTask, currentUser, addNotification, language } = useStore()
  const [submitting, setSubmitting] = React.useState(false)
  const [selectedZone, setSelectedZone] = React.useState<string>("")
  const [address, setAddress] = React.useState<string>("")
  const [issueType, setIssueType] = React.useState<string>("")
  const [mounted, setMounted] = React.useState(false)
  
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const t = translations[language || 'en'];

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Enable camera to report.' });
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
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSubmit = async (type: 'public' | 'private') => {
    if (!selectedZone || !address || !issueType) {
      toast({ variant: 'destructive', title: "Missing Information", description: "Select zone, address, and issue type." });
      return;
    }
    
    // Extract short zone code (e.g., "ZA")
    const zoneCode = selectedZone.split(' ')[0];

    setSubmitting(true)
    try {
      if (type === 'public' && capturedImage) {
        const aiResult = await verifyPublicReport({ photoDataUri: capturedImage, description: `${issueType} at ${address}` });
        if (!aiResult.isValid) {
          toast({ variant: 'destructive', title: "Rejected", description: aiResult.reasoning });
          setSubmitting(false); return;
        }
        
        addTask({
          id: `task-${Date.now()}`,
          work: `Citizen Report: ${issueType}`,
          place: address,
          status: 'pending',
          source: 'citizen_public',
          zone: zoneCode,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
          imageProof: capturedImage,
        });

        addNotification({
          title: "Report Submitted",
          message: `Your report for ${issueType} in Zone ${zoneCode} is being reviewed by the Zone Admin.`,
          type: 'success'
        });

        toast({ title: "Submitted", description: "AI verified issue. Request sent to Zone Admin." });
      } else {
        addTask({
          id: `task-${Date.now()}`,
          work: 'Private Collection Request',
          place: address,
          status: 'pending',
          source: 'citizen_private',
          zone: zoneCode,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
        });
        toast({ title: "Submitted", description: "Request sent to Zone Admin." });
      }
      setAddress(""); setCapturedImage(null); setSelectedZone(""); setIssueType("");
    } catch (e) {
      toast({ variant: 'destructive', title: "System Error", description: "AI service busy." });
    } finally { setSubmitting(false); }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">{t.citizenPortal}</h1>
          <p className="text-white/40 font-medium">{t.tagline}</p>
        </div>
        <Card className="bg-primary/10 border-primary/20 px-6 py-3 rounded-[2rem] glass-panel">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.rewards}</p>
              <p className="text-2xl font-headline font-bold text-primary">{currentUser?.rewardPoints || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 h-16 rounded-[2rem] border border-white/10">
          <TabsTrigger value="public" className="rounded-3xl font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-black flex gap-2"><Trash2 className="h-5 w-5" /> {t.publicComplaint}</TabsTrigger>
          <TabsTrigger value="private" className="rounded-3xl font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-black flex gap-2"><Home className="h-5 w-5" /> {t.privateService}</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="pt-6">
          <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
            <CardHeader>
              <CardTitle className="font-headline text-primary text-2xl flex items-center gap-2"><Zap className="h-6 w-6 fill-primary" /> AI Smart Verification</CardTitle>
              <CardDescription className="text-white/60">Reports are instantly verified by DL models and routed to Zone Admins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">City Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950/90 border-white/10 text-white rounded-2xl backdrop-blur-xl">
                      <SelectItem value="ZA - Zone A (North)">Zone A (North)</SelectItem>
                      <SelectItem value="ZB - Zone B (South)">Zone B (South)</SelectItem>
                      <SelectItem value="ZC - Zone C (East)">Zone C (East)</SelectItem>
                      <SelectItem value="ZD - Zone D (West)">Zone D (West)</SelectItem>
                      <SelectItem value="ZE - Zone E (Central)">Zone E (Central)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Issue Category</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="Select Issue" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950/90 border-white/10 text-white rounded-2xl backdrop-blur-xl">
                      <SelectItem value="Overflowing Dustbin">Overflowing Dustbin</SelectItem>
                      <SelectItem value="Drainage Leakage">Drainage Leakage</SelectItem>
                      <SelectItem value="Public Littering">Public Littering</SelectItem>
                      <SelectItem value="Waste Dumping">Waste Dumping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{t.location}</Label>
                <Input placeholder="Enter street name, house number or landmark" value={address} onChange={e => setAddress(e.target.value)} className="h-14 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{t.captureImage}</Label>
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video border-2 border-dashed border-white/10">
                  {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover" /> : <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />}
                </div>
                <div className="flex gap-4 mt-4">
                  {!capturedImage ? <Button onClick={getCameraPermission} className="flex-1 h-14 rounded-2xl font-bold gap-2"><Camera className="h-5 w-5" /> Start Camera</Button> : <Button onClick={() => setCapturedImage(null)} variant="outline" className="flex-1 h-14 rounded-2xl font-bold"><RefreshCw className="h-5 w-5" /> Retake Photo</Button>}
                  {!capturedImage && hasCameraPermission && <Button onClick={capturePhoto} className="flex-1 h-14 rounded-2xl font-bold bg-primary text-black">Capture Photo</Button>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-16 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/20" onClick={() => handleSubmit('public')} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />} {t.submit} Verification
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="private" className="pt-6">
          <Card className="rounded-[3rem] border-none shadow-2xl glass-panel">
            <CardHeader>
              <CardTitle className="font-headline text-primary text-2xl flex items-center gap-2"><Home className="h-6 w-6" /> {t.privateBooking}</CardTitle>
              <CardDescription className="text-white/60">Doorstep collection services for Madurai households.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">City Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950/90 border-white/10 text-white rounded-2xl backdrop-blur-xl">
                      <SelectItem value="ZA - Zone A (North)">Zone A (North)</SelectItem>
                      <SelectItem value="ZB - Zone B (South)">Zone B (South)</SelectItem>
                      <SelectItem value="ZC - Zone C (East)">Zone C (East)</SelectItem>
                      <SelectItem value="ZD - Zone D (West)">Zone D (West)</SelectItem>
                      <SelectItem value="ZE - Zone E (Central)">Zone E (Central)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Collection Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="Select Service" /></SelectTrigger>
                    <SelectContent className="bg-zinc-950/90 border-white/10 text-white rounded-2xl backdrop-blur-xl">
                      <SelectItem value="Daily Domestic Waste">Daily Domestic Waste</SelectItem>
                      <SelectItem value="Bulk/Furniture Waste">Bulk/Furniture Waste</SelectItem>
                      <SelectItem value="Construction Debris">Construction Debris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Full Doorstep Address</Label>
                <Input placeholder="House No, Street, Main Landmark" value={address} onChange={e => setAddress(e.target.value)} className="h-14 rounded-2xl" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6">
               <div className="w-full p-6 bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex items-center justify-between">
                 <span className="text-sm font-bold uppercase tracking-widest text-white/60">Booking Fee:</span>
                 <span className="text-3xl font-headline font-bold text-primary">₹150.00</span>
               </div>
               <Button className="w-full h-16 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/20" onClick={() => handleSubmit('private')} disabled={submitting}>
                 {submitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />} Pay & Request Dispatch
               </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
