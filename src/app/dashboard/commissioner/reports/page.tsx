
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CommissionerReports() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Analytical Reports</h1>
          <p className="text-muted-foreground">Detailed waste management trends and efficiency metrics</p>
        </div>
        <Button className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Waste Collection Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-secondary/20 rounded-xl m-6 mt-0">
            <BarChart3 className="h-12 w-12 text-muted-foreground opacity-20" />
            <span className="text-sm font-medium text-muted-foreground">Historical Trend Visualization</span>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" /> Zone-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-secondary/20 rounded-xl m-6 mt-0">
            <PieChart className="h-12 w-12 text-muted-foreground opacity-20" />
            <span className="text-sm font-medium text-muted-foreground">Zone Efficiency Split</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
