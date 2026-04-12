import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AgentRole, CreateRoleInput, UpdateRoleInput } from '../../../../shared/types'

const API = '/api'

async function fetchRoles(): Promise<AgentRole[]> {
  const res = await fetch(`${API}/roles`)
  if (!res.ok) throw new Error('Failed to fetch roles')
  return res.json()
}

export function useRoles() {
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateRoleInput) => {
      const res = await fetch(`${API}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create role')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRoleInput }) => {
      const res = await fetch(`${API}/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update role')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/roles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete role')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  return {
    roles,
    isLoading,
    createRole: createMutation.mutateAsync,
    updateRole: (id: string, input: UpdateRoleInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteRole: deleteMutation.mutateAsync,
  }
}