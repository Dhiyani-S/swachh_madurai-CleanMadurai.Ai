
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
  const { tasks, addTask, currentUser, addCitizenRewards, users, language } = useStore()
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
    if (!selectedZone || !address) {
      toast({ variant: 'destructive', title: "Missing Information", description: "Select zone and address." });
      return;
    }
    setSubmitting(true)
    try {
      if (type === 'public' && capturedImage) {
        const aiResult = await verifyPublicReport({ photoDataUri: capturedImage, description: `${issueType} at ${address}` });
        if (!aiResult.isValid) {
          toast({ variant: 'destructive', title: "Rejected", description: aiResult.reasoning });
          setSubmitting(false); return;
        }
        const zoneWorkers = users.filter(u => u.role === 'Worker' && u.zoneId === selectedZone);
        addTask({
          id: `task-${Date.now()}`,
          name: `Verified: ${issueType}`,
          location: address,
          status: 'Pending',
          type: 'Citizen Public',
          wardId: 'AUTO',
          zoneId: selectedZone,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
          imageProof: capturedImage,
          assignedTo: zoneWorkers[0]?.id
        });
        addCitizenRewards(currentUser?.id || "", 50);
        toast({ title: "Reported!", description: "AI verified issue. +50 Points earned." });
      } else {
        addTask({
          id: `task-${Date.now()}`,
          name: 'Private Collection Request',
          location: address,
          status: 'Pending',
          type: 'Citizen Private',
          wardId: 'AUTO',
          zoneId: selectedZone,
          createdAt: new Date().toISOString(),
          citizenId: currentUser?.id,
        });
        toast({ title: "Submitted", description: "Request sent." });
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
          <h1 className="text-3xl font-headline font-bold text-primary">{t.citizenPortal}</h1>
          <p className="text-muted-foreground">{t.tagline}</p>
        </div>
        <Card className="bg-primary/5 border-primary/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.rewards}</p>
              <p className="text-xl font-headline font-bold text-primary">{currentUser?.rewardPoints || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 h-12">
          <TabsTrigger value="public" className="font-bold flex gap-2"><Trash2 className="h-4 w-4" /> {t.publicComplaint}</TabsTrigger>
          <TabsTrigger value="private" className="font-bold flex gap-2"><Home className="h-4 w-4" /> {t.privateService}</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-rose-600 flex items-center gap-2"><Zap className="h-6 w-6 fill-rose-600" /> {t.aiVerification}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZA - Zone A (North)">Zone A (North)</SelectItem>
                      <SelectItem value="ZB - Zone B (South)">Zone B (South)</SelectItem>
                      <SelectItem value="ZC - Zone C (East)">Zone C (East)</SelectItem>
                      <SelectItem value="ZD - Zone D (West)">Zone D (West)</SelectItem>
                      <SelectItem value="ZE - Zone E (Central)">Zone E (Central)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger><SelectValue placeholder="Issue Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Overflowing Dustbin">Overflowing Dustbin</SelectItem>
                      <SelectItem value="Drainage Leakage">Drainage Leakage</SelectItem>
                      <SelectItem value="Littering">Littering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.location}</Label>
                <Input placeholder="Landmarks" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.captureImage}</Label>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover" /> : <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />}
                </div>
                <div className="flex gap-2 mt-2">
                  {!capturedImage ? <Button onClick={getCameraPermission} className="flex-1 font-bold gap-2"><Camera className="h-4 w-4" /> Start Camera</Button> : <Button onClick={() => setCapturedImage(null)} variant="outline" className="flex-1 font-bold"><RefreshCw className="h-4 w-4" /> Retake</Button>}
                  {!capturedImage && hasCameraPermission && <Button onClick={capturePhoto} className="flex-1 font-bold">Capture</Button>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full font-bold h-12" onClick={() => handleSubmit('public')} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : <Send />} {t.submit}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
