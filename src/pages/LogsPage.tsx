import { useEffect, useRef, useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useWebSocketLogs } from '@/hooks/useWebSocketLogs'
import { cn } from '@/lib/utils'

type Level = 'INFO' | 'WARN' | 'ERROR' | 'OTHER'

const levelColors: Record<Level, string> = {
  INFO: 'text-[oklch(0.65_0_0)]',
  WARN: 'text-[oklch(0.78_0.160_60)]',
  ERROR: 'text-[oklch(0.57_0.200_25)]',
  OTHER: 'text-[oklch(0.55_0_0)]',
}

export function LogsPage() {
  const { selectedAccountId } = useAccountStore()
  const [activeFilters, setActiveFilters] = useState<Set<Level>>(new Set(['INFO','WARN','ERROR','OTHER']))
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
    return <div className="text-sm text-[oklch(0.42_0_0)]">Select an account to view logs</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px-48px)] gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-[oklch(0.70_0.150_155)]' : 'bg-[oklch(0.42_0_0)]')} />
          <span className="text-xs text-[oklch(0.42_0_0)]">{connected ? 'Connected' : 'Reconnecting…'}</span>
        </div>
        <div className="flex gap-1 ml-auto">
          {(['INFO','WARN','ERROR'] as Level[]).map(level => (
            <button
              key={level}
              onClick={() => toggleFilter(level)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors border',
                activeFilters.has(level)
                  ? level === 'INFO' ? 'border-[oklch(0.65_0_0)] text-[oklch(0.65_0_0)] bg-[oklch(0.65_0_0_/_0.1)]'
                  : level === 'WARN' ? 'border-[oklch(0.78_0.160_60)] text-[oklch(0.78_0.160_60)] bg-[oklch(0.78_0.160_60_/_0.1)]'
                  : 'border-[oklch(0.57_0.200_25)] text-[oklch(0.57_0.200_25)] bg-[oklch(0.57_0.200_25_/_0.1)]'
                  : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)]'
              )}
            >
              {level}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAutoScroll(a => !a)}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium border transition-colors',
            autoScroll
              ? 'border-[oklch(0.76_0.149_80)] text-[oklch(0.76_0.149_80)] bg-[oklch(0.76_0.149_80_/_0.1)]'
              : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)]'
          )}
        >
          Auto-scroll
        </button>
        <button
          onClick={clear}
          className="px-2.5 py-1 rounded text-xs font-medium border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg border border-[oklch(0.20_0_0)] bg-[oklch(0.05_0_0)] p-4 font-mono text-xs leading-5">
        {filtered.length === 0 && (
          <span className="text-[oklch(0.30_0_0)]">No log lines yet…</span>
        )}
        {filtered.map(line => (
          <div
            key={line.id}
            className={cn('whitespace-pre-wrap break-all', levelColors[line.level])}
            style={{ animation: 'fadeInLine var(--duration-fast) var(--ease-out-expo)' }}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
