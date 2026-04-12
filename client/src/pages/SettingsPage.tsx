import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useRoles } from '@/hooks/useRoles'
import { AIProviderConfig, DemoWorkflow } from '@/components/AIProviderConfig'
import { Settings, Bot, Play, Palette, Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore, ThemeColor, themeColors } from '@/stores/useThemeStore'

const themeOptions: { value: ThemeColor; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'user-light', 
    label: 'User Light', 
    description: 'Hell mit Blau & Gold Akzenten',
    icon: <Sun className="w-5 h-5" />
  },
  { 
    value: 'user-dark', 
    label: 'User Dark', 
    description: 'Dunkel mit warmen Tönen',
    icon: <Moon className="w-5 h-5" />
  },
  { 
    value: 'modern-light', 
    label: 'Modern Light', 
    description: 'Modern mit Violett & Orange',
    icon: <Sun className="w-5 h-5" />
  },
  { 
    value: 'modern-dark', 
    label: 'Modern Dark', 
    description: 'Modern Dark mitOLED-Tiefen',
    icon: <Moon className="w-5 h-5" />
  },
]

export function SettingsPage() {
  const { agents } = useAgents()
  const { roles } = useRoles()
  const { mode, colorScheme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'theme' | 'provider' | 'demo'>('theme')
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

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'theme' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" />
          Theme
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'provider' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Provider
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'demo' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Play className="w-4 h-4" />
          Demo
        </button>
      </div>

      {activeTab === 'theme' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-semibold mb-2">Design Theme</h2>
            <p className="text-sm text-muted-foreground">
              Wähle ein Farbschema für die Anwendung. Die Auswahl wird automatisch gespeichert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themeOptions.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setTheme(mode, theme.value)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300
                  hover-lift hover-scale
                  ${colorScheme === theme.value 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${colorScheme === theme.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    {theme.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{theme.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
                  </div>
                </div>
                
                {colorScheme === theme.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-medium mb-3">Theme Vorschau</h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-md bg-[#30A2FF]" title="Primary" />
                <div className="w-8 h-8 rounded-md bg-[#00C4FF]" title="Secondary" />
                <div className="w-8 h-8 rounded-md bg-[#FFE7A0]" title="Accent" />
              </div>
              <span className="text-sm text-muted-foreground">
                Aktuelles Theme: <span className="font-medium text-foreground">{themeColors[colorScheme].name}</span>
              </span>
            </div>
          </div>
        </div>
      )}

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