import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useRoadmaps } from '@/hooks/useRoadmaps'
import { RoadmapCard } from '@/components/RoadmapCard'
import { RoadmapForm } from '@/components/RoadmapForm'

export function RoadmapsPage() {
  const { roadmaps, createRoadmap, updateRoadmap, deleteRoadmap, isLoading } = useRoadmaps()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filteredRoadmaps = roadmaps?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

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
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onEdit={() => setEditingId(roadmap.id)}
              onDelete={() => deleteRoadmap(roadmap.id)}
            />
          ))}
        </div>
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
    </div>
  )
}