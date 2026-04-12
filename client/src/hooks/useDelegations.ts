import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = '/api'

async function fetchDelegations() {
  const res = await fetch(`${API}/delegations`)
  if (!res.ok) throw new Error('Failed to fetch delegations')
  return res.json()
}

export function useDelegations() {
  const queryClient = useQueryClient()

  const { data: delegations, isLoading } = useQuery({
    queryKey: ['delegations'],
    queryFn: fetchDelegations,
  })

  const createMutation = useMutation({
    mutationFn: async (input: { from_agent_id: string; to_agent_id: string; ticket_id: string; message: string }) => {
      const res = await fetch(`${API}/delegations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create delegation')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${API}/delegations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update delegation')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/delegations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete delegation')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
    },
  })

  return {
    delegations,
    isLoading,
    createDelegation: createMutation.mutateAsync,
    updateDelegation: (id: string, status: string) =>
      updateMutation.mutateAsync({ id, status }),
    deleteDelegation: deleteMutation.mutateAsync,
  }
}