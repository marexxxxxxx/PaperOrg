import { useState, useMemo } from 'react'
import { useRoadmaps } from '@/hooks/useRoadmaps'
import { useMilestones } from '@/hooks/useMilestones'
import { useTickets } from '@/hooks/useTickets'
import { RoadmapCard } from '@/components/RoadmapCard'
import { RoadmapForm } from '@/components/RoadmapForm'
import { MilestoneForm } from '@/components/MilestoneForm'
import { Plus, Search, X, Flag, CheckCircle, Clock, Circle } from 'lucide-react'
import type { Roadmap, Milestone } from '../../../shared/types'

export function RoadmapsPage() {
  const { roadmaps, createRoadmap, updateRoadmap, deleteRoadmap, isLoading } = useRoadmaps()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  const { milestones, createMilestone, updateMilestone, deleteMilestone } = useMilestones(selectedRoadmap?.id)
  const { tickets } = useTickets()

  const filteredRoadmaps = roadmaps?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const getMilestoneProgress = useMemo(() => {
    if (!milestones || !tickets) return {}

    const ticketMap = new Map(tickets.map(t => [t.id, t]))

    return milestones.reduce((acc, m) => {
      let completed = 0
      let total = 0

      for (const ticketId of m.ticket_ids) {
        const t = ticketMap.get(ticketId)
        if (t) {
          total++
          if (t.status === 'closed' || t.status === 'resolved') {
            completed++
          }
        }
      }

      acc[m.id] = total > 0 ? Math.round((completed / total) * 100) : 0
      return acc
    }, {} as Record<string, number>)
  }, [milestones, tickets])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roadmaps</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          <Plus className="w-4 h-4" />
          New Roadmap
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoadmaps?.map((roadmap) => (
            <div 
              key={roadmap.id} 
              onClick={() => setSelectedRoadmap(roadmap)}
              className="cursor-pointer"
            >
              <RoadmapCard
                roadmap={roadmap}
                onEdit={(e) => { e?.stopPropagation(); setEditingId(roadmap.id) }}
                onDelete={(e) => { e?.stopPropagation(); deleteRoadmap(roadmap.id) }}
              />
            </div>
          ))}
        </div>
      )}

      {selectedRoadmap && (
        <RoadmapDetailView
          roadmap={selectedRoadmap}
          milestones={milestones}
          progress={getMilestoneProgress}
          onClose={() => setSelectedRoadmap(null)}
          onAddMilestone={() => { setEditingMilestone(null); setShowMilestoneForm(true) }}
          onEditMilestone={(m) => { setEditingMilestone(m); setShowMilestoneForm(true) }}
          onDeleteMilestone={deleteMilestone}
          onUpdateMilestone={updateMilestone}
        />
      )}

      {showForm && (
        <RoadmapForm
          onSubmit={async (data) => {
            await createRoadmap(data)
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingId && (
        <RoadmapForm
          roadmap={roadmaps?.find((r) => r.id === editingId)}
          onSubmit={async (data) => {
            await updateRoadmap(editingId, data)
            setEditingId(null)
          }}
          onClose={() => setEditingId(null)}
        />
      )}

      {showMilestoneForm && selectedRoadmap && (
        <MilestoneForm
          milestone={editingMilestone || undefined}
          roadmapId={selectedRoadmap.id}
          onSubmit={async (data) => {
            if (editingMilestone) {
              await updateMilestone(editingMilestone.id, data)
            } else {
              await createMilestone(data as Omit<Milestone, 'id'>)
            }
            setShowMilestoneForm(false)
            setEditingMilestone(null)
          }}
          onClose={() => { setShowMilestoneForm(false); setEditingMilestone(null) }}
        />
      )}
    </div>
  )
}

interface RoadmapDetailViewProps {
  roadmap: Roadmap
  milestones: Milestone[]
  progress: Record<string, number>
  onClose: () => void
  onAddMilestone: () => void
  onEditMilestone: (m: Milestone) => void
  onDeleteMilestone: (id: string) => void
  onUpdateMilestone: (id: string, data: Partial<Milestone>) => void
}

function RoadmapDetailView({
  roadmap,
  milestones,
  progress,
  onClose,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onUpdateMilestone
}: RoadmapDetailViewProps) {
  const startDate = new Date(roadmap.start_date)
  const endDate = new Date(roadmap.end_date)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const today = new Date()

  const getPositionPercent = (date: string) => {
    const d = new Date(date)
    const daysFromStart = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100))
  }

  const statusColors = {
    pending: 'bg-gray-400',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
  }

  const statusIcons = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{roadmap.name}</h2>
            <p className="text-muted-foreground mt-1">{roadmap.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                roadmap.status === 'active' ? 'bg-green-100' :
                roadmap.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {roadmap.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Milestones ({milestones.length})</h3>
            <button
              onClick={onAddMilestone}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          <div className="relative">
            <div className="h-2 bg-secondary rounded-full">
              <div 
                className="h-2 bg-primary rounded-full"
                style={{ width: `${getPositionPercent(today.toISOString())}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{startDate.toLocaleDateString()}</span>
              <span>Today</span>
              <span>{endDate.toLocaleDateString()}</span>
            </div>
          </div>

          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones yet. Create one to track progress.
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => {
                const StatusIcon = statusIcons[milestone.status]
                const milestoneProgress = progress[milestone.id] || 0
                return (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${statusColors[milestone.status].replace('bg-', 'text-')}`} />
                        <div>
                          <h4 className="font-medium">{milestone.name}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onEditMilestone(milestone)}
                          className="p-1 hover:bg-secondary rounded text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => onDeleteMilestone(milestone.id)}
                          className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${statusColors[milestone.status]}`}
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{milestoneProgress}%</span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {new Date(milestone.target_date).toLocaleDateString()}
                      </div>
                      <span>{milestone.ticket_ids.length} tickets</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}