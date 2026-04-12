import { useState, useEffect } from 'react'
import { X, User, Briefcase, Users, FileText, Sparkles, Loader2 } from 'lucide-react'
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
  const [focusedField, setFocusedField] = useState<string | null>(null)

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

  const inputClasses = (fieldName: string, hasValue: boolean) => `
    w-full px-4 py-3 border rounded-xl bg-muted/30 text-sm transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    hover:border-primary/50
    ${focusedField === fieldName || hasValue 
      ? 'border-primary bg-muted/50' 
      : 'border-border'
    }
  `

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">
              {agent ? 'Edit Agent' : 'New Agent'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('name', !!name)} pl-11`}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <select
                value={role_id}
                onChange={(e) => setRoleId(e.target.value)}
                onFocus={() => setFocusedField('role')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('role', !!role_id)} pl-11 appearance-none cursor-pointer`}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Reports To</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <select
                value={parent_id}
                onChange={(e) => setParentId(e.target.value)}
                onFocus={() => setFocusedField('parent')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('parent', !!parent_id)} pl-11 appearance-none cursor-pointer`}
              >
                <option value="">No Manager</option>
                {agents.filter(a => a.id !== agent?.id).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Agent['status'])}
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('status', !!status)} pl-11 appearance-none cursor-pointer`}
              >
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground transition-colors" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('description', !!description)} pl-11 min-h-[100px] resize-none`}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Capabilities</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
              <input
                type="text"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                onFocus={() => setFocusedField('capabilities')}
                onBlur={() => setFocusedField(null)}
                placeholder="coding, testing, design"
                className={`${inputClasses('capabilities', !!capabilities)} pl-11`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-xl font-medium hover:bg-muted hover:border-primary/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}