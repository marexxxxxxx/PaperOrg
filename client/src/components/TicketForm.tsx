import { useState } from 'react'
import { X, Ticket as TicketIcon, FileText, Flag, Users, Calendar, Tag, Link2, Loader2 } from 'lucide-react'
import type { Ticket, Agent } from '../../../shared/types'
import type { CreateTicketInput } from '../../../shared/types'

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
  const [priority, setPriority] = useState<Ticket['priority']>(ticket?.priority || 'P3')
  const [status, setStatus] = useState<Ticket['status']>(ticket?.status || 'open')
  const [assignee_id, setAssigneeId] = useState(ticket?.assignee_id || '')
  const [parent_ticket_id, setParentTicketId] = useState(ticket?.parent_ticket_id || '')
  const [due_date, setDueDate] = useState(ticket?.due_date?.split('T')[0] || '')
  const [tags, setTags] = useState(ticket?.tags.join(', ') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = (fieldName: string, hasValue: boolean) => `
    w-full px-4 py-3 border rounded-xl bg-muted/30 text-sm transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    hover:border-primary/50
    ${focusedField === fieldName || hasValue 
      ? 'border-primary bg-muted/50' 
      : 'border-border'
    }
  `

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TicketIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">
              {ticket ? 'Edit Ticket' : 'New Ticket'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Title</label>
            <div className="relative">
              <TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('title', !!title)} pl-11`}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground transition-colors" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('description', !!description)} pl-11 min-h-[100px] resize-none`}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Priority</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                  onFocus={() => setFocusedField('priority')}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClasses('priority', !!priority)} pl-11 appearance-none cursor-pointer`}
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Ticket['status'])}
                  onFocus={() => setFocusedField('status')}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClasses('status', !!status)} pl-11 appearance-none cursor-pointer`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Assignee</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                <select
                  value={assignee_id}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  onFocus={() => setFocusedField('assignee')}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClasses('assignee', !!assignee_id)} pl-11 appearance-none cursor-pointer`}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Parent Ticket</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                <select
                  value={parent_ticket_id}
                  onChange={(e) => setParentTicketId(e.target.value)}
                  onFocus={() => setFocusedField('parent')}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClasses('parent', !!parent_ticket_id)} pl-11 appearance-none cursor-pointer`}
                >
                  <option value="">None</option>
                  {tickets.filter(t => t.id !== ticket?.id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <input
                type="date"
                value={due_date}
                onChange={(e) => setDueDate(e.target.value)}
                onFocus={() => setFocusedField('due_date')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('due_date', !!due_date)} pl-11`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="bug, feature, urgent"
                onFocus={() => setFocusedField('tags')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('tags', !!tags)} pl-11`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-xl font-medium hover:bg-muted hover:border-primary/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}