import { useState } from 'react'
import { X } from 'lucide-react'
import type { Agent, AgentRole, CreateAgentInput } from '../../../shared/types'

interface AgentFormProps {
  agent?: Agent
  roles: AgentRole[]
  agents: Agent[]
  onSubmit: (data: CreateAgentInput) => Promise<void>
  onClose: () => void
}

export function AgentForm({ agent, roles, agents, onSubmit, onClose }: AgentFormProps) {
  const [name, setName] = useState(agent?.name || '')
  const [role_id, setRoleId] = useState(agent?.role_id || roles[0]?.id || '')
  const [parent_id, setParentId] = useState(agent?.parent_id || '')
  const [status, setStatus] = useState(agent?.status || 'idle')
  const [description, setDescription] = useState(agent?.description || '')
  const [capabilities, setCapabilities] = useState(agent?.capabilities.join(', ') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        role_id,
        parent_id: parent_id || null,
        status,
        description: description || undefined,
        capabilities: capabilities.split(',').map((c) => c.trim()).filter(Boolean),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{agent ? 'Edit Agent' : 'New Agent'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role_id}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reports To</label>
            <select
              value={parent_id}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">No Manager</option>
              {agents.filter(a => a.id !== agent?.id).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Agent['status'])}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capabilities (comma-separated)</label>
            <input
              type="text"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="coding, testing, design"
              className="w-full px-3 py-2 border rounded-md"
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}