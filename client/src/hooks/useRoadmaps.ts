import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Roadmap, CreateRoadmapInput, UpdateRoadmapInput } from '../../../shared/types'

const API = '/api'

async function fetchRoadmaps(): Promise<Roadmap[]> {
  const res = await fetch(`${API}/roadmaps`)
  if (!res.ok) throw new Error('Failed to fetch roadmaps')
  return res.json()
}

export function useRoadmaps() {
  const queryClient = useQueryClient()

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: fetchRoadmaps,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateRoadmapInput) => {
      const res = await fetch(`${API}/roadmaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create roadmap')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRoadmapInput }) => {
      const res = await fetch(`${API}/roadmaps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update roadmap')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/roadmaps/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete roadmap')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] })
    },
  })

  return {
    roadmaps,
    isLoading,
    createRoadmap: createMutation.mutateAsync,
    updateRoadmap: (id: string, input: UpdateRoadmapInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteRoadmap: deleteMutation.mutateAsync,
  }
}