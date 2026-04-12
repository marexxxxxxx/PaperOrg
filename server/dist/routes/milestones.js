import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const milestonesRouter = Router();
milestonesRouter.get('/', (req, res) => {
    const db = getDb();
    const roadmapId = req.query.roadmap_id;
    let query = 'SELECT * FROM milestones';
    const params = [];
    if (roadmapId) {
        query += ' WHERE roadmap_id = ?';
        params.push(roadmapId);
    }
    query += ' ORDER BY target_date ASC';
    const stmt = db.prepare(query);
    if (params.length)
        stmt.bind(params);
    const milestones = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        milestones.push({
            ...row,
            ticket_ids: JSON.parse(row.ticket_ids || '[]')
        });
    }
    stmt.free();
    res.json(milestones);
});
milestonesRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM milestones WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Milestone not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json({
        ...row,
        ticket_ids: JSON.parse(row.ticket_ids || '[]')
    });
});
milestonesRouter.post('/', (req, res) => {
    const { roadmap_id, name, description, target_date, status, ticket_ids } = req.body;
    const id = uuidv4();
    const db = getDb();
    db.run(`
    INSERT INTO milestones (id, roadmap_id, name, description, target_date, status, ticket_ids)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, roadmap_id, name, description || '', target_date, status || 'pending', JSON.stringify(ticket_ids || [])]);
    saveDb();
    res.json({
        id,
        roadmap_id,
        name,
        description,
        target_date,
        status: status || 'pending',
        ticket_ids: ticket_ids || []
    });
});
milestonesRouter.patch('/:id', (req, res) => {
    const { name, description, target_date, status, ticket_ids } = req.body;
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM milestones WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Milestone not found' });
    }
    stmt.free();
    if (name !== undefined)
        db.run('UPDATE milestones SET name = ? WHERE id = ?', [name, req.params.id]);
    if (description !== undefined)
        db.run('UPDATE milestones SET description = ? WHERE id = ?', [description, req.params.id]);
    if (target_date !== undefined)
        db.run('UPDATE milestones SET target_date = ? WHERE id = ?', [target_date, req.params.id]);
    if (status !== undefined)
        db.run('UPDATE milestones SET status = ? WHERE id = ?', [status, req.params.id]);
    if (ticket_ids !== undefined)
        db.run('UPDATE milestones SET ticket_ids = ? WHERE id = ?', [JSON.stringify(ticket_ids), req.params.id]);
    saveDb();
    const getStmt = db.prepare('SELECT * FROM milestones WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json({
        ...row,
        ticket_ids: JSON.parse(row.ticket_ids || '[]')
    });
});
milestonesRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM milestones WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Milestone not found' });
    }
    stmt.free();
    db.run('DELETE FROM milestones WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
