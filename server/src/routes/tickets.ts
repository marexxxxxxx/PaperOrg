import { Router } from 'express'
import { getDb, saveDb } from '../db/database.js'
import { v4 as uuidv4 } from 'uuid'

export const ticketsRouter = Router()

ticketsRouter.get('/', (req, res) => {
  const db = getDb()
  const result = db.exec(`
    SELECT id, title, description, priority, status, assignee_id, creator_id, created_at, updated_at, due_date, parent_ticket_id, tags
    FROM tickets ORDER BY created_at DESC
  `)
  
  if (!result[0]) return res.json([])
  
  const columns = result[0].columns
  const tickets = result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = col === 'tags' ? JSON.parse(row[i] as string || '[]') : row[i]
    })
    return obj
  })
  
  res.json(tickets)
})

ticketsRouter.get('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT id, title, description, priority, status, assignee_id, creator_id, created_at, updated_at, due_date, parent_ticket_id, tags
    FROM tickets WHERE id = ?
  `)
  stmt.bind([req.params.id])
  
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Ticket not found' })
  }
  
  const row = stmt.getAsObject()
  stmt.free()
  
  res.json({
    ...row,
    tags: JSON.parse(row.tags as string || '[]'),
  })
})

ticketsRouter.post('/', (req, res) => {
  const { title, description, priority, status, assignee_id, creator_id, parent_ticket_id, due_date, tags } = req.body
  const id = uuidv4()
  const now = new Date().toISOString()
  
  const db = getDb()
  db.run(`
    INSERT INTO tickets (id, title, description, priority, status, assignee_id, creator_id, parent_ticket_id, due_date, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, 
    title, 
    description || '', 
    priority || 'P3', 
    status || 'open', 
    assignee_id || null, 
    creator_id || 'system', 
    parent_ticket_id || null, 
    due_date || null, 
    JSON.stringify(tags || []),
    now,
    now
  ])
  
  saveDb()
  
  res.json({
    id,
    title,
    description,
    priority: priority || 'P3',
    status: status || 'open',
    assignee_id,
    creator_id: creator_id || 'system',
    parent_ticket_id,
    due_date,
    tags: tags || [],
    created_at: now,
    updated_at: now,
  })
})

ticketsRouter.patch('/:id', (req, res) => {
  const { title, description, priority, status, assignee_id, parent_ticket_id, due_date, tags } = req.body
  const now = new Date().toISOString()
  
  const db = getDb()
  
  const stmt = db.prepare('SELECT * FROM tickets WHERE id = ?')
  stmt.bind([req.params.id])
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Ticket not found' })
  }
  stmt.free()
  
  if (title !== undefined) db.run('UPDATE tickets SET title = ? WHERE id = ?', [title, req.params.id])
  if (description !== undefined) db.run('UPDATE tickets SET description = ? WHERE id = ?', [description, req.params.id])
  if (priority !== undefined) db.run('UPDATE tickets SET priority = ? WHERE id = ?', [priority, req.params.id])
  if (status !== undefined) db.run('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id])
  if (assignee_id !== undefined) db.run('UPDATE tickets SET assignee_id = ? WHERE id = ?', [assignee_id || null, req.params.id])
  if (parent_ticket_id !== undefined) db.run('UPDATE tickets SET parent_ticket_id = ? WHERE id = ?', [parent_ticket_id || null, req.params.id])
  if (due_date !== undefined) db.run('UPDATE tickets SET due_date = ? WHERE id = ?', [due_date || null, req.params.id])
  if (tags !== undefined) db.run('UPDATE tickets SET tags = ? WHERE id = ?', [JSON.stringify(tags), req.params.id])
  db.run('UPDATE tickets SET updated_at = ? WHERE id = ?', [now, req.params.id])
  
  saveDb()
  
  const getStmt = db.prepare('SELECT * FROM tickets WHERE id = ?')
  getStmt.bind([req.params.id])
  getStmt.step()
  const row = getStmt.getAsObject()
  getStmt.free()
  
  res.json({
    ...row,
    tags: JSON.parse(row.tags as string || '[]'),
  })
})

ticketsRouter.delete('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare('SELECT id FROM tickets WHERE id = ?')
  stmt.bind([req.params.id])
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Ticket not found' })
  }
  stmt.free()
  
  db.run('DELETE FROM tickets WHERE id = ?', [req.params.id])
  saveDb()
  res.json({ success: true })
})