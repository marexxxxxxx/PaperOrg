import { useState } from 'react'
import { X } from 'lucide-react'
import type { Ticket, Agent, CreateTicketInput } from '../../../../shared/types'

interface TicketFormProps {
  ticket?: Ticket
  agents: Agent[]
  tickets: Ticket[]
  onSubmit: (data: CreateTicketInput) => Promise<void>
  onClose: () => void
}

export function TicketForm({ ticket, agents, tickets, onSubmit, onClose }: TicketFormProps) {
  const [title, setTitle] = useState(ticket?.title || '')
  const [description, setDescription] = useState(ticket?.description || '')
  const [priority, setPriority] = useState(ticket?.priority || 'P3')
  const [status, setStatus] = useState(ticket?.status || 'open')
  const [assignee_id, setAssigneeId] = useState(ticket?.assignee_id || '')
  const [parent_ticket_id, setParentTicketId] = useState(ticket?.parent_ticket_id || '')
  const [due_date, setDueDate] = useState(ticket?.due_date?.split('T')[0] || '')
  const [tags, setTags] = useState(ticket?.tags.join(', ') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        title,
        description,
        priority: priority as Ticket['priority'],
        status: status as Ticket['status'],
        assignee_id,
        creator_id: 'system',
        parent_ticket_id: parent_ticket_id || null,
        due_date: due_date || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const subTickets = tickets.filter((t) => t.parent_ticket_id === ticket?.id)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{ticket ? 'Edit Ticket' : 'New Ticket'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select
                value={assignee_id}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Parent Ticket</label>
              <select
                value={parent_ticket_id}
                onChange={(e) => setParentTicketId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">None</option>
                {tickets.filter(t => t.id !== ticket?.id).map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={due_date}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bug, feature, urgent"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}