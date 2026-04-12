export interface AIPromptResponse {
  success: boolean
  response: string
  duration: number
  tokenCount?: number
}

export interface SuggestedAgent {
  agentId: string
  score: number
  reason: string
}

export interface PerformanceMetrics {
  agentId: string
  tasksCompleted: number
  avgDuration: number
  successRate: number
}

export interface IAIProvider {
  sendPrompt(agentId: string, task: string): Promise<AIPromptResponse>
  suggestDelegation(task: string, availableAgents: string[]): Promise<SuggestedAgent[]>
  analyzeAgentPerformance(agentId: string): Promise<PerformanceMetrics>
}

export class MockAIProvider implements IAIProvider {
  private responses: string[] = [
    "Ich habe die Aufgabe analysiert und eine Lösung implementiert.",
    "Die Anfrage wurde bearbeitet. Hier ist das Ergebnis: DONE",
    "Task erfolgreich abgeschlossen. Weitere Schritte nicht erforderlich.",
    "Analyse abgeschlossen. Keine Aktionen notwendig.",
    "Verarbeitung erfolgreich. Ergebnis liegt vor.",
  ]

  private simulateDelay(): number {
    return Math.random() * 2000 + 500
  }

  async sendPrompt(agentId: string, task: string): Promise<AIPromptResponse> {
    const duration = this.simulateDelay()
    await new Promise(resolve => setTimeout(resolve, duration))

    const response = this.responses[Math.floor(Math.random() * this.responses.length)]
    
    return {
      success: true,
      response: `Agent ${agentId}: "${task}" - ${response}`,
      duration,
      tokenCount: Math.floor(Math.random() * 100) + 20,
    }
  }

  async suggestDelegation(task: string, availableAgents: string[]): Promise<SuggestedAgent[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const suggestions: SuggestedAgent[] = availableAgents.map(agentId => ({
      agentId,
      score: Math.random() * 0.4 + 0.6,
      reason: 'Basierend auf aktueller Auslastung und Fähigkeiten',
    }))

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  async analyzeAgentPerformance(agentId: string): Promise<PerformanceMetrics> {
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      agentId,
      tasksCompleted: Math.floor(Math.random() * 50) + 1,
      avgDuration: Math.random() * 5000 + 1000,
      successRate: Math.random() * 0.3 + 0.7,
    }
  }
}

export class AIProviderFactory {
  private static provider: IAIProvider | null = null

  static setProvider(provider: IAIProvider) {
    this.provider = provider
  }

  static getProvider(): IAIProvider {
    if (!this.provider) {
      this.provider = new MockAIProvider()
    }
    return this.provider
  }

  static async sendPrompt(agentId: string, task: string): Promise<AIPromptResponse> {
    return this.getProvider().sendPrompt(agentId, task)
  }

  static async suggestDelegation(task: string, availableAgents: string[]): Promise<SuggestedAgent[]> {
    return this.getProvider().suggestDelegation(task, availableAgents)
  }

  static async analyzeAgentPerformance(agentId: string): Promise<PerformanceMetrics> {
    return this.getProvider().analyzeAgentPerformance(agentId)
  }
}