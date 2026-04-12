# PaperOrg - AI Agent Organization Platform

Ein modernes Web-Application für die Organisation und Verwaltung von AI-Agenten mit hierarchischen Strukturen, Ticket-Management, Roadmaps und Delegation-Systemen.

## 🚀 Features

### Dashboard
- **Statistiken**: Übersicht über Agenten, offene/in-progress/erledigte Tickets
- **Burndown-Chart**: 7-Tage Visualisierung des Ticket-Fortschritts
- **Agent-Auslastung**: Echtzeit-Anzeige der aktiven und abgeschlossenen Tickets pro Agent

### Agents (mit Organigramm)
- **CRUD**: Erstellen, Bearbeiten, Löschen von Agenten
- **Rollen-System**: 5 vordefinierte Rollen (CEO, Lead Developer, Developer, QA Engineer, Designer) mit unterschiedlichen Tier-Stufen
- **Hierarchie**: Eltern-Kind-Beziehungen zwischen Agenten
- **OrgChart**: Interaktive Visualisierung der Organisationsstruktur
  - Zoom/Pan mit Mausrad und Drag
  - Filter nach Rolle und Status
  - Detail-Popover mit umfassenden Agenten-Informationen

### Tickets
- **CRUD**: Vollständiges Ticket-Management
- **Prioritäten**: P1 (Critical), P2 (High), P3 (Medium), P4 (Low)
- **Status-Workflow**: Open → In Progress → Blocked → Resolved → Closed
- **Zuweisung**: Agenten können Tickets zugewiesen werden
- **Tags & Due Dates**: Flexible Metadaten
- **Parent Tickets**: Unterstützung für Sub-Tickets
- **Auto-Assign**: Automatische Zuweisung zum am wenigsten ausgelasteten Agenten

### Roadmaps
- **CRUD**: Erstellen und Verwalten von Roadmaps
- **Milestones**: Unterstützung für Meilensteine mit Ziel-Datum und Status
- **Fortschrittsanzeige**: Automatische Berechnung basierend auf verknüpften Tickets
- **Timeline**: Visuelle Darstellung des Roadmap-Zeitplans

### Delegation
- **Delegation-Anfragen**: Agenten können Tickets an andere delegieren
- **Approval-Workflow**: Delegationen müssen akzeptiert oder abgelehnt werden
- **Auto-Transfer**: Bei Akzeptanz wird das Ticket automatisch umgewidmet
- **History**: Vollständiger Verlauf aller Delegationen

### AI Provider (Settings)
- **Provider-Auswahl**: Mock, OpenAI, Anthropic
- **Demo-Workflow**: Testen der AI-Funktionalität
- **Agent-Vorschläge**: AI-basierte Empfehlungen für Ticket-Zuweisungen
- **Performance-Analyse**: Metriken für Agenten

## 🛠 Tech Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** - Build-Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data Fetching
- **Lucide React** - Icons

### Backend
- **Express.js** - Web-Framework
- **SQL.js** - SQLite-in-JavaScript (Client-side DB)
- **UUID** - ID-Generierung
- **CORS** - Cross-Origin Resource Sharing

### Architecture
```
PaperOrg/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/  # UI-Komponenten
│   │   ├── pages/       # Seiten
│   │   ├── hooks/       # Custom Hooks
│   │   └── lib/         # Utilities
│   └── package.json
├── server/          # Express Backend
│   ├── src/
│   │   ├── routes/     # API-Routen
│   │   ├── services/   # Business Logic
│   │   └── db/         # Datenbank
│   └── package.json
├── shared/          # Geteilte Typen
│   └── types/
├── data/            # SQLite Datenbank
└── package.json     # Root Scripts
```

## 📋 Installation & Start

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Schritt-für-Schritt

1. **Repository klonen**
   ```bash
   cd PaperOrg
   ```

2. **Dependencies installieren**
   ```bash
   # Root Dependencies
   npm install
   
   # Client Dependencies
   cd client && npm install && cd ..
   
   # Server Dependencies
   cd server && npm install && cd ..
   ```

3. **Entwicklung starten**
   ```bash
   # Aus Root-Verzeichnis - startet Client und Server
   npm run dev
   ```

   Oder einzeln:
   ```bash
   # Server (Port 3001)
   npm run dev:server
   
   # Client (Port 5173)
   npm run dev:client
   ```

4. **Production Build**
   ```bash
   npm run build
   ```

5. **Production starten**
   ```bash
   npm run start
   ```

### Zugängliche URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🔑 API Endpoints

### Agents
- `GET /api/agents` - Alle Agenten
- `GET /api/agents/:id` - Einzelner Agent
- `POST /api/agents` - Agent erstellen
- `PATCH /api/agents/:id` - Agent aktualisieren
- `DELETE /api/agents/:id` - Agent löschen

### Roles
- `GET /api/roles` - Alle Rollen
- `GET /api/roles/:id` - Einzelne Rolle
- `POST /api/roles` - Rolle erstellen
- `PATCH /api/roles/:id` - Rolle aktualisieren
- `DELETE /api/roles/:id` - Rolle löschen

### Tickets
- `GET /api/tickets` - Alle Tickets
- `GET /api/tickets/:id` - Einzelnes Ticket
- `POST /api/tickets` - Ticket erstellen
- `POST /api/tickets/auto-assign` - Auto-Assign zu Agent
- `PATCH /api/tickets/:id` - Ticket aktualisieren
- `DELETE /api/tickets/:id` - Ticket löschen

### Delegations
- `GET /api/delegations` - Alle Delegationen
- `GET /api/delegations/:id` - Einzelne Delegation
- `POST /api/delegations` - Delegation erstellen
- `PATCH /api/delegations/:id` - Delegation status ändern (accept/reject)
- `DELETE /api/delegations/:id` - Delegation löschen

### Roadmaps
- `GET /api/roadmaps` - Alle Roadmaps
- `GET /api/roadmaps/:id` - Einzelne Roadmap
- `POST /api/roadmaps` - Roadmap erstellen
- `PATCH /api/roadmaps/:id` - Roadmap aktualisieren
- `DELETE /api/roadmaps/:id` - Roadmap löschen

### Milestones
- `GET /api/milestones` - Alle Milestones (optional: ?roadmap_id=...)
- `GET /api/milestones/:id` - Einzelner Milestone
- `POST /api/milestones` - Milestone erstellen
- `PATCH /api/milestones/:id` - Milestone aktualisieren
- `DELETE /api/milestones/:id` - Milestone löschen

### AI
- `POST /api/ai/prompt` - Prompt an Agent senden
- `POST /api/ai/suggest` - Agent-Vorschläge für Task
- `GET /api/ai/performance/:agent_id` - Agent Performance
- `GET /api/ai/status` - Provider Status

## 📊 Datenmodell

### Agent
```typescript
{
  id: string
  name: string
  role_id: string
  parent_id: string | null
  capabilities: string[]
  status: 'active' | 'idle' | 'busy'
  avatar_url?: string
  description?: string
  created_at: string
  updated_at: string
}
```

### Ticket
```typescript
{
  id: string
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'open' | 'in_progress' | 'blocked' | 'resolved' | 'closed'
  assignee_id: string
  creator_id: string
  created_at: string
  updated_at: string
  due_date: string | null
  parent_ticket_id: string | null
  tags: string[]
}
```

### Roadmap
```typescript
{
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'completed'
  created_at: string
}
```

### Milestone
```typescript
{
  id: string
  roadmap_id: string
  name: string
  description: string
  target_date: string
  status: 'pending' | 'in_progress' | 'completed'
  ticket_ids: string[]
}
```

### Delegation
```typescript
{
  id: string
  from_agent_id: string
  to_agent_id: string
  ticket_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  resolved_at: string | null
}
```

## 🎯 Nutzung

### Agent erstellen
1. Navigiere zu **Agents**
2. Klicke auf **Add Agent**
3. Fülle Name, Rolle, Status aus
4. Optional: Capabilities (kommasepariert), Description
5. Wähle einen "Reports to" Manager (optional)

### Ticket erstellen
1. Navigiere zu **Tickets**
2. Klicke auf **Create Ticket**
3. Fülle Titel, Beschreibung, Priorität
4. Wähle einen Assignee
5. Optional: Due Date, Tags, Parent Ticket

### Roadmap erstellen
1. Navigiere zu **Roadmaps**
2. Klicke auf **New Roadmap**
3. Fülle Name, Beschreibung, Start/End-Datum
4. Klicke auf die Roadmap-Karte für Detailansicht
5. Füge Milestones hinzu mit **Add Milestone**
6. Verknüpfe Tickets mit Milestones

### Delegation erstellen
1. Navigiere zu **Agents → Delegations**
2. Klicke auf **New Delegation**
3. Wähle "From Agent" und "To Agent"
4. Wähle das zu delegierende Ticket
5. Füge optional eine Nachricht hinzu

### Auto-Assign nutzen
1. Erstelle ein Ticket ohne Assignee
2. Klicke auf den **Auto** Button auf der Ticket-Karte
3. Das Ticket wird automatisch dem Agent mit der geringsten Auslastung zugewiesen

### AI Provider testen
1. Navigiere zu **Settings**
2. Wähle einen Provider (Mock/OpenAI/Anthropic)
3. Wechsle zum **Demo** Tab
4. Beschreibe eine Task
5. Wähle einen Agenten oder lasse dir Vorschläge machen

## 📝 Standard-Rollen

| Rolle | Tier | Farbe | Berechtigungen |
|-------|------|-------|----------------|
| CEO | 10 | Purple | all |
| Lead Developer | 7 | Blue | delegate, create_ticket |
| Developer | 5 | Green | create_ticket |
| QA Engineer | 5 | Orange | create_ticket |
| Designer | 5 | Pink | create_ticket |

## 🔧 Entwicklung

### Build prüfen
```bash
npm run build
```

### TypeScript prüfen
```bash
cd client && npm run build  # Client
cd server && npm run build  # Server
```

## 📄 Lizenz

MIT License