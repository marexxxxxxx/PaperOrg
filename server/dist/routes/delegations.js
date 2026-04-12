import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const delegationsRouter = Router();
delegationsRouter.get('/', (req, res) => {
    const db = getDb();
    const result = db.exec(`
    SELECT id, from_agent_id, to_agent_id, ticket_id, message, status, created_at, resolved_at
    FROM delegations ORDER BY created_at DESC
  `);
    if (!result[0])
        return res.json([]);
    const columns = result[0].columns;
    const delegations = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
    res.json(delegations);
});
delegationsRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare(`
    SELECT id, from_agent_id, to_agent_id, ticket_id, message, status, created_at, resolved_at
    FROM delegations WHERE id = ?
  `);
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Delegation not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json(row);
});
delegationsRouter.post('/', (req, res) => {
    const { from_agent_id, to_agent_id, ticket_id, message } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.run(`
    INSERT INTO delegations (id, from_agent_id, to_agent_id, ticket_id, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, from_agent_id, to_agent_id, ticket_id, message || '', 'pending', now]);
    saveDb();
    res.json({
        id,
        from_agent_id,
        to_agent_id,
        ticket_id,
        message,
        status: 'pending',
        created_at: now,
        resolved_at: null,
    });
});
delegationsRouter.patch('/:id', (req, res) => {
    const { status } = req.body;
    const now = new Date().toISOString();
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM delegations WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Delegation not found' });
    }
    stmt.free();
    if (status === 'accepted' || status === 'rejected') {
        db.run('UPDATE delegations SET status = ?, resolved_at = ? WHERE id = ?', [status, now, req.params.id]);
        if (status === 'accepted') {
            const getStmt = db.prepare('SELECT ticket_id FROM delegations WHERE id = ?');
            getStmt.bind([req.params.id]);
            getStmt.step();
            const row = getStmt.getAsObject();
            getStmt.free();
            if (row.ticket_id) {
                const updateStmt = db.prepare('UPDATE tickets SET assignee_id = ? WHERE id = ?');
                const getDelegStmt = db.prepare('SELECT to_agent_id FROM delegations WHERE id = ?');
                getDelegStmt.bind([req.params.id]);
                getDelegStmt.step();
                const delegRow = getDelegStmt.getAsObject();
                getDelegStmt.free();
                updateStmt.run([delegRow.to_agent_id, row.ticket_id]);
            }
        }
    }
    saveDb();
    const getStmt = db.prepare('SELECT * FROM delegations WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json(row);
});
delegationsRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM delegations WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Delegation not found' });
    }
    stmt.free();
    db.run('DELETE FROM delegations WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
