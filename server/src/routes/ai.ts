import { Router } from 'express'
import { AIProviderFactory } from '../services/aiProvider.js'
import { getDb } from '../db/database.js'

export const aiRouter = Router()

aiRouter.post('/prompt', async (req, res) => {
  try {
    const { agent_id, task } = req.body
    if (!agent_id || !task) {
      return res.status(400).json({ error: 'agent_id and task required' })
    }
    const response = await AIProviderFactory.sendPrompt(agent_id, task)
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'AI provider error' })
  }
})

aiRouter.post('/suggest', async (req, res) => {
  try {
    const { task } = req.body
    if (!task) {
      return res.status(400).json({ error: 'task required' })
    }
    
    const db = getDb()
    const result = db.exec('SELECT id FROM agents')
    const availableAgents = result[0]?.values.map(row => row[0] as string) || []
    
    const suggestions = await AIProviderFactory.suggestDelegation(task, availableAgents)
    res.json(suggestions)
  } catch (error) {
    res.status(500).json({ error: 'AI provider error' })
  }
})

aiRouter.get('/performance/:agent_id', async (req, res) => {
  try {
    const metrics = await AIProviderFactory.analyzeAgentPerformance(req.params.agent_id)
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: 'AI provider error' })
  }
})

aiRouter.get('/status', (req, res) => {
  res.json({ 
    provider: 'MockAIProvider', 
    status: 'operational',
    features: ['prompt', 'suggest', 'performance']
  })
})