import { useEffect, useRef, useState, useCallback } from 'react'
import { getAccessToken } from '@/lib/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_URL = API_URL.replace(/^http/, 'ws')

export interface LogLine {
  id: number
  text: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'OTHER'
  ts: number
}

function detectLevel(text: string): LogLine['level'] {
  if (text.includes('ERROR') || text.includes('❌')) return 'ERROR'
  if (text.includes('WARNING') || text.includes('WARN')) return 'WARN'
  if (text.includes('INFO') || text.includes('🚀')) return 'INFO'
  return 'OTHER'
}

export function useWebSocketLogs(accountId: string | null, token: string | null) {
  const [lines, setLines] = useState<LogLine[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const idRef = useRef(0)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!accountId || !token) return
    wsRef.current?.close()
    const ws = new WebSocket(`${WS_URL}/ws/logs/${accountId}?token=${token}`)
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      reconnectRef.current = setTimeout(connect, 3000)
    }
    ws.onerror = () => ws.close()
    ws.onmessage = (e) => {
      const text = e.data as string
      setLines(prev => {
        const next = [...prev, { id: idRef.current++, text, level: detectLevel(text), ts: Date.now() }]
        return next.length > 500 ? next.slice(-500) : next
      })
    }
  }, [accountId, token])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const clear = useCallback(() => setLines([]), [])
  return { lines, connected, clear }
}
