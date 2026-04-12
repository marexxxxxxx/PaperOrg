import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Agent, AgentRole, CreateAgentInput, UpdateAgentInput } from '../../../../shared/types'

const API = '/api'

async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API}/agents`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

async function fetchRoles(): Promise<AgentRole[]> {
  const res = await fetch(`${API}/roles`)
  if (!res.ok) throw new Error('Failed to fetch roles')
  return res.json()
}

export function useAgents() {
  const queryClient = useQueryClient()

  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  })

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      const res = await fetch(`${API}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create agent')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateAgentInput }) => {
      const res = await fetch(`${API}/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update agent')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/agents/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete agent')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  return {
    agents,
    roles,
    isLoading: isLoadingAgents || isLoadingRoles,
    createAgent: createMutation.mutateAsync,
    updateAgent: (id: string, input: UpdateAgentInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteAgent: deleteMutation.mutateAsync,
  }
}