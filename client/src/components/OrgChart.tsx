import { useState, useMemo } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import type { Agent, AgentRole } from '../../../../shared/types'

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
        {childNodes.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs"
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

interface OrgChartProps {
  onSelectAgent?: (agent: Agent) => void
}

export function OrgChart({ onSelectAgent }: OrgChartProps) {
  const { agents } = useAgents()
  const { roles } = useRoles()

  const rootAgents = useMemo(() => 
    agents?.filter(a => !a.parent_id) || [],
    [agents]
  )

  if (!agents?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No agents available. Create agents first.
      </div>
    )
  }

  return (
    <div className="overflow-auto p-4">
      <div className="flex flex-col items-center min-w-max">
        {rootAgents.map(agent => (
          <OrgNode
            key={agent.id}
            agent={agent}
            role={roles?.find(r => r.id === agent.role_id)}
            children={[]}
            allAgents={agents || []}
            roles={roles || []}
            onSelect={(a) => onSelectAgent?.(a)}
            level={0}
          />
        ))}
      </div>
    </div>
  )
}