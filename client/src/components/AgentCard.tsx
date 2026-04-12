import { Pencil, Trash2, User } from 'lucide-react'
import type { Agent, AgentRole } from '../../../shared/types'

interface AgentCardProps {
  agent: Agent
  role?: AgentRole
  onEdit: () => void
  onDelete: () => void
}

export function AgentCard({ agent, role, onEdit, onDelete }: AgentCardProps) {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-sm text-muted-foreground">{role?.name || 'No Role'}</div>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
      </div>

      {agent.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-secondary"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  )
}