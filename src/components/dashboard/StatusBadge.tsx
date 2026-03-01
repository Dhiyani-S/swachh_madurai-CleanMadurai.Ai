
"use client"

import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { translations } from "@/lib/translations"

interface StatusBadgeProps {
  status: 'Green' | 'Yellow' | 'Red'
  className?: string
  label?: string
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const { language } = useStore()
  const t = translations[language || 'en']

  const styles = {
    Green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Yellow: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Red: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }

  // Helper to translate status labels if they are common ones
  const getTranslatedLabel = (l?: string) => {
    if (!l) return t[status.toLowerCase() as keyof typeof t] || status;
    
    const lowerL = l.toLowerCase();
    if (lowerL === 'pending') return t.pending;
    if (lowerL === 'in progress') return t.inProgress;
    if (lowerL === 'completed') return t.completed;
    return l;
  }

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
      styles[status],
      className
    )}>
      {getTranslatedLabel(label)}
    </div>
  )
}
