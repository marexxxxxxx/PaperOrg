import { Router } from 'express'
import { getDb, saveDb } from '../db/database.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export const agentsRouter = Router()

function generateApiKey(): string {
  return 'sk-' + crypto.randomBytes(32).toString('hex')
}

agentsRouter.get('/', (req, res) => {
  const db = getDb()
  const result = db.exec(`
    SELECT id, name, role_id, parent_id, capabilities, status, avatar_url, description, created_at, updated_at, department_id
    FROM agents ORDER BY created_at DESC
  `)
  
  if (!result[0]) return res.json([])
  
  const columns = result[0].columns
  const agents = result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = col === 'capabilities' ? JSON.parse(row[i] as string || '[]') : row[i]
    })
    return obj
  })
  
  res.json(agents)
})

agentsRouter.get('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT id, name, role_id, parent_id, capabilities, status, avatar_url, description, created_at, updated_at, department_id
    FROM agents WHERE id = ?
 `)
  stmt.bind([req.params.id])
  
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Agent not found' })
  }
  
  const row = stmt.getAsObject()
  stmt.free()
  
  res.json({
    ...row,
    capabilities: JSON.parse(row.capabilities as string || '[]'),
  })
})

agentsRouter.post('/', (req, res) => {
  const { name, role_id, parent_id, status, capabilities, description, avatar_url, department_id } = req.body
  const id = uuidv4()
  const now = new Date().toISOString()
  const api_key = generateApiKey()
  
  const db = getDb()
  db.run(`
    INSERT INTO agents (id, name, role_id, parent_id, capabilities, status, description, avatar_url, created_at, updated_at, department_id, api_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, name, role_id || null, parent_id || null, JSON.stringify(capabilities || []), status || 'idle', description || null, avatar_url || null, now, now, department_id || null, api_key])
  
  saveDb()
  
  res.json({
    id,
    name,
    role_id,
    parent_id,
    capabilities: capabilities || [],
    status: status || 'idle',
    description,
    avatar_url,
    created_at: now,
    updated_at: now,
    department_id: department_id || null,
    api_key
  })
})

agentsRouter.patch('/:id', (req, res) => {
  const { name, role_id, parent_id, status, capabilities, description, avatar_url, department_id } = req.body
  const now = new Date().toISOString()
  
  const db = getDb()
  
  const stmt = db.prepare('SELECT * FROM agents WHERE id = ?')
  stmt.bind([req.params.id])
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Agent not found' })
  }
  stmt.free()
  
  if (name !== undefined) db.run('UPDATE agents SET name = ? WHERE id = ?', [name, req.params.id])
  if (role_id !== undefined) db.run('UPDATE agents SET role_id = ? WHERE id = ?', [role_id || null, req.params.id])
  if (parent_id !== undefined) db.run('UPDATE agents SET parent_id = ? WHERE id = ?', [parent_id || null, req.params.id])
  if (status !== undefined) db.run('UPDATE agents SET status = ? WHERE id = ?', [status, req.params.id])
  if (capabilities !== undefined) db.run('UPDATE agents SET capabilities = ? WHERE id = ?', [JSON.stringify(capabilities), req.params.id])
  if (description !== undefined) db.run('UPDATE agents SET description = ? WHERE id = ?', [description, req.params.id])
  if (avatar_url !== undefined) db.run('UPDATE agents SET avatar_url = ? WHERE id = ?', [avatar_url, req.params.id])
  if (department_id !== undefined) db.run('UPDATE agents SET department_id = ? WHERE id = ?', [department_id || null, req.params.id])
  db.run('UPDATE agents SET updated_at = ? WHERE id = ?', [now, req.params.id])
  
  saveDb()
  
  const getStmt = db.prepare('SELECT * FROM agents WHERE id = ?')
  getStmt.bind([req.params.id])
  getStmt.step()
  const row = getStmt.getAsObject()
  getStmt.free()
  
  res.json({
    ...row,
    capabilities: JSON.parse(row.capabilities as string || '[]'),
  })
})

agentsRouter.delete('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare('SELECT id FROM agents WHERE id = ?')
  stmt.bind([req.params.id])
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Agent not found' })
  }
  stmt.free()
  
  db.run('DELETE FROM agents WHERE id = ?', [req.params.id])
  saveDb()
  res.json({ success: true })
})