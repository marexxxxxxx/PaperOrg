import { Calendar, User, ChevronRight, Flag, Tag, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import type { Ticket, Agent } from '../../../shared/types'

interface TicketCardProps {
  ticket: Ticket
  assignee?: Agent
  onEdit: () => void
  onStatusChange: (status: Ticket['status']) => void
}

const priorityConfig = {
  P1: { label: 'Critical', bgColor: 'bg-red-500', textColor: 'text-red-600', borderColor: 'border-red-500/30' },
  P2: { label: 'High', bgColor: 'bg-orange-500', textColor: 'text-orange-600', borderColor: 'border-orange-500/30' },
  P3: { label: 'Medium', bgColor: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-500/30' },
  P4: { label: 'Low', bgColor: 'bg-gray-500', textColor: 'text-gray-600', borderColor: 'border-gray-500/30' },
}

const statusConfig = {
  open: { label: 'Open', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600', borderColor: 'border-yellow-500/30' },
  in_progress: { label: 'In Progress', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600', borderColor: 'border-blue-500/30' },
  blocked: { label: 'Blocked', bgColor: 'bg-red-500/10', textColor: 'text-red-600', borderColor: 'border-red-500/30' },
  resolved: { label: 'Resolved', bgColor: 'bg-green-500/10', textColor: 'text-green-600', borderColor: 'border-green-500/30' },
  closed: { label: 'Closed', bgColor: 'bg-gray-500/10', textColor: 'text-gray-600', borderColor: 'border-gray-500/30' },
}

export function TicketCard({ ticket, assignee, onEdit, onStatusChange }: TicketCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const priority = priorityConfig[ticket.priority]
  const status = statusConfig[ticket.status]

  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${priority.bgColor} ${priority.textColor} flex items-center justify-center`}>
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priority.bgColor} ${priority.textColor}`}>
                {priority.label}
              </span>
            </div>
          </div>
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value as Ticket['status'])}
            className={`text-sm px-3 py-1.5 rounded-lg border ${status.borderColor} ${status.bgColor} ${status.textColor} font-medium cursor-pointer hover:scale-105 transition-transform duration-200`}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{ticket.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        </div>

        {(ticket.tags && ticket.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {ticket.tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i} 
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            {assignee ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#6b7280' }}
                >
                  {assignee.name.charAt(0)}
                </div>
                <span className="text-sm text-muted-foreground">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
            {ticket.due_date && (
              <div className={`flex items-center gap-1 text-sm ${
                new Date(ticket.due_date) < new Date() ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                <Calendar className="w-4 h-4" />
                {new Date(ticket.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200"
          >
            Edit <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}