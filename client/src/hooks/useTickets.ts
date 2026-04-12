import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Ticket, CreateTicketInput, UpdateTicketInput } from '../../../shared/types'

const API = '/api'

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API}/tickets`)
  if (!res.ok) throw new Error('Failed to fetch tickets')
  return res.json()
}

async function fetchAgents(): Promise<any[]> {
  const res = await fetch(`${API}/agents`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export function useTickets() {
  const queryClient = useQueryClient()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  })

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const res = await fetch(`${API}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create ticket')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTicketInput }) => {
      const res = await fetch(`${API}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update ticket')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/tickets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete ticket')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  return {
    tickets,
    agents,
    isLoading,
    createTicket: createMutation.mutateAsync,
    updateTicket: (id: string, input: UpdateTicketInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteTicket: deleteMutation.mutateAsync,
  }
}