export class MockAIProvider {
    responses = [
        "Ich habe die Aufgabe analysiert und eine Lösung implementiert.",
        "Die Anfrage wurde bearbeitet. Hier ist das Ergebnis: DONE",
        "Task erfolgreich abgeschlossen. Weitere Schritte nicht erforderlich.",
        "Analyse abgeschlossen. Keine Aktionen notwendig.",
        "Verarbeitung erfolgreich. Ergebnis liegt vor.",
    ];
    simulateDelay() {
        return Math.random() * 2000 + 500;
    }
    async sendPrompt(agentId, task) {
        const duration = this.simulateDelay();
        await new Promise(resolve => setTimeout(resolve, duration));
        const response = this.responses[Math.floor(Math.random() * this.responses.length)];
        return {
            success: true,
            response: `Agent ${agentId}: "${task}" - ${response}`,
            duration,
            tokenCount: Math.floor(Math.random() * 100) + 20,
        };
    }
    async suggestDelegation(task, availableAgents) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const suggestions = availableAgents.map(agentId => ({
            agentId,
            score: Math.random() * 0.4 + 0.6,
            reason: 'Basierend auf aktueller Auslastung und Fähigkeiten',
        }));
        return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
    }
    async analyzeAgentPerformance(agentId) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            agentId,
            tasksCompleted: Math.floor(Math.random() * 50) + 1,
            avgDuration: Math.random() * 5000 + 1000,
            successRate: Math.random() * 0.3 + 0.7,
        };
    }
}
export class AIProviderFactory {
    static provider = null;
    static setProvider(provider) {
        this.provider = provider;
    }
    static getProvider() {
        if (!this.provider) {
            this.provider = new MockAIProvider();
        }
        return this.provider;
    }
    static async sendPrompt(agentId, task) {
        return this.getProvider().sendPrompt(agentId, task);
    }
    static async suggestDelegation(task, availableAgents) {
        return this.getProvider().suggestDelegation(task, availableAgents);
    }
    static async analyzeAgentPerformance(agentId) {
        return this.getProvider().analyzeAgentPerformance(agentId);
    }
}
