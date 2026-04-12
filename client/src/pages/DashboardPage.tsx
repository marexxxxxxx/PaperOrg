import { useAgents } from '@/hooks/useAgents'
import { useTickets } from '@/hooks/useTickets'
import { Users, Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { agents } = useAgents()
  const { tickets } = useTickets()

  const totalAgents = agents?.length || 0
  const openTickets = tickets?.filter((t) => t.status === 'open').length || 0
  const inProgressTickets = tickets?.filter((t) => t.status === 'in_progress').length || 0
  const resolvedTickets = tickets?.filter((t) => t.status === 'resolved').length || 0
  const blockedTickets = tickets?.filter((t) => t.status === 'blocked').length || 0
  const totalTickets = tickets?.length || 0

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: Users, color: 'text-blue-500' },
    { label: 'Open Tickets', value: openTickets, icon: Ticket, color: 'text-yellow-500' },
    { label: 'In Progress', value: inProgressTickets, icon: Clock, color: 'text-orange-500' },
    { label: 'Resolved', value: resolvedTickets, icon: CheckCircle, color: 'text-green-500' },
  ]

  const recentActivity = tickets?.slice(0, 5) || []

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
                    ticket.status === 'open' ? 'bg-yellow-100' :
                    ticket.status === 'in_progress' ? 'bg-orange-100' :
                    ticket.status === 'blocked' ? 'bg-red-100' :
                    'bg-green-100'
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