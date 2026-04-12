import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { AIProviderConfig, DemoWorkflow } from '@/components/AIProviderConfig'
import { Settings, Bot, Play } from 'lucide-react'

export function SettingsPage() {
  const { agents } = useAgents()
  const { roles } = useRoles()
  const [activeTab, setActiveTab] = useState<'provider' | 'demo'>('provider')
  const [provider, setProvider] = useState<'mock' | 'openai' | 'anthropic'>('mock')
  const [isConnected, setIsConnected] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleTest = async (): Promise<boolean> => {
    setIsTesting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsTesting(false)
    setIsConnected(true)
    return true
  }

  const handleExecuteTask = async (agentId: string, task: string): Promise<string> => {
    setIsExecuting(true)
    try {
      const res = await fetch('/api/ai/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, task })
      })
      const data = await res.json()
      return data.response || data.error || 'Task executed'
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h1>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('provider')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 -mb-px ${
            activeTab === 'provider' ? 'border-primary text-primary' : 'border-transparent'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Provider
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 -mb-px ${
            activeTab === 'demo' ? 'border-primary text-primary' : 'border-transparent'
          }`}
        >
          <Play className="w-4 h-4" />
          Demo
        </button>
      </div>

      {activeTab === 'provider' && (
        <AIProviderConfig
          provider={provider}
          onProviderChange={setProvider}
          isConnected={isConnected}
          onTest={handleTest}
          isTesting={isTesting}
        />
      )}

      {activeTab === 'demo' && (
        <DemoWorkflow
          agents={agents || []}
          roles={roles || []}
          onExecuteTask={handleExecuteTask}
          isExecuting={isExecuting}
        />
      )}
    </div>
  )
}