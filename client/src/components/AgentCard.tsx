import { Pencil, Trash2, User, Mail, Phone, Briefcase } from 'lucide-react'
import { useState } from 'react'
import type { Agent, AgentRole } from '../../../shared/types'

interface AgentCardProps {
  agent: Agent
  role?: AgentRole
  onEdit: () => void
  onDelete: () => void
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-500/10' },
  idle: { label: 'Idle', color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  busy: { label: 'Busy', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-500/10' },
}

export function AgentCard({ agent, role, onEdit, onDelete }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const status = statusConfig[agent.status]

  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
              style={{ backgroundColor: role?.color || '#6b7280' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{role?.name || 'No Role'}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor}`}>
            <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse-slow`} />
            <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
          </div>
        </div>

        {agent.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{agent.description}</p>
        )}

        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.capabilities.slice(0, 3).map((cap, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {cap}
              </span>
            ))}
            {agent.capabilities.length > 3 && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                +{agent.capabilities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted hover:border-primary/50 transition-all duration-200"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}