import { useAccountStore } from '@/store/accountStore'
import { useBotStatus } from '@/hooks/useBotStatus'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const { selectedAccountId } = useAccountStore()
  const { data: status } = useBotStatus(selectedAccountId)
  return (
    <header className="fixed left-60 right-0 top-0 h-14 bg-[oklch(0.09_0_0_/_0.95)] backdrop-blur-sm border-b border-[oklch(0.20_0_0)] flex items-center px-6 justify-between z-10">
      <h1 className="text-base font-semibold text-[oklch(0.95_0_0)]">{title}</h1>
      {status && <StatusBadge status={status.status} />}
    </header>
  )
}
