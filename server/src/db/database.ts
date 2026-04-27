import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataDir = join(__dirname, '../../../data')
const dbPath = join(dataDir, 'paperorg.db')

let db: SqlJsDatabase

export async function initDatabase() {
  mkdirSync(dataDir, { recursive: true })
  
  const SQL = await initSqlJs()
  
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      permissions TEXT NOT NULL DEFAULT '[]',
      tier INTEGER NOT NULL DEFAULT 1,
      color TEXT NOT NULL DEFAULT '#3b82f6'
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `)

  // Add department_id and api_key columns if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_id TEXT,
      parent_id TEXT,
      capabilities TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'idle',
      avatar_url TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      department_id TEXT,
      api_key TEXT UNIQUE
    )
  `)

  // Try to add the columns to existing agents table just in case they are missing
  try { db.run("ALTER TABLE agents ADD COLUMN department_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE agents ADD COLUMN api_key TEXT"); } catch (e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'P3',
      status TEXT NOT NULL DEFAULT 'open',
      assignee_id TEXT,
      creator_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      due_date TEXT,
      parent_ticket_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]'
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS delegations (
      id TEXT PRIMARY KEY,
      from_agent_id TEXT NOT NULL,
      to_agent_id TEXT NOT NULL,
      ticket_id TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      resolved_at TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      roadmap_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      target_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      ticket_ids TEXT NOT NULL DEFAULT '[]'
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS routing_rules (
      id TEXT PRIMARY KEY,
      source_department_id TEXT NOT NULL,
      target_role_id TEXT,
      target_department_id TEXT,
      created_at TEXT NOT NULL
    )
  `)

  const roleCount = db.exec('SELECT COUNT(*) as count FROM roles')
  if (!roleCount[0] || roleCount[0].values[0][0] === 0) {
    db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
      ['role-1', 'CEO', '["all"]', 10, '#7c3aed'])
    db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
      ['role-2', 'Lead Developer', '["delegate", "create_ticket"]', 7, '#3b82f6'])
    db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
      ['role-3', 'Developer', '["create_ticket"]', 5, '#22c55e'])
    db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
      ['role-4', 'QA Engineer', '["create_ticket"]', 5, '#f59e0b'])
    db.run(`INSERT INTO roles (id, name, permissions, tier, color) VALUES (?, ?, ?, ?, ?)`,
      ['role-5', 'Designer', '["create_ticket"]', 5, '#ec4899'])
  }

  saveDb()
}

export function getDb(): SqlJsDatabase {
  return db
}

export function saveDb() {
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(dbPath, buffer)
}