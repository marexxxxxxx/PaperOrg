import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const departmentsRouter = Router();
departmentsRouter.get('/', (req, res) => {
    const db = getDb();
    const result = db.exec(`
    SELECT id, name, description, created_at
    FROM departments ORDER BY created_at DESC
  `);
    if (!result[0])
        return res.json([]);
    const columns = result[0].columns;
    const departments = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
    res.json(departments);
});
departmentsRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare(`
    SELECT id, name, description, created_at
    FROM departments WHERE id = ?
 `);
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Department not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json(row);
});
departmentsRouter.post('/', (req, res) => {
    const { name, description } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.run(`
    INSERT INTO departments (id, name, description, created_at)
    VALUES (?, ?, ?, ?)
  `, [id, name, description || '', now]);
    saveDb();
    res.json({
        id,
        name,
        description: description || '',
        created_at: now
    });
});
departmentsRouter.patch('/:id', (req, res) => {
    const { name, description } = req.body;
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM departments WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Department not found' });
    }
    stmt.free();
    if (name !== undefined)
        db.run('UPDATE departments SET name = ? WHERE id = ?', [name, req.params.id]);
    if (description !== undefined)
        db.run('UPDATE departments SET description = ? WHERE id = ?', [description, req.params.id]);
    saveDb();
    const getStmt = db.prepare('SELECT * FROM departments WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json(row);
});
departmentsRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM departments WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Department not found' });
    }
    stmt.free();
    db.run('DELETE FROM departments WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
