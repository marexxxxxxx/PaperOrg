import express from 'express'
import cors from 'cors'
import { initDatabase } from './db/database.js'
import { agentsRouter } from './routes/agents.js'
import { rolesRouter } from './routes/roles.js'
import { ticketsRouter } from './routes/tickets.js'
import { roadmapsRouter } from './routes/roadmaps.js'
import { delegationsRouter } from './routes/delegations.js'
import { aiRouter } from './routes/ai.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/agents', agentsRouter)
app.use('/api/roles', rolesRouter)
app.use('/api/tickets', ticketsRouter)
app.use('/api/roadmaps', roadmapsRouter)
app.use('/api/delegations', delegationsRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to init database:', err)
  process.exit(1)
})