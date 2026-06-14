import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TradesPage, TradeSummary } from '@/types/api'

interface TradeFilters {
  page?: number
  date_from?: string
  date_to?: string
  result_filter?: 'win' | 'loss' | null
}

export function useTrades(accountId: string | null, filters: TradeFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.result_filter) params.set('result_filter', filters.result_filter)
  return useQuery<TradesPage>({
    queryKey: ['trades', accountId, filters],
    queryFn: () => api.get(`/trades/${accountId}?${params}`).then(r => r.data),
    enabled: !!accountId,
  })
}

export function useTradeSummary(accountId: string | null) {
  return useQuery<TradeSummary>({
    queryKey: ['trades-summary', accountId],
    queryFn: () => api.get(`/trades/${accountId}/summary`).then(r => r.data),
    enabled: !!accountId,
  })
}
