import { Router } from 'express'
import { getDb, saveDb } from '../db/database.js'
import { v4 as uuidv4 } from 'uuid'

export const rolesRouter = Router()

rolesRouter.get('/', (req, res) => {
  const db = getDb()
  const result = db.exec('SELECT * FROM roles ORDER BY tier DESC')
  
  if (!result[0]) return res.json([])
  
  const columns = result[0].columns
  const roles = result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = col === 'permissions' ? JSON.parse(row[i] as string || '[]') : row[i]
    })
    return obj
  })
  
  res.json(roles)
})

rolesRouter.get('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM roles WHERE id = ?')
  stmt.bind([req.params.id])
  
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Role not found' })
  }
  
  const row = stmt.getAsObject()
  stmt.free()
  
  res.json({
    ...row,
    permissions: JSON.parse(row.permissions as string || '[]'),
  })
})

rolesRouter.post('/', (req, res) => {
  const { name, permissions = [], tier = 1, color = '#3b82f6' } = req.body
  const id = uuidv4()
  
  const db = getDb()
  db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
    [id, name, JSON.stringify(permissions), tier, color])
  
  saveDb()
  
  res.json({ id, name, permissions, tier, color })
})

rolesRouter.patch('/:id', (req, res) => {
  const { name, permissions, tier, color } = req.body
  const db = getDb()
  
  if (name !== undefined) db.run('UPDATE roles SET name = ? WHERE id = ?', [name, req.params.id])
  if (permissions !== undefined) db.run('UPDATE roles SET permissions = ? WHERE id = ?', [JSON.stringify(permissions), req.params.id])
  if (tier !== undefined) db.run('UPDATE roles SET tier = ? WHERE id = ?', [tier, req.params.id])
  if (color !== undefined) db.run('UPDATE roles SET color = ? WHERE id = ?', [color, req.params.id])
  
  saveDb()
  
  const stmt = db.prepare('SELECT * FROM roles WHERE id = ?')
  stmt.bind([req.params.id])
  stmt.step()
  const row = stmt.getAsObject()
  stmt.free()
  
  res.json({
    ...row,
    permissions: JSON.parse(row.permissions as string || '[]'),
  })
})

rolesRouter.delete('/:id', (req, res) => {
  const db = getDb()
  const stmt = db.prepare('SELECT id FROM roles WHERE id = ?')
  stmt.bind([req.params.id])
  if (!stmt.step()) {
    stmt.free()
    return res.status(404).json({ error: 'Role not found' })
  }
  stmt.free()
  
  db.run('DELETE FROM roles WHERE id = ?', [req.params.id])
  saveDb()
  res.json({ success: true })
})