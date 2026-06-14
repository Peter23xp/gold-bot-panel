import { useAccountStore } from '@/store/accountStore'
import { useBotStatus } from '@/hooks/useBotStatus'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const { selectedAccountId } = useAccountStore()
  const { data: status } = useBotStatus(selectedAccountId)

  return (
    <header
      className="fixed left-60 right-0 top-0 h-14 flex items-center px-6 justify-between z-10"
      style={{
        background: 'oklch(0.07 0 0 / 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid oklch(0.16 0 0)',
      }}
    >
      <h1 className="text-sm font-semibold" style={{ color: 'oklch(0.90 0 0)' }}>
        {title}
      </h1>
      {status && <StatusBadge status={status.status} />}
    </header>
  )
}
