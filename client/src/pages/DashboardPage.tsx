import { useMemo } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useTickets } from '@/hooks/useTickets'
import { useRoles } from '@/hooks/useRoles'
import { Users, Ticket, CheckCircle, Clock, TrendingDown, UserCheck, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { agents } = useAgents()
  const { tickets } = useTickets()
  const { roles } = useRoles()

  const totalAgents = agents?.length || 0
  const openTickets = tickets?.filter((t) => t.status === 'open').length || 0
  const inProgressTickets = tickets?.filter((t) => t.status === 'in_progress').length || 0
  const resolvedTickets = tickets?.filter((t) => t.status === 'resolved' || t.status === 'closed').length || 0
  const blockedTickets = tickets?.filter((t) => t.status === 'blocked').length || 0
  const totalTickets = tickets?.length || 0

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: Users, color: 'text-blue-500' },
    { label: 'Open Tickets', value: openTickets, icon: Ticket, color: 'text-yellow-500' },
    { label: 'In Progress', value: inProgressTickets, icon: Clock, color: 'text-orange-500' },
    { label: 'Resolved', value: resolvedTickets, icon: CheckCircle, color: 'text-green-500' },
  ]

  const recentActivity = tickets?.slice(0, 5) || []

  const agentWorkload = useMemo(() => {
    if (!agents || !tickets) return []
    return agents.map(agent => {
      const assignedTickets = tickets.filter(t => t.assignee_id === agent.id)
      const activeTickets = assignedTickets.filter(t => t.status === 'open' || t.status === 'in_progress')
      const completedTickets = assignedTickets.filter(t => t.status === 'resolved' || t.status === 'closed')
      const role = roles?.find(r => r.id === agent.role_id)
      return {
        agent,
        role,
        total: assignedTickets.length,
        active: activeTickets.length,
        completed: completedTickets.length,
      }
    }).filter(w => w.total > 0).sort((a, b) => b.active - a.active)
  }, [agents, tickets, roles])

  const burndownData = useMemo(() => {
    if (!tickets || tickets.length === 0) return { data: [], ideal: [] }
    
    const sortedTickets = [...tickets].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    const total = sortedTickets.length
    let remaining = total
    const data: number[] = []
    const ideal: number[] = []
    
    const days = 7
    const completedPerDay = Math.floor(total / days)
    
    for (let i = 0; i <= days; i++) {
      ideal.push(Math.max(0, total - (total / days) * i))
      if (i === 0) {
        data.push(total)
      } else {
        const dayTickets = sortedTickets.filter((_, idx) => 
          idx < (completedPerDay * i)
        )
        remaining = total - dayTickets.length
        data.push(remaining)
      }
    }
    
    return { data, ideal }
  }, [tickets])

  const maxWorkload = Math.max(...agentWorkload.map(w => w.active), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ticket Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Open</span>
              <span className="font-medium">{openTickets}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${totalTickets ? (openTickets / totalTickets) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">In Progress</span>
              <span className="font-medium">{inProgressTickets}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${totalTickets ? (inProgressTickets / totalTickets) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Blocked</span>
              <span className="font-medium">{blockedTickets}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${totalTickets ? (blockedTickets / totalTickets) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resolved</span>
              <span className="font-medium">{resolvedTickets}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${totalTickets ? (resolvedTickets / totalTickets) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Burndown Chart (7 Days)</h2>
          {totalTickets === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tickets to display</p>
          ) : (
            <div className="relative h-40">
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {burndownData.data.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(value / totalTickets) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-end justify-between gap-1 pointer-events-none">
                {burndownData.ideal.map((value, i) => (
                  <div key={i} className="flex-1 border-t border-dashed border-gray-300" style={{ height: `${(value / totalTickets) * 100}%` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-1">
                <span>Today</span>
                <span>7 days</span>
              </div>
              <div className="absolute top-0 right-0 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 bg-blue-500 mr-1" /> Actual
                <span className="inline-block w-3 h-3 border border-dashed border-gray-400 ml-2 mr-1" /> Ideal
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Agent Workload
          </h2>
          {agentWorkload.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assigned tickets</p>
          ) : (
            <div className="space-y-4">
              {agentWorkload.map(({ agent, role, active, completed, total }) => (
                <div key={agent.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: role?.color || '#6b7280', color: 'white' }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{agent.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {active} active, {completed} completed
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div 
                      className="h-2 bg-orange-500 rounded-l"
                      style={{ width: `${(active / maxWorkload) * 100}%` }}
                    />
                    <div 
                      className="h-2 bg-green-500 rounded-r"
                      style={{ width: `${(completed / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    ticket.status === 'blocked' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}