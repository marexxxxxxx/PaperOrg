import { useState, useMemo, useRef, useCallback } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { X, ZoomIn, ZoomOut, Filter } from 'lucide-react'
import type { Agent, AgentRole } from '../../../shared/types'

interface OrgNodeProps {
  agent: Agent
  role?: AgentRole
  children: Agent[]
  allAgents: Agent[]
  roles: AgentRole[]
  onSelect: (agent: Agent) => void
  level: number
}

function OrgNode({ agent, role, children, allAgents, roles, onSelect, level }: OrgNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const childNodes = useMemo(() => 
    allAgents.filter(a => a.parent_id === agent.id),
    [allAgents, agent.id]
  )

  const statusColors = {
    active: 'border-green-500',
    idle: 'border-yellow-500',
    busy: 'border-red-500',
  }

  const statusLabels = {
    active: 'Active',
    idle: 'Idle',
    busy: 'Busy',
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => onSelect(agent)}
        className={`relative cursor-pointer border-2 ${statusColors[agent.status]} bg-background rounded-lg p-3 min-w-[160px] hover:shadow-lg transition-shadow`}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: role?.color || '#6b7280', color: 'white' }}
          >
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm">{agent.name}</div>
            <div className="text-xs text-muted-foreground">{role?.name || 'No Role'}</div>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-background border-2" style={{ borderColor: statusColors[agent.status].replace('border-', '') }} />
        {childNodes.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs hover:bg-accent"
          >
            {expanded ? '−' : '+'}
          </button>
        )}
      </div>

      {expanded && childNodes.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="flex gap-4 relative">
            {childNodes.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-160px)] h-px bg-border" style={{ width: `calc(${childNodes.length * 180}px - 180px)` }} />
            )}
            <div className="flex flex-col items-center pt-6 gap-4">
              {childNodes.map(child => (
                <OrgNode
                  key={child.id}
                  agent={child}
                  role={roles.find(r => r.id === child.role_id)}
                  children={[]}
                  allAgents={allAgents}
                  roles={roles}
                  onSelect={onSelect}
                  level={level + 1}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface AgentPopoverProps {
  agent: Agent
  role?: AgentRole
  allAgents: Agent[]
  roles: AgentRole[]
  onClose: () => void
}

function AgentPopover({ agent, role, allAgents, roles, onClose }: AgentPopoverProps) {
  const parent = allAgents.find(a => a.id === agent.parent_id)
  const children = allAgents.filter(a => a.parent_id === agent.id)
  const parentRole = parent ? roles.find(r => r.id === parent.role_id) : undefined

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: role?.color || '#6b7280', color: 'white' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">{role?.name || 'No Role'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              agent.status === 'active' ? 'bg-green-100 text-green-800' :
              agent.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-secondary">
              Tier {role?.tier || 1}
            </span>
          </div>

          {agent.description && (
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          )}

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="px-2 py-1 bg-secondary rounded text-xs">{cap}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Reports to</h3>
              <p className="text-muted-foreground">{parent?.name || 'None (Top Level)'}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Direct Reports</h3>
              <p className="text-muted-foreground">{children.length} agent{children.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Created: {new Date(agent.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

interface OrgChartProps {
  onSelectAgent?: (agent: Agent) => void
}

export function OrgChart({ onSelectAgent }: OrgChartProps) {
  const { agents } = useAgents()
  const { roles } = useRoles()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const rootAgents = useMemo(() => 
    agents?.filter(a => !a.parent_id) || [],
    [agents]
  )

  const filteredAgents = useMemo(() => {
    if (!agents) return []
    return agents.filter(agent => {
      if (roleFilter && agent.role_id !== roleFilter) return false
      if (statusFilter && agent.status !== statusFilter) return false
      return true
    })
  }, [agents, roleFilter, statusFilter])

  const filteredRootAgents = useMemo(() => {
    return filteredAgents.filter(a => !a.parent_id)
  }, [filteredAgents])

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.4))
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(s => Math.max(0.4, Math.min(2, s + delta)))
  }, [])

  if (!agents?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No agents available. Create agents first.
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-background border rounded-lg hover:bg-secondary flex items-center gap-1 text-sm"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div className="flex bg-background border rounded-lg">
          <button onClick={handleZoomOut} className="p-2 hover:bg-secondary rounded-l-lg">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 py-2 text-sm flex items-center">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-secondary rounded-r-lg">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleReset}
          className="p-2 bg-background border rounded-lg hover:bg-secondary text-sm"
        >
          Reset
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-16 right-4 z-10 bg-background border rounded-lg p-4 shadow-xl w-64">
          <h3 className="font-medium mb-3">Filters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              >
                <option value="">All Roles</option>
                {roles?.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            {(roleFilter || statusFilter) && (
              <button
                onClick={() => { setRoleFilter(''); setStatusFilter('') }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="flex flex-col items-center min-w-max p-8"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center top',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {filteredRootAgents.map(agent => (
            <OrgNode
              key={agent.id}
              agent={agent}
              role={roles?.find(r => r.id === agent.role_id)}
              children={[]}
              allAgents={filteredAgents}
              roles={roles || []}
              onSelect={(a) => setSelectedAgent(a)}
              level={0}
            />
          ))}
        </div>
      </div>

      {selectedAgent && (
        <AgentPopover
          agent={selectedAgent}
          role={roles?.find(r => r.id === selectedAgent.role_id)}
          allAgents={agents}
          roles={roles || []}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}