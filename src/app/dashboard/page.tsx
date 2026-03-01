
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const { currentUser } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
      return
    }

    // Robust route mapping to handle both store-level keys and display roles
    const routes: Record<string, string> = {
      'commissioner': '/dashboard/commissioner',
      'corporation commissioner': '/dashboard/commissioner',
      'ward_admin': '/dashboard/ward-admin',
      'ward admin': '/dashboard/ward-admin',
      'zone_admin': '/dashboard/zone-admin',
      'zone admin': '/dashboard/zone-admin',
      'worker': '/dashboard/worker',
      'citizen': '/dashboard/citizen',
    }

    const roleKey = currentUser.role?.toLowerCase() || ''
    const targetPath = routes[roleKey]

    if (targetPath) {
      router.push(targetPath)
    } else {
      console.error(`Unknown role: ${currentUser.role}. Falling back to landing page.`)
      router.push("/")
    }
  }, [currentUser, router])

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  )
}
