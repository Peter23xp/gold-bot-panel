import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api, setTokens, clearTokens } from '@/lib/api'
import type { User } from '@/types/api'

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then(r => r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const res = await api.post('/auth/login', body)
      return res.data
    },
    onSuccess: (data) => {
      // Store the tokens from the login response
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token || '')
      }

      // Now fetch the user profile with the stored token
      api.get('/users/me').then(res => {
        queryClient.setQueryData(['me'], res.data)
      }).catch(() => {
        // Even if /users/me fails, the token is stored
        // AppShell will retry on mount
      })

      navigate('/dashboard', { replace: true })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      // Clear tokens and cache regardless of API response
      clearTokens()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}

/**
 * Hook to listen for auth:expired events from the API interceptor.
 * Place this in a top-level component (e.g., App).
 */
export function useAuthExpiredListener() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpired() {
      queryClient.clear()
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [queryClient, navigate])
}
