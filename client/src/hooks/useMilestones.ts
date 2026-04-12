import { useState, useEffect } from 'react'
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from '../../../shared/types'

const API_URL = 'http://localhost:3001/api'

export function useMilestones(roadmapId?: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setIsLoading(true)
        const url = roadmapId 
          ? `${API_URL}/milestones?roadmap_id=${roadmapId}`
          : `${API_URL}/milestones`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch milestones')
        const data = await res.json()
        setMilestones(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchMilestones()
  }, [roadmapId])

  const createMilestone = async (data: CreateMilestoneInput): Promise<Milestone> => {
    const res = await fetch(`${API_URL}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create milestone')
    const milestone = await res.json()
    setMilestones(prev => [...prev, milestone])
    return milestone
  }

  const updateMilestone = async (id: string, data: UpdateMilestoneInput): Promise<Milestone> => {
    const res = await fetch(`${API_URL}/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update milestone')
    const milestone = await res.json()
    setMilestones(prev => prev.map(m => m.id === id ? milestone : m))
    return milestone
  }

  const deleteMilestone = async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/milestones/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete milestone')
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  return { milestones, isLoading, error, createMilestone, updateMilestone, deleteMilestone }
}