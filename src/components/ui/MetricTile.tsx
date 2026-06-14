import { cn } from '@/lib/utils'

interface MetricTileProps {
  label: string
  value: string
  valueClass?: string
  sub?: string
}

export function MetricTile({ label, value, valueClass, sub }: MetricTileProps) {
  return (
    <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-[oklch(0.65_0_0)] font-medium uppercase tracking-wide">{label}</span>
      <span className={cn('text-2xl font-bold text-[oklch(0.95_0_0)]', valueClass)}>{value}</span>
      {sub && <span className="text-xs text-[oklch(0.42_0_0)]">{sub}</span>}
    </div>
  )
}
