import { useEffect, useRef, useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useWebSocketLogs } from '@/hooks/useWebSocketLogs'
import { Terminal, ChevronsDown, Trash2, Wifi, WifiOff } from 'lucide-react'

type Level = 'INFO' | 'WARN' | 'ERROR' | 'OTHER'

const levelStyle: Record<Level, React.CSSProperties> = {
  INFO:  { color: 'oklch(0.60 0 0)' },
  WARN:  { color: 'oklch(0.78 0.160 60)' },
  ERROR: { color: 'oklch(0.62 0.180 25)' },
  OTHER: { color: 'oklch(0.45 0 0)' },
}

const filterConfig: { level: Level; activeStyle: React.CSSProperties }[] = [
  {
    level: 'INFO',
    activeStyle: {
      color: 'oklch(0.68 0 0)',
      background: 'oklch(0.65 0 0 / 0.10)',
      borderColor: 'oklch(0.45 0 0)',
    },
  },
  {
    level: 'WARN',
    activeStyle: {
      color: 'oklch(0.82 0.160 60)',
      background: 'oklch(0.78 0.160 60 / 0.10)',
      borderColor: 'oklch(0.65 0.140 60)',
    },
  },
  {
    level: 'ERROR',
    activeStyle: {
      color: 'oklch(0.70 0.150 25)',
      background: 'oklch(0.57 0.200 25 / 0.10)',
      borderColor: 'oklch(0.50 0.180 25)',
    },
  },
]

const inactiveStyle: React.CSSProperties = {
  color: 'oklch(0.35 0 0)',
  background: 'transparent',
  borderColor: 'oklch(0.20 0 0)',
}

export function LogsPage() {
  const { selectedAccountId } = useAccountStore()
  const [activeFilters, setActiveFilters] = useState<Set<Level>>(new Set(['INFO', 'WARN', 'ERROR', 'OTHER']))
  const [autoScroll, setAutoScroll] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const cookieToken = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? null
  const { lines, connected, clear } = useWebSocketLogs(selectedAccountId, cookieToken)
  const filtered = lines.filter(l => activeFilters.has(l.level))

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [filtered.length, autoScroll])

  function toggleFilter(level: Level) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(level) ? next.delete(level) : next.add(level)
      return next
    })
  }

  if (!selectedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Terminal size={32} style={{ color: 'oklch(0.22 0 0)' }} strokeWidth={1} />
        <p className="text-sm" style={{ color: 'oklch(0.38 0 0)' }}>
          Select an account to view logs
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 56px - 48px)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 mr-2">
          {connected ? (
            <Wifi size={12} style={{ color: 'oklch(0.70 0.150 155)' }} strokeWidth={2} />
          ) : (
            <WifiOff size={12} style={{ color: 'oklch(0.42 0 0)' }} strokeWidth={2} />
          )}
          <span
            className="text-xs font-medium"
            style={{ color: connected ? 'oklch(0.60 0.120 155)' : 'oklch(0.38 0 0)' }}
          >
            {connected ? 'Live' : 'Reconnecting…'}
          </span>
        </div>

        <div className="w-px h-4 mx-1" style={{ background: 'oklch(0.20 0 0)' }} />

        {/* Level filters */}
        {filterConfig.map(({ level, activeStyle }) => (
          <button
            key={level}
            onClick={() => toggleFilter(level)}
            className="px-2.5 py-1 rounded text-xs font-medium border transition-all duration-150"
            style={activeFilters.has(level) ? activeStyle : inactiveStyle}
          >
            {level}
          </button>
        ))}

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={() => setAutoScroll(a => !a)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all duration-150"
          style={
            autoScroll
              ? {
                  color: 'oklch(0.76 0.149 80)',
                  background: 'oklch(0.76 0.149 80 / 0.08)',
                  borderColor: 'oklch(0.55 0.120 80)',
                }
              : inactiveStyle
          }
        >
          <ChevronsDown size={11} strokeWidth={2} />
          Auto-scroll
        </button>
        <button
          onClick={clear}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all duration-150"
          style={inactiveStyle}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'oklch(0.62 0.180 25)'
            e.currentTarget.style.borderColor = 'oklch(0.40 0.160 25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'oklch(0.35 0 0)'
            e.currentTarget.style.borderColor = 'oklch(0.20 0 0)'
          }}
        >
          <Trash2 size={11} strokeWidth={2} />
          Clear
        </button>
      </div>

      {/* Terminal */}
      <div
        className="flex-1 overflow-y-auto rounded-xl p-4 leading-5 text-xs"
        style={{
          background: 'oklch(0.05 0 0)',
          border: '1px solid oklch(0.15 0 0)',
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}
      >
        {filtered.length === 0 ? (
          <span style={{ color: 'oklch(0.25 0 0)' }}>
            {connected ? 'Waiting for log output…' : 'Connecting…'}
          </span>
        ) : (
          filtered.map(line => (
            <div
              key={line.id}
              className="whitespace-pre-wrap break-all"
              style={{
                ...levelStyle[line.level],
                animation: 'fadeInLine 100ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {line.text}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
