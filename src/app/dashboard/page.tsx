
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore, UserRole } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const { currentUser } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
      return
    }

    const routes: Record<UserRole, string> = {
      'Corporation Commissioner': '/dashboard/commissioner',
      'Ward Admin': '/dashboard/ward-admin',
      'Zone Admin': '/dashboard/zone-admin',
      'Worker': '/dashboard/worker',
      'Citizen': '/dashboard/citizen',
    }

    router.push(routes[currentUser.role])
  }, [currentUser, router])

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  )
}
