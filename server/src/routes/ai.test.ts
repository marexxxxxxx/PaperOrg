import { test, describe, before, after, mock } from 'node:test'
import assert from 'node:assert'
import express from 'express'
import { aiRouter } from './ai.js'
import { AIProviderFactory, IAIProvider, AIPromptResponse, SuggestedAgent, PerformanceMetrics } from '../services/aiProvider.js'
import { Server } from 'http'
import { AddressInfo } from 'net'

class TestAIProvider implements IAIProvider {
  async sendPrompt(agentId: string, task: string): Promise<AIPromptResponse> {
    if (agentId === 'error-agent') {
      throw new Error('Test provider error')
    }
    return {
      success: true,
      response: `Test Response for ${agentId} doing ${task}`,
      duration: 100,
      tokenCount: 42,
    }
  }

  async suggestDelegation(task: string, availableAgents: string[]): Promise<SuggestedAgent[]> {
    return availableAgents.map(agentId => ({
      agentId,
      score: 0.9,
      reason: 'Test reason'
    }))
  }

  async analyzeAgentPerformance(agentId: string): Promise<PerformanceMetrics> {
    return {
      agentId,
      tasksCompleted: 10,
      avgDuration: 200,
      successRate: 0.95
    }
  }
}

describe('AI Routes', () => {
  let app: express.Application
  let server: Server
  let baseUrl: string

  before(async () => {
    // Override the AI Provider for deterministic testing
    AIProviderFactory.setProvider(new TestAIProvider())

    app = express()
    app.use(express.json())
    app.use('/ai', aiRouter)

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo
        baseUrl = `http://localhost:${address.port}/ai`
        resolve()
      })
    })
  })

  after(() => {
    if (server) {
      return new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  })

  describe('POST /prompt', () => {
    test('should return 400 if agent_id is missing', async () => {
      const response = await fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'Do something' })
      })

      assert.strictEqual(response.status, 400)
      const data = await response.json()
      assert.deepStrictEqual(data, { error: 'agent_id and task required' })
    })

    test('should return 400 if task is missing', async () => {
      const response = await fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: 'agent-1' })
      })

      assert.strictEqual(response.status, 400)
      const data = await response.json()
      assert.deepStrictEqual(data, { error: 'agent_id and task required' })
    })

    test('should return 200 and AI response on success', async () => {
      const response = await fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: 'agent-1', task: 'Do something' })
      })

      assert.strictEqual(response.status, 200)
      const data = await response.json()
      assert.strictEqual(data.success, true)
      assert.strictEqual(data.response, 'Test Response for agent-1 doing Do something')
      assert.strictEqual(data.duration, 100)
      assert.strictEqual(data.tokenCount, 42)
    })

    test('should return 500 if AI provider throws an error', async () => {
      const response = await fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: 'error-agent', task: 'Do something' })
      })

      assert.strictEqual(response.status, 500)
      const data = await response.json()
      assert.deepStrictEqual(data, { error: 'AI provider error' })
    })
  })
})
