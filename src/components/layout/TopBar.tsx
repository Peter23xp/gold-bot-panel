import { useAccountStore } from '@/store/accountStore'
import { useBotStatus } from '@/hooks/useBotStatus'

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const { selectedAccountId } = useAccountStore()
  const { data: status, isFetching, isError } = useBotStatus(selectedAccountId)

  const connected = !!status && !isError

  return (
    <header
      className="fixed left-60 right-0 top-0 h-14 flex items-center px-6 justify-between"
      style={{
        background: 'oklch(0.07 0 0 / 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid oklch(0.12 0 0)',
        zIndex: 200,
      }}
    >
      <h1 className="text-sm font-semibold" style={{ color: 'oklch(0.90 0 0)' }}>
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: connected ? 'oklch(0.70 0.150 155)' : 'oklch(0.38 0 0)',
            animation: connected && !isFetching ? 'pulse-dot 2.5s ease-in-out infinite' : 'none',
          }}
        />
        <span
          className="text-xs font-medium"
          style={{ color: connected ? 'oklch(0.55 0.100 155)' : 'oklch(0.35 0 0)' }}
        >
          {connected ? 'API connected' : selectedAccountId ? 'Connecting…' : 'No account'}
        </span>
      </div>
    </header>
  )
}
