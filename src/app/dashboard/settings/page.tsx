"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { User, Bell, Shield, Smartphone, Globe, Save, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { currentUser, setCurrentUser, updateUser } = useStore()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  const [name, setName] = React.useState(currentUser?.name || "")
  const [email, setEmail] = React.useState(currentUser?.id + "@madurai.gov.in")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !currentUser) return null

  const handleSave = () => {
    updateUser(currentUser.id, { name })
    toast({
      title: "Settings Saved",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Settings & Preferences</h1>
        <p className="text-muted-foreground">Manage your account settings and system preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
            <CardDescription>Update your personal details visible to the corporation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account Role</Label>
                <Input id="role" value={currentUser.role} disabled className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Assigned Jurisdiction</Label>
                <Input id="zone" value={currentUser.zoneId || "City-wide"} disabled className="bg-secondary/50" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/20 justify-end rounded-b-lg">
            <Button onClick={handleSave} className="gap-2 font-bold"><Save className="h-4 w-4" /> Save Changes</Button>
          </CardFooter>
        </Card>

        {/* System Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive real-time task alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Daily performance summaries</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Auth</Label>
                  <p className="text-xs text-muted-foreground">Extra security for your ID</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <Button variant="outline" className="w-full text-xs h-9">Change System Password</Button>
            </CardContent>
          </Card>
        </div>

        {/* Localization & App */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5" /> Application Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Language</Label>
                <p className="text-xs text-muted-foreground">Choose your interface language</p>
              </div>
              <select className="bg-secondary border-none text-sm p-2 rounded-md font-medium outline-none">
                <option>English</option>
                <option>Tamil (தமிழ்)</option>
              </select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">Better visibility for outdoor work</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-destructive">Sign Out</h4>
              <p className="text-xs text-muted-foreground">Safely logout of the CleanMadurai system</p>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="gap-2"><LogOut className="h-4 w-4" /> Logout Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}