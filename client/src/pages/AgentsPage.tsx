import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { useTickets } from '@/hooks/useTickets'
import { AgentCard } from '@/components/AgentCard'
import { AgentForm } from '@/components/AgentForm'
import { OrgChart } from '@/components/OrgChart'
import { DelegationForm, DelegationCard } from '@/components/DelegationForm'
import { useDelegations } from '@/hooks/useDelegations'
import { Plus, Search, List, GitBranch, Users } from 'lucide-react'
import type { Agent } from '../../../../shared/types'

export function AgentsPage() {
  const { agents, createAgent, updateAgent, deleteAgent, isLoading } = useAgents()
  const { roles } = useRoles()
  const { tickets } = useTickets()
  const { delegations, updateDelegation } = useDelegations()
  const [showForm, setShowForm] = useState(false)
  const [showDelegation, setShowDelegation] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'org' | 'delegations'>('list')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !filterRole || agent.role_id === filterRole
    return matchesSearch && matchesRole
  })

  const pendingDelegations = delegations?.filter(d => d.status === 'pending') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-secondary' : ''}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('org')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${viewMode === 'org' ? 'bg-secondary' : ''}`}
          >
            <GitBranch className="w-4 h-4" />
            OrgChart
          </button>
          <button
            onClick={() => setViewMode('delegations')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${viewMode === 'delegations' ? 'bg-secondary' : ''}`}
          >
            <Users className="w-4 h-4" />
            Delegations
            {pendingDelegations.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-1.5 rounded-full">
                {pendingDelegations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Roles</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowDelegation(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md"
            >
              Delegate
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              <Plus className="w-4 h-4" />
              Add Agent
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents?.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  role={roles?.find((r) => r.id === agent.role_id)}
                  onEdit={() => setEditingId(agent.id)}
                  onDelete={() => deleteAgent(agent.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === 'org' && (
        <div className="border rounded-lg p-4">
          <OrgChart onSelectAgent={(agent) => setSelectedAgent(agent)} />
        </div>
      )}

      {viewMode === 'delegations' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setShowDelegation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              <Plus className="w-4 h-4" />
              New Delegation
            </button>
          </div>
          {delegations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No delegations yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {delegations?.map((delegation) => (
                <DelegationCard
                  key={delegation.id}
                  delegation={delegation}
                  agents={agents || []}
                  tickets={tickets || []}
                  onAccept={(id) => updateDelegation(id, 'accepted')}
                  onReject={(id) => updateDelegation(id, 'rejected')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <AgentForm
          roles={roles || []}
          agents={agents || []}
          onSubmit={async (data) => {
            await createAgent(data)
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {showDelegation && (
        <DelegationForm onClose={() => setShowDelegation(false)} />
      )}

      {editingId && (
        <AgentForm
          roles={roles || []}
          agents={agents || []}
          agent={agents?.find((a) => a.id === editingId)}
          onSubmit={async (data) => {
            await updateAgent(editingId, data)
            setEditingId(null)
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}