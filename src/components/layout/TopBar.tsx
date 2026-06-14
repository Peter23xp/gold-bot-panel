import { useAccountStore } from '@/store/accountStore'
import { useBotStatus } from '@/hooks/useBotStatus'

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const { selectedAccountId } = useAccountStore()
  const { data: status, isFetching, isError } = useBotStatus(selectedAccountId)

  const connected = !!status && !isError

  return (
    <header className="app-shell__topbar">
      <h1
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'oklch(0.90 0 0)',
        }}
      >
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connected ? 'oklch(0.70 0.150 155)' : 'oklch(0.38 0 0)',
            animation: connected && !isFetching ? 'pulse-dot 2.5s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: connected ? 'oklch(0.55 0.100 155)' : 'oklch(0.35 0 0)',
          }}
        >
          {connected ? 'API connected' : selectedAccountId ? 'Connecting…' : 'No account'}
        </span>
      </div>
    </header>
  )
}
