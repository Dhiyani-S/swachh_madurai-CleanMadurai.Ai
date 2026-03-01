
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Award, Zap, Gift, Trophy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WorkerRewards() {
  const { currentUser } = useStore()
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Achievements</h1>
        <p className="text-muted-foreground">Redeem your hard-earned points for benefits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent fill-accent" /> Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-headline font-bold">{currentUser?.rewardPoints || 0}</p>
            <p className="text-xs mt-2 text-primary-foreground/70">Estimated Value: ₹{(currentUser?.rewardPoints || 0) * 2}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Active Perks</CardTitle>
            <CardDescription>Available benefits for your current point tier</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
               {[
                 { name: 'Priority Health Checkup', cost: 500, icon: CheckCircle2 },
                 { name: 'Monthly Transport Subsidy', cost: 1200, icon: CheckCircle2 },
                 { name: 'Family Grocery Voucher', cost: 2500, icon: Trophy },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                   <div className="flex items-center gap-4">
                     <item.icon className="h-5 w-5 text-primary" />
                     <div>
                       <p className="font-bold text-sm">{item.name}</p>
                       <p className="text-[10px] text-muted-foreground">{item.cost} Points required</p>
                     </div>
                   </div>
                   <Button variant="outline" size="sm" className="h-8 text-xs font-bold" disabled={(currentUser?.rewardPoints || 0) < item.cost}>
                     Redeem
                   </Button>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
