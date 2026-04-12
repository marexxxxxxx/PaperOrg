import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const roadmapsRouter = Router();
roadmapsRouter.get('/', (req, res) => {
    const db = getDb();
    const result = db.exec('SELECT * FROM roadmaps ORDER BY created_at DESC');
    if (!result[0])
        return res.json([]);
    const columns = result[0].columns;
    const roadmaps = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
    res.json(roadmaps);
});
roadmapsRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM roadmaps WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Roadmap not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json(row);
});
roadmapsRouter.post('/', (req, res) => {
    const { name, description, start_date, end_date, status } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.run(`
    INSERT INTO roadmaps (id, name, description, start_date, end_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, name, description || '', start_date, end_date, status || 'draft', now]);
    saveDb();
    res.json({
        id,
        name,
        description,
        start_date,
        end_date,
        status: status || 'draft',
        created_at: now,
    });
});
roadmapsRouter.patch('/:id', (req, res) => {
    const { name, description, start_date, end_date, status } = req.body;
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM roadmaps WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Roadmap not found' });
    }
    stmt.free();
    if (name !== undefined)
        db.run('UPDATE roadmaps SET name = ? WHERE id = ?', [name, req.params.id]);
    if (description !== undefined)
        db.run('UPDATE roadmaps SET description = ? WHERE id = ?', [description, req.params.id]);
    if (start_date !== undefined)
        db.run('UPDATE roadmaps SET start_date = ? WHERE id = ?', [start_date, req.params.id]);
    if (end_date !== undefined)
        db.run('UPDATE roadmaps SET end_date = ? WHERE id = ?', [end_date, req.params.id]);
    if (status !== undefined)
        db.run('UPDATE roadmaps SET status = ? WHERE id = ?', [status, req.params.id]);
    saveDb();
    const getStmt = db.prepare('SELECT * FROM roadmaps WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json(row);
});
roadmapsRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM roadmaps WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Roadmap not found' });
    }
    stmt.free();
    db.run('DELETE FROM roadmaps WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
