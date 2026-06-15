import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAccountStore } from '@/store/accountStore'
import type { Account } from '@/types/api'

export function useAccounts() {
  const { selectedAccountId, setSelectedAccountId } = useAccountStore()

  const query = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data),
  })

  // Auto-select the first account if none is selected
  useEffect(() => {
    if (query.data && query.data.length > 0 && !selectedAccountId) {
      setSelectedAccountId(query.data[0].id)
    }
  }, [query.data, selectedAccountId, setSelectedAccountId])

  return query
}
