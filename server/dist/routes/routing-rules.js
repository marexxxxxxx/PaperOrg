import { Router } from 'express';
import { getDb, saveDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
export const routingRulesRouter = Router();
routingRulesRouter.get('/', (req, res) => {
    const db = getDb();
    const result = db.exec(`
    SELECT id, source_department_id, target_role_id, target_department_id, created_at
    FROM routing_rules ORDER BY created_at DESC
  `);
    if (!result[0])
        return res.json([]);
    const columns = result[0].columns;
    const rules = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
    res.json(rules);
});
routingRulesRouter.get('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare(`
    SELECT id, source_department_id, target_role_id, target_department_id, created_at
    FROM routing_rules WHERE id = ?
 `);
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Routing rule not found' });
    }
    const row = stmt.getAsObject();
    stmt.free();
    res.json(row);
});
routingRulesRouter.post('/', (req, res) => {
    const { source_department_id, target_role_id, target_department_id } = req.body;
    if (!source_department_id) {
        return res.status(400).json({ error: 'source_department_id is required' });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.run(`
    INSERT INTO routing_rules (id, source_department_id, target_role_id, target_department_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [id, source_department_id, target_role_id || null, target_department_id || null, now]);
    saveDb();
    res.json({
        id,
        source_department_id,
        target_role_id: target_role_id || null,
        target_department_id: target_department_id || null,
        created_at: now
    });
});
routingRulesRouter.patch('/:id', (req, res) => {
    const { source_department_id, target_role_id, target_department_id } = req.body;
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM routing_rules WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Routing rule not found' });
    }
    stmt.free();
    if (source_department_id !== undefined)
        db.run('UPDATE routing_rules SET source_department_id = ? WHERE id = ?', [source_department_id, req.params.id]);
    if (target_role_id !== undefined)
        db.run('UPDATE routing_rules SET target_role_id = ? WHERE id = ?', [target_role_id || null, req.params.id]);
    if (target_department_id !== undefined)
        db.run('UPDATE routing_rules SET target_department_id = ? WHERE id = ?', [target_department_id || null, req.params.id]);
    saveDb();
    const getStmt = db.prepare('SELECT * FROM routing_rules WHERE id = ?');
    getStmt.bind([req.params.id]);
    getStmt.step();
    const row = getStmt.getAsObject();
    getStmt.free();
    res.json(row);
});
routingRulesRouter.delete('/:id', (req, res) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM routing_rules WHERE id = ?');
    stmt.bind([req.params.id]);
    if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ error: 'Routing rule not found' });
    }
    stmt.free();
    db.run('DELETE FROM routing_rules WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});
