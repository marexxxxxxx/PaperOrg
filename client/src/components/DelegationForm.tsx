import { useState } from 'react'
import { X, User, ArrowRight, MessageSquare, Check, XCircle } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import { useTickets } from '@/hooks/useTickets'
import { useDelegations } from '@/hooks/useDelegations'

interface DelegationFormProps {
  onClose: () => void
}

export function DelegationForm({ onClose }: DelegationFormProps) {
  const { agents } = useAgents()
  const { tickets } = useTickets()
  const { createDelegation } = useDelegations()
  
  const [from_agent_id, setFromAgent] = useState('')
  const [to_agent_id, setToAgent] = useState('')
  const [ticket_id, setTicket] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createDelegation({ from_agent_id, to_agent_id, ticket_id, message })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableAgents = agents?.filter(a => a.id !== from_agent_id) || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Delegate Task
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Agent</label>
            <select
              value={from_agent_id}
              onChange={(e) => setFromAgent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select delegating agent...</option>
              {agents?.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Agent</label>
            <select
              value={to_agent_id}
              onChange={(e) => setToAgent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select receiving agent...</option>
              {availableAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ticket</label>
            <select
              value={ticket_id}
              onChange={(e) => setTicket(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select ticket...</option>
              {tickets?.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>{ticket.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Instructions for the receiving agent..."
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
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
              {isSubmitting ? 'Sending...' : 'Delegate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DelegationCardProps {
  delegation: any
  agents: any[]
  tickets: any[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

export function DelegationCard({ delegation, agents, tickets, onAccept, onReject }: DelegationCardProps) {
  const fromAgent = agents.find(a => a.id === delegation.from_agent_id)
  const toAgent = agents.find(a => a.id === delegation.to_agent_id)
  const ticket = tickets.find(t => t.id === delegation.ticket_id)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${statusColors[delegation.status as keyof typeof statusColors]}`}>
            {delegation.status}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(delegation.created_at).toLocaleString()}
          </span>
        </div>
        {delegation.status === 'pending' && (
          <div className="flex gap-1">
            <button
              onClick={() => onAccept(delegation.id)}
              className="p-1 hover:bg-green-100 rounded text-green-600"
              title="Accept"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(delegation.id)}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{fromAgent?.name || 'Unknown'}</span>
        </div>
        <ArrowRight className="w-4 h-4" />
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{toAgent?.name || 'Unknown'}</span>
        </div>
      </div>

      {ticket && (
        <div className="text-sm">
          <span className="text-muted-foreground">Ticket: </span>
          {ticket.title}
        </div>
      )}

      {delegation.message && (
        <p className="text-sm text-muted-foreground italic">{delegation.message}</p>
      )}
    </div>
  )
}