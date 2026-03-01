import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'Green' | 'Yellow' | 'Red'
  className?: string
  label?: string
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const styles = {
    Green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Yellow: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Red: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
      styles[status],
      className
    )}>
      {label || status}
    </div>
  )
}