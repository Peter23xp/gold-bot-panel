type Status = 'running' | 'stopped' | 'error'

const config: Record<Status, {
  label: string
  dotStyle: React.CSSProperties
  dotAnimation?: string
  style: React.CSSProperties
}> = {
  running: {
    label: 'Running',
    dotStyle: { background: 'oklch(0.70 0.150 155)' },
    dotAnimation: 'pulse-dot 2s ease-in-out infinite',
    style: {
      background: 'oklch(0.70 0.150 155 / 0.10)',
      color: 'oklch(0.72 0.150 155)',
      border: '1px solid oklch(0.70 0.150 155 / 0.20)',
    },
  },
  stopped: {
    label: 'Stopped',
    dotStyle: { background: 'oklch(0.38 0 0)' },
    style: {
      background: 'oklch(0.38 0 0 / 0.12)',
      color: 'oklch(0.52 0 0)',
      border: '1px solid oklch(0.28 0 0)',
    },
  },
  error: {
    label: 'Error',
    dotStyle: { background: 'oklch(0.57 0.200 25)' },
    dotAnimation: 'flash-dot 1s ease-in-out infinite',
    style: {
      background: 'oklch(0.57 0.200 25 / 0.10)',
      color: 'oklch(0.68 0.150 25)',
      border: '1px solid oklch(0.57 0.200 25 / 0.20)',
    },
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={c.style}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          ...c.dotStyle,
          animation: c.dotAnimation,
        }}
      />
      {c.label}
    </span>
  )
}
