import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BotStatus } from '@/types/api'

export function useBotStatus(accountId: string | null) {
  return useQuery<BotStatus>({
    queryKey: ['bot-status', accountId],
    queryFn: () => api.get(`/bot/${accountId}/status`).then(r => r.data),
    enabled: !!accountId,
    refetchInterval: 10000,
  })
}

export function useBotAction(accountId: string | null) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bot-status', accountId] })
  const start = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/start`), onSuccess: invalidate })
  const stop = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/stop`), onSuccess: invalidate })
  const restart = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/restart`), onSuccess: invalidate })
  return { start, stop, restart }
}
