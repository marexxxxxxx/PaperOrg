import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { Bot, Zap, Settings, Brain, CheckCircle, XCircle, Loader } from 'lucide-react'
import type { Agent } from '../../../shared/types'

interface AIProviderConfigProps {
  provider: 'mock' | 'openai' | 'anthropic'
  onProviderChange: (provider: 'mock' | 'openai' | 'anthropic') => void
  isConnected: boolean
  onTest: () => Promise<boolean>
  isTesting: boolean
}

export function AIProviderConfig({ provider, onProviderChange, isConnected, onTest, isTesting }: AIProviderConfigProps) {
  const providers = [
    { id: 'mock', name: 'Mock Provider', description: 'Simulierte AI-Antworten für Tests', icon: Bot },
    { id: 'openai', name: 'OpenAI', description: 'GPT-basierte Agenten', icon: Brain },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude-basierte Agenten', icon: Zap },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Provider</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-red-600">
              <XCircle className="w-4 h-4" /> Disconnected
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              provider === p.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary'
            }`}
            onClick={() => onProviderChange(p.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <p.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {provider === p.id && (
                  <span className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {provider === 'mock' && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Mock Provider Info</h4>
          <p className="text-sm text-muted-foreground">
            Der Mock-Provider simuliert AI-Antworten für Testzwecke. 
            Er liefert zufällige vordefinierte Antworten ohne echte AI-Funktionalität.
          </p>
        </div>
      )}

      {(provider === 'openai' || provider === 'anthropic') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            onClick={onTest}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-secondary"
          >
            {isTesting ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      )}
    </div>
  )
}

interface DemoWorkflowProps {
  agents: Agent[]
  roles: Role[]
  onExecuteTask: (agentId: string, task: string) => Promise<string>
  isExecuting: boolean
}

interface Role {
  id: string
  name: string
}

export function DemoWorkflow({ agents, roles, onExecuteTask, isExecuting }: DemoWorkflowProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [task, setTask] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const handleExecute = async () => {
    if (!selectedAgent || !task) return
    setResult(null)
    const response = await onExecuteTask(selectedAgent, task)
    setResult(response)
  }

  const handleSuggest = async () => {
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      })
      const data = await res.json()
      setSuggestions(data)
      setShowSuggestion(true)
    } catch (err) {
      console.error('Failed to get suggestions:', err)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Demo Workflow</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Description</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Beschreibe eine Aufgabe für den Agenten..."
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Wähle einen Agenten</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({roles.find(r => r.id === agent.role_id)?.name || 'No Role'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExecute}
              disabled={!selectedAgent || !task || isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {isExecuting ? <Loader className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {isExecuting ? 'Executing...' : 'Execute Task'}
            </button>
            <button
              onClick={handleSuggest}
              disabled={!task}
              className="flex items-center gap-2 px-4 py-2 border rounded-md disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Suggest Agent
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="border rounded-lg p-4 bg-muted">
              <h4 className="font-medium mb-2">Result</h4>
              <p className="text-sm">{result}</p>
            </div>
          )}

          {showSuggestion && suggestions.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Suggested Agents</h4>
              <div className="space-y-2">
                {suggestions.map((s, i) => {
                  const agent = agents.find(a => a.id === s.agentId)
                  return (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="text-sm font-medium">{agent?.name || s.agentId}</span>
                      <span className="text-xs text-muted-foreground">
                        Score: {(s.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}