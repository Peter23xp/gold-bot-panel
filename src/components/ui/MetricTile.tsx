interface MetricTileProps {
  label: string
  value: string
  sub?: string
  valueStyle?: React.CSSProperties
}

export function MetricTile({ label, value, sub, valueStyle }: MetricTileProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'oklch(0.105 0 0)',
        border: '1px solid oklch(0.18 0 0)',
      }}
    >
      <p className="text-xs font-medium mb-2.5" style={{ color: 'oklch(0.42 0 0)' }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold tracking-tight tabular-nums leading-none"
        style={{
          color: 'oklch(0.95 0 0)',
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          ...valueStyle,
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-2" style={{ color: 'oklch(0.38 0 0)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}
