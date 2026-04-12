import { Calendar, User, ChevronRight } from 'lucide-react'
import type { Ticket, Agent } from '../../../shared/types'

interface TicketCardProps {
  ticket: Ticket
  assignee?: Agent
  onEdit: () => void
  onStatusChange: (status: Ticket['status']) => void
}

const priorityColors = {
  P1: 'bg-red-500',
  P2: 'bg-orange-500',
  P3: 'bg-blue-500',
  P4: 'bg-gray-500',
}

const statusColors = {
  open: 'text-yellow-600',
  in_progress: 'text-blue-600',
  blocked: 'text-red-600',
  resolved: 'text-green-600',
  closed: 'text-gray-600',
}

export function TicketCard({ ticket, assignee, onEdit, onStatusChange }: TicketCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${priorityColors[ticket.priority]}`} />
          <span className="text-sm font-medium">{ticket.priority}</span>
        </div>
        <select
          value={ticket.status}
          onChange={(e) => onStatusChange(e.target.value as Ticket['status'])}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div>
        <h3 className="font-medium">{ticket.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {assignee && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {assignee.name}
          </div>
        )}
        {ticket.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(ticket.due_date).toLocaleDateString()}
          </div>
        )}
      </div>

      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Edit <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}