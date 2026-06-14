import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Account } from '@/types/api'

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data),
  })
}
