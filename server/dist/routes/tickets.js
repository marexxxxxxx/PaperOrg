import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const ticketsRouter = Router();
ticketsRouter.post('/auto-assign', (req, res) => {
    const { ticket_id, priority } = req.body;
    const db = getDb();
    const ticketStmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
    ticketStmt.bind([ticket_id]);
    if (!ticketStmt.step()) {
        ticketStmt.free();
        return res.status(404).json({ error: 'Ticket not found' });
    }
    ticketStmt.free();
    const agentsResult = db.exec(`
    SELECT a.*, r.tier, r.name as role_name
    FROM agents a
    LEFT JOIN roles r ON a.role_id = r.id
    WHERE a.status = 'active'
    ORDER BY r.tier DESC
  `);
    if (!agentsResult[0] || agentsResult[0].values.length === 0) {
        return res.status(400).json({ error: 'No active agents available' });
    }
    const agents = agentsResult[0].values.map(row => ({
        id: String(row[0]),
        name: String(row[1]),
        role_id: row[2] ? String(row[2]) : null,
        tier: row[11] ? Number(row[11]) : 0
    }));
    const ticketCountStmt = db.prepare(`
    SELECT assignee_id, COUNT(*) as count 
    FROM tickets 
    WHERE status IN ('open', 'in_progress') 
    GROUP BY assignee_id
  `);
    const workload = {};
    while (ticketCountStmt.step()) {
        const row = ticketCountStmt.getAsObject();
        if (row.assignee_id) {
            workload[row.assignee_id] = row.count;
        }
    }
    ticketCountStmt.free();
    let bestAgent = agents[0];
    let minWorkload = workload[bestAgent.id] || 0;
    for (const agent of agents) {
        const agentWorkload = workload[agent.id] || 0;
        if (agentWorkload < minWorkload) {
            minWorkload = agentWorkload;
            bestAgent = agent;
        }
    }
    db.run('UPDATE tickets SET assignee_id = ? WHERE id = ?', [bestAgent.id, ticket_id]);
    saveDb();
    res.json({
        success: true,
        assigned_to: bestAgent.id,
        agent_name: bestAgent.name
    });
});
ticketsRouter.get('/', (req, res) => {
    const db = getDb();
    const result = db.exec(`
    SELECT id, title, description, priority, status, assignee_id, creator_id, created_at, updated_at, due_date, parent_ticket_id, tags
    FROM tickets ORDER BY created_at DESC
  `);
    if (!result[0])
        return res.json([]);
    const columns = result[0].columns;
    const tickets = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = col === 'tags' ? JSON.parse(row[i] || '[]') : row[i];
        });
        return obj;
    });
    res.json(tickets);
});
ticketsRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare(`
    SELECT id, title, description, priority, status, assignee_id, creator_id, created_at, updated_at, due_date, parent_ticket_id, tags
    FROM tickets WHERE id = ?
  `);
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Ticket not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json({
        ...row,
        tags: JSON.parse(row.tags || '[]'),
    });
});
ticketsRouter.post('/', (req, res) => {
    const { title, description, priority, status, assignee_id, creator_id, parent_ticket_id, due_date, tags } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
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
    ]);
    saveDb();
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
    });
});
ticketsRouter.patch('/:id', (req, res) => {
    const { title, description, priority, status, assignee_id, parent_ticket_id, due_date, tags } = req.body;
    const now = new Date().toISOString();
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Ticket not found' });
    }
    stmt.free();
    if (title !== undefined)
        db.run('UPDATE tickets SET title = ? WHERE id = ?', [title, req.params.id]);
    if (description !== undefined)
        db.run('UPDATE tickets SET description = ? WHERE id = ?', [description, req.params.id]);
    if (priority !== undefined)
        db.run('UPDATE tickets SET priority = ? WHERE id = ?', [priority, req.params.id]);
    if (status !== undefined)
        db.run('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id]);
    if (assignee_id !== undefined)
        db.run('UPDATE tickets SET assignee_id = ? WHERE id = ?', [assignee_id || null, req.params.id]);
    if (parent_ticket_id !== undefined)
        db.run('UPDATE tickets SET parent_ticket_id = ? WHERE id = ?', [parent_ticket_id || null, req.params.id]);
    if (due_date !== undefined)
        db.run('UPDATE tickets SET due_date = ? WHERE id = ?', [due_date || null, req.params.id]);
    if (tags !== undefined)
        db.run('UPDATE tickets SET tags = ? WHERE id = ?', [JSON.stringify(tags), req.params.id]);
    db.run('UPDATE tickets SET updated_at = ? WHERE id = ?', [now, req.params.id]);
    saveDb();
    const getStmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json({
        ...row,
        tags: JSON.parse(row.tags || '[]'),
    });
});
ticketsRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM tickets WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Ticket not found' });
    }
    stmt.free();
    db.run('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
