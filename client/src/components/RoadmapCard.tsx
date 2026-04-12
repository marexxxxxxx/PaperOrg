import { Pencil, Trash2, Calendar } from 'lucide-react'
import type { Roadmap } from '../../../shared/types'

interface RoadmapCardProps {
  roadmap: Roadmap
  onEdit: (e?: React.MouseEvent) => void
  onDelete: (e?: React.MouseEvent) => void
}

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  completed: 'bg-blue-500',
}

export function RoadmapCard({ roadmap, onEdit, onDelete }: RoadmapCardProps) {
  const start = new Date(roadmap.start_date).toLocaleDateString()
  const end = new Date(roadmap.end_date).toLocaleDateString()

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[roadmap.status]}`} />
          <span className="text-sm font-medium capitalize">{roadmap.status}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1 hover:bg-secondary rounded">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium">{roadmap.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{roadmap.description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {start} - {end}
        </div>
      </div>
    </div>
  )
}