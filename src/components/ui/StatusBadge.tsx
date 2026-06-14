import { cn } from '@/lib/utils'

type Status = 'running' | 'stopped' | 'error'

const config = {
  running: {
    label: 'RUNNING',
    dot: 'bg-[oklch(0.70_0.150_155)] animate-[pulse-dot_2s_ease-in-out_infinite]',
    text: 'text-[oklch(0.70_0.150_155)]',
    bg: 'bg-[oklch(0.70_0.150_155_/_0.12)]',
  },
  stopped: {
    label: 'STOPPED',
    dot: 'bg-[oklch(0.42_0_0)]',
    text: 'text-[oklch(0.65_0_0)]',
    bg: 'bg-[oklch(0.42_0_0_/_0.15)]',
  },
  error: {
    label: 'ERROR',
    dot: 'bg-[oklch(0.57_0.200_25)] animate-[flash-dot_1s_ease-in-out_infinite]',
    text: 'text-[oklch(0.57_0.200_25)]',
    bg: 'bg-[oklch(0.57_0.200_25_/_0.12)]',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}
