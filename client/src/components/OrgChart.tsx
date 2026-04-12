import { useState, useMemo, useRef, useCallback } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { X, ZoomIn, ZoomOut, Filter, Users, ChevronDown, ChevronRight } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)
  const childNodes = useMemo(() => 
    allAgents.filter(a => a.parent_id === agent.id),
    [allAgents, agent.id]
  )

  const statusConfig = {
    active: { bg: 'bg-green-500', border: 'border-green-500', glow: 'shadow-green-500/30' },
    idle: { bg: 'bg-yellow-500', border: 'border-yellow-500', glow: 'shadow-yellow-500/30' },
    busy: { bg: 'bg-red-500', border: 'border-red-500', glow: 'shadow-red-500/30' },
  }

  const status = statusConfig[agent.status]

  return (
    <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${level * 100}ms` }}>
      <div 
        onClick={() => onSelect(agent)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative cursor-pointer rounded-xl p-4 min-w-[180px] 
          border-2 ${status.border} bg-card 
          hover:shadow-lg hover:shadow-primary/20 hover:scale-105
          transition-all duration-300 ease-out
          group
        `}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
              style={{ backgroundColor: role?.color || '#6b7280', color: 'white' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.bg} border-2 border-card`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{agent.name}</div>
            <div className="text-xs text-muted-foreground">{role?.name || 'No Role'}</div>
          </div>
        </div>
        
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {childNodes.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                bg-card border-2 ${status.border}
                hover:scale-110 transition-transform duration-200
              `}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && childNodes.length > 0 && (
        <>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-primary/20" />
          <div className="relative">
            {childNodes.length > 1 && (
              <div className="absolute top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" style={{ width: `calc(${childNodes.length * 200}px - 200px)` }} />
            )}
            <div className="flex gap-6 pt-6">
              {childNodes.map((child, i) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-primary/20" />
                  <OrgNode
                    agent={child}
                    role={roles.find(r => r.id === child.role_id)}
                    children={[]}
                    allAgents={allAgents}
                    roles={roles}
                    onSelect={onSelect}
                    level={level + 1}
                  />
                </div>
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

  const statusConfig = {
    active: { label: 'Active', bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
    idle: { label: 'Idle', bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
    busy: { label: 'Busy', bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  }
  const status = statusConfig[agent.status]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{ backgroundColor: role?.color || '#6b7280', color: 'white' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-muted-foreground">{role?.name || 'No Role'}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.text} border ${status.border}`}>
              {status.label}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted">
              Tier {role?.tier || 1}
            </span>
          </div>

          {agent.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
            </div>
          )}

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 bg-muted rounded-lg text-sm"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Reports to</h3>
              <p className="text-sm font-medium">{parent?.name || 'None (Top Level)'}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Direct Reports</h3>
              <p className="text-sm font-medium">{children.length} agent{children.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            Member since {new Date(agent.created_at).toLocaleDateString()}
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
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Users className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No agents available</p>
        <p className="text-sm">Create agents first to see the organization chart.</p>
      </div>
    )
  }

  return (
    <div className="relative h-full rounded-xl bg-gradient-to-br from-muted/30 via-background to-muted/30 overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl hover:bg-muted hover:scale-105 transition-all duration-200 text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div className="flex bg-card border rounded-xl overflow-hidden">
          <button 
            onClick={handleZoomOut} 
            className="p-2 hover:bg-muted transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 text-sm flex items-center font-medium">{Math.round(scale * 100)}%</span>
          <button 
            onClick={handleZoomIn} 
            className="p-2 hover:bg-muted transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-card border rounded-xl hover:bg-muted hover:scale-105 transition-all duration-200 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-16 right-4 z-10 bg-card border rounded-xl p-4 shadow-2xl w-72 animate-slide-down">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full mt-2 p-2.5 border rounded-lg bg-muted/50 text-sm"
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
                className="w-full mt-2 p-2.5 border rounded-lg bg-muted/50 text-sm"
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
                className="text-sm text-primary hover:underline font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden h-full cursor-grab active:cursor-grabbing p-8"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="flex flex-col items-center min-w-max"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center top',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {filteredRootAgents.map((agent, i) => (
            <div key={agent.id} className="animate-slide-down" style={{ animationDelay: `${i * 100}ms` }}>
              <OrgNode
                agent={agent}
                role={roles?.find(r => r.id === agent.role_id)}
                children={[]}
                allAgents={filteredAgents}
                roles={roles || []}
                onSelect={(a) => setSelectedAgent(a)}
                level={0}
              />
            </div>
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