import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useTickets } from '@/hooks/useTickets'
import { TicketCard } from '@/components/TicketCard'
import { TicketForm } from '@/components/TicketForm'

export function TicketsPage() {
  const { tickets, agents, createTicket, updateTicket, deleteTicket, isLoading } = useTickets()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || ticket.status === filterStatus
    const matchesPriority = !filterPriority || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Priorities</option>
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Medium</option>
          <option value="P4">P4 - Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets?.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              assignee={agents?.find((a) => a.id === ticket.assignee_id)}
              onEdit={() => setEditingId(ticket.id)}
              onStatusChange={(status) => updateTicket(ticket.id, { status })}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TicketForm
          agents={agents || []}
          tickets={tickets || []}
          onSubmit={async (data) => {
            await createTicket(data)
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingId && (
        <TicketForm
          agents={agents || []}
          tickets={tickets || []}
          ticket={tickets?.find((t) => t.id === editingId)}
          onSubmit={async (data) => {
            await updateTicket(editingId, data)
            setEditingId(null)
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}