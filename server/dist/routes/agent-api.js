import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const agentApiRouter = Router();
// Middleware for authentication
const authenticateAgent = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid x-api-key header' });
    }
    const db = getDb();
    const stmt = db.prepare(`
    SELECT a.*, r.tier as role_tier, r.name as role_name
    FROM agents a
    LEFT JOIN roles r ON a.role_id = r.id
    WHERE a.api_key = ?
  `);
    stmt.bind([apiKey]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(401).json({ error: 'Unauthorized: Invalid api key' });
    }
    const agent = stmt.getAsObject();
    stmt.free();
    req.agent = agent;
    next();
};
agentApiRouter.use(authenticateAgent);
// Helper function to check routing rules
const checkRoutingRules = (sourceDepartmentId, targetRoleId, targetDepartmentId) => {
    if (!sourceDepartmentId) {
        // If the sender doesn't have a department, they might be restricted or allowed by default depending on policy.
        // For now, let's allow it if there are no rules.
        return true;
    }
    const db = getDb();
    // Check if there are ANY rules for this source department. If not, it can send anywhere (default open)
    // or we can make it default closed. The prompt said "default funktion bei der das so funktioniert... aber erweiterbar"
    // Let's implement: if rules exist for a source department, it must match one. If no rules exist, it's allowed.
    const rulesStmt = db.prepare('SELECT * FROM routing_rules WHERE source_department_id = ?');
    rulesStmt.bind([sourceDepartmentId]);
    let hasRules = false;
    let isAllowed = false;
    while (rulesStmt.step()) {
        hasRules = true;
        const rule = rulesStmt.getAsObject();
        let matchesTargetRole = true;
        if (rule.target_role_id) {
            matchesTargetRole = rule.target_role_id === targetRoleId;
        }
        let matchesTargetDepartment = true;
        if (rule.target_department_id) {
            matchesTargetDepartment = rule.target_department_id === targetDepartmentId;
        }
        if (matchesTargetRole && matchesTargetDepartment) {
            isAllowed = true;
            break;
        }
    }
    rulesStmt.free();
    // If there are no specific routing rules for this department, default to allowed
    if (!hasRules)
        return true;
    return isAllowed;
};
agentApiRouter.get('/tickets', (req, res) => {
    const agent = req.agent;
    const db = getDb();
    // Determine what metadata to include based on role tier
    let query = `
    SELECT id, title, description, priority, status
    FROM tickets
    WHERE assignee_id = ?
    ORDER BY created_at DESC
  `;
    if (agent.role_tier && Number(agent.role_tier) >= 7) { // High level roles like CTO/Lead Dev
        query = `
      SELECT id, title, description, priority, status, creator_id, created_at, tags
      FROM tickets
      WHERE assignee_id = ?
      ORDER BY created_at DESC
    `;
    }
    const stmt = db.prepare(query);
    stmt.bind([agent.id]);
    let tickets = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        if (row.tags) {
            row.tags = JSON.parse(row.tags || '[]');
        }
        tickets.push(row);
    }
    stmt.free();
    // Fetch comments for each ticket
    for (const ticket of tickets) {
        const commentStmt = db.prepare(`
        SELECT id, agent_id, content, created_at
        FROM ticket_comments
        WHERE ticket_id = ?
        ORDER BY created_at ASC
      `);
        commentStmt.bind([ticket.id]);
        ticket.comments = [];
        while (commentStmt.step()) {
            ticket.comments.push(commentStmt.getAsObject());
        }
        commentStmt.free();
    }
    res.json(tickets);
});
agentApiRouter.post('/tickets', (req, res) => {
    const agent = req.agent;
    const { title, description, priority, target_agent_id } = req.body;
    const db = getDb();
    let targetRoleId = null;
    let targetDepartmentId = null;
    if (target_agent_id) {
        const targetStmt = db.prepare('SELECT role_id, department_id FROM agents WHERE id = ?');
        targetStmt.bind([target_agent_id]);
        if (targetStmt.step()) {
            const targetAgent = targetStmt.getAsObject();
            targetRoleId = targetAgent.role_id;
            targetDepartmentId = targetAgent.department_id;
        }
        else {
            targetStmt.free();
            return res.status(404).json({ error: 'Target agent not found' });
        }
        targetStmt.free();
        // Check routing rules
        if (!checkRoutingRules(agent.department_id, targetRoleId, targetDepartmentId)) {
            return res.status(403).json({ error: 'Routing rule violation: You are not allowed to send tickets to this agent.' });
        }
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    db.run(`
    INSERT INTO tickets (id, title, description, priority, status, assignee_id, creator_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
        id,
        title,
        description || '',
        priority || 'P3',
        'open',
        target_agent_id || null,
        agent.id,
        now,
        now
    ]);
    saveDb();
    res.status(201).json({
        id,
        title,
        description,
        status: 'open',
        message: 'Ticket created successfully'
    });
});
agentApiRouter.patch('/tickets/:id', (req, res) => {
    const agent = req.agent;
    const { status, target_agent_id } = req.body;
    const ticketId = req.params.id;
    if (!status && !target_agent_id) {
        return res.status(400).json({ error: 'Status or target_agent_id is required' });
    }
    const db = getDb();
    // Verify the ticket belongs to the agent
    const stmt = db.prepare('SELECT id FROM tickets WHERE id = ? AND assignee_id = ?');
    stmt.bind([ticketId, agent.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Ticket not found or not assigned to you' });
    }
    stmt.free();
    if (target_agent_id) {
        const targetStmt = db.prepare('SELECT role_id, department_id FROM agents WHERE id = ?');
        targetStmt.bind([target_agent_id]);
        if (targetStmt.step()) {
            const targetAgent = targetStmt.getAsObject();
            const targetRoleId = targetAgent.role_id;
            const targetDepartmentId = targetAgent.department_id;
            if (!checkRoutingRules(agent.department_id, targetRoleId, targetDepartmentId)) {
                targetStmt.free();
                return res.status(403).json({ error: 'Routing rule violation: You are not allowed to delegate to this agent.' });
            }
        }
        else {
            targetStmt.free();
            return res.status(404).json({ error: 'Target agent not found' });
        }
        targetStmt.free();
    }
    const now = new Date().toISOString();
    if (status && target_agent_id) {
        db.run('UPDATE tickets SET status = ?, assignee_id = ?, updated_at = ? WHERE id = ?', [status, target_agent_id, now, ticketId]);
    }
    else if (status) {
        db.run('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?', [status, now, ticketId]);
    }
    else if (target_agent_id) {
        db.run('UPDATE tickets SET assignee_id = ?, updated_at = ? WHERE id = ?', [target_agent_id, now, ticketId]);
    }
    saveDb();
    res.json({ success: true, message: 'Ticket updated successfully' });
});
agentApiRouter.post('/tickets/:id/comments', (req, res) => {
    const agent = req.agent;
    const { content } = req.body;
    const ticketId = req.params.id;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }
    const db = getDb();
    // Optional: Check if agent has access to the ticket (assigned or creator, or maybe any agent can comment depending on policy)
    // For now, allow if the ticket exists
    const stmt = db.prepare('SELECT id FROM tickets WHERE id = ?');
    stmt.bind([ticketId]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Ticket not found' });
    }
    stmt.free();
    const commentId = uuidv4();
    const now = new Date().toISOString();
    db.run(`
    INSERT INTO ticket_comments (id, ticket_id, agent_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [commentId, ticketId, agent.id, content, now]);
    saveDb();
    res.status(201).json({
        id: commentId,
        content,
        created_at: now
    });
});
