import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardData, PnlChart } from '@/types/api'

export function useDashboard(accountId: string | null) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', accountId],
    queryFn: () => api.get(`/dashboard/${accountId}`).then(r => r.data),
    enabled: !!accountId,
    refetchInterval: 30000,
  })
}

export function usePnlChart(accountId: string | null, days = 7) {
  return useQuery<PnlChart>({
    queryKey: ['pnl-chart', accountId, days],
    queryFn: () => api.get(`/dashboard/${accountId}/pnl/chart?days=${days}`).then(r => r.data),
    enabled: !!accountId,
  })
}
