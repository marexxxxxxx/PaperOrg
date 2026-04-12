import { useMemo, useEffect, useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useTickets } from '@/hooks/useTickets'
import { useRoles } from '@/hooks/useRoles'
import { Users, Ticket, CheckCircle, Clock, UserCheck, TrendingUp, Activity, Zap } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  delay?: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(eased * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value])

  return <span>{displayValue}</span>
}

function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-4xl font-bold tracking-tight">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-primary/10 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

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
    { label: 'Total Agents', value: totalAgents, icon: <Users className="w-6 h-6 text-blue-500" />, color: 'bg-blue-500/20' },
    { label: 'Open Tickets', value: openTickets, icon: <Ticket className="w-6 h-6 text-yellow-500" />, color: 'bg-yellow-500/20' },
    { label: 'In Progress', value: inProgressTickets, icon: <Clock className="w-6 h-6 text-orange-500" />, color: 'bg-orange-500/20' },
    { label: 'Resolved', value: resolvedTickets, icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: 'bg-green-500/20' },
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Willkommen zurück! Hier ist eine Übersicht deiner Organisation.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Zap className="w-4 h-4" />
          {totalTickets} Tickets Total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 100} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ticket Overview
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Open', value: openTickets, color: 'bg-yellow-500' },
                { label: 'In Progress', value: inProgressTickets, color: 'bg-orange-500' },
                { label: 'Blocked', value: blockedTickets, color: 'bg-red-500' },
                { label: 'Resolved', value: resolvedTickets, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={item.label} className="space-y-2 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${totalTickets ? (item.value / totalTickets) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Burndown Chart (7 Days)
            </h2>
            {totalTickets === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Ticket className="w-12 h-12 mb-2 opacity-50" />
                <p>No tickets to display</p>
              </div>
            ) : (
              <div className="relative h-40">
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {burndownData.data.map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 animate-scale-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-secondary rounded-t transition-all duration-500"
                        style={{ height: `${(value / totalTickets) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-end justify-between gap-1 pointer-events-none opacity-30">
                  {burndownData.ideal.map((value, i) => (
                    <div key={i} className="flex-1 border-t border-dashed border-border" style={{ height: `${(value / totalTickets) * 100}%` }} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Heute</span>
                  <span>7 Tage</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Agent Workload
            </h2>
            {agentWorkload.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mb-2 opacity-50" />
                <p>No assigned tickets</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agentWorkload.map(({ agent, role, active, completed, total }, i) => (
                  <div key={agent.id} className="space-y-2 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                          style={{ backgroundColor: role?.color || '#6b7280' }}
                        >
                          {agent.name.charAt(0)}
                        </div>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {active} active · {completed} completed
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${(active / maxWorkload) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(completed / total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover-lift transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Ticket className="w-12 h-12 mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((ticket, i) => (
                  <div 
                    key={ticket.id} 
                    className="flex items-center gap-3 pb-3 border-b border-border last:border-0 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-yellow-500' : ticket.status === 'in_progress' ? 'bg-orange-500' : ticket.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-600' :
                      ticket.status === 'in_progress' ? 'bg-orange-500/10 text-orange-600' :
                      ticket.status === 'blocked' ? 'bg-red-500/10 text-red-600' :
                      'bg-green-500/10 text-green-600'
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
    </div>
  )
}