import { ArrowRight, Check, X, Clock } from 'lucide-react'
import type { Delegation, Agent, Ticket } from '../../../shared/types'

interface DelegationHistoryProps {
  delegations: Delegation[]
  agents: Agent[]
  tickets: Ticket[]
}

export function DelegationHistory({ delegations, agents, tickets }: DelegationHistoryProps) {
  const getAgent = (id: string) => agents.find(a => a.id === id)
  const getTicket = (id: string) => tickets.find(t => t.id === id)

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    accepted: { icon: Check, color: 'text-green-500', bg: 'bg-green-100' },
    rejected: { icon: X, color: 'text-red-500', bg: 'bg-red-100' },
  }

  if (delegations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No delegation history
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {delegations.map((delegation) => {
        const fromAgent = getAgent(delegation.from_agent_id)
        const toAgent = getAgent(delegation.to_agent_id)
        const ticket = getTicket(delegation.ticket_id)
        const config = statusConfig[delegation.status as keyof typeof statusConfig]
        const StatusIcon = config.icon

        return (
          <div key={delegation.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${config.bg} ${config.color}`}>
                  {delegation.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(delegation.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{fromAgent?.name || 'Unknown'}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{toAgent?.name || 'Unknown'}</span>
            </div>

            {ticket && (
              <div className="mt-2 text-sm text-muted-foreground">
                Ticket: {ticket.title}
              </div>
            )}

            {delegation.message && (
              <div className="mt-2 text-sm text-muted-foreground">
                "{delegation.message}"
              </div>
            )}

            {delegation.resolved_at && (
              <div className="mt-2 text-xs text-muted-foreground">
                Resolved: {new Date(delegation.resolved_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}