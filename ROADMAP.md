# PaperOrg Roadmap - Detaillierter Implementierungsplan

## 1. Projektübersicht

### Vision
PaperOrg ist eine **Agent Orchestration Platform** die komplexe Firmenstrukturen mit KI-Agenten abbildet.

**Was PaperOrg ist:**
- Integriertes Ticketsystem für Aufgabenverteilung
- Visuelles Organigramm der Agenten-Beziehungen
- Rollen- und Prioritätssystem
- Delegation-Funktionalität zwischen Agenten

**Was PaperOrg NICHT ist:**
- Workspace Orchestrator
- Tool zur Bearbeitung von System-Prompts für Agents

### Kernphilosophie
```
┌─────────────────────────────────────────────────────┐
│  PaperOrg = Agenten ⊕ Tickets ⊕ Organigramm         │
└─────────────────────────────────────────────────────┘
```

---

## 2. Technische Architektur

### Stack-Entscheidungen
| Komponente | Wahl | Begründung |
|------------|------|------------|
| **Frontend** | React + TypeScript | Single Repo, starke UI-Libraries |
| **Backend** | Express + TypeScript | Einheitliche Sprache, Monolith |
| **Datenbank** | SQLite | Prototyp-fokus, keine externe DB nötig |
| **UI-Framework** | shadcn/ui + Tailwind | Modern, erweiterbar |
| **State** | Zustand + React Query | Leichtgewichtig, MVP-tauglich |
| **AI-Interface** | Abstrakte Adapter + Mock | Testbar, später integrierbar |

### Datenmodell (Kern-Entitäten)

```typescript
// Agent
interface Agent {
  id: string           // UUID
  name: string
  role_id: string       // Verweis auf AgentRole
  parent_id: string | null  // Für Hierarchie
  capabilities: string[]
  status: 'active' | 'idle' | 'busy'
  avatar_url?: string
  description?: string
  created_at: timestamp
  updated_at: timestamp
}

// AgentRole
interface AgentRole {
  id: string
  name: string           // z.B. "Senior Developer", "QA Lead"
  permissions: string[]
  tier: number           // Für Delegation-Berechtigung (höher kann an niedriger delegieren)
  color: string          // Für Visualisierung
}

// Ticket
interface Ticket {
  id: string           // UUID
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'open' | 'in_progress' | 'blocked' | 'resolved' | 'closed'
  assignee_id: string  // Agent-ID
  creator_id: string    // Wer erstellt hat
  created_at: timestamp
  updated_at: timestamp
  due_date: timestamp | null
  parent_ticket_id: string | null  // Sub-Tasks
  tags: string[]
}

// Delegation
interface Delegation {
  id: string           // UUID
  from_agent_id: string
  to_agent_id: string
  ticket_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: timestamp
  resolved_at: timestamp | null
}

// Roadmap
interface Roadmap {
  id: string           // UUID
  name: string
  description: string
  start_date: timestamp
  end_date: timestamp
  status: 'draft' | 'active' | 'completed'
  created_at: timestamp
}

// Milestone
interface Milestone {
  id: string           // UUID
  roadmap_id: string
  name: string
  description: string
  target_date: timestamp
  status: 'pending' | 'in_progress' | 'completed'
  ticket_ids: string[]
}
```

---

## 3. Feature-Roadmap nach Phasen

### Phase 1: Foundation (Sprint 1-2)
**Ziel**: Basis-Struktur + Agent-CRUD + Projekt-Scaffold

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Projekt-Scaffold | React + Express + SQLite + Tailwind Setup | 1 Tag |
| Agent-Modell | DB-Schema + CRUD API | 1 Tag |
| Agent-Liste UI | Hauptübersicht aller Agenten | 2 Tage |
| Agent-Erstellung | Formular + Validierung | 1 Tag |
| Agent-Bearbeitung | Detail-Ansicht + Edit | 1 Tag |
| Agent-Archivierung | Soft-Delete | 0.5 Tag |

### Phase 2: Rollen & Hierarchie (Sprint 2-3)
**Ziel**: Organisationsstruktur

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Rollen-System | Rollen anlegen, Rechte definieren | 2 Tage |
| Organisationsbaum | Parent-Child Beziehungen | 2 Tage |
| Delegation-Rechte | Wer darf an wen delegieren? (Tier-basiert) | 1 Tag |
| Agent-Detailseite | Vollständige Agenten-Info | 1 Tag |
| Rollen-Filterung | Nach Rolle filtern | 0.5 Tag |

### Phase 3: Ticketsystem (Sprint 3-4)
**Ziel**: Kern-Feature - Task-Verteilung

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Ticket-Modell | DB-Schema + CRUD | 1 Tag |
| Ticket-Liste | Gefilterte Übersicht | 2 Tage |
| Ticket-Erstellung | Formular mit Zuweisung | 2 Tage |
| Ticket-Detailseite | Vollständige Info + Comments | 1 Tag |
| Prioritäten | P1-P4 System mit Farben | 1 Tag |
| Status-Workflow | open → in_progress → resolved | 1 Tag |
| Ticket-Filterung | Nach Status, Priority, Assignee | 1 Tag |
| Sub-Tickets | Parent-Child Tickets | 1 Tag |

### Phase 4: Organigramm-Visualisierung (Sprint 4-5)
**Ziel**: Das "PaperOrg"-Look - visuelle Hierarchie

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| OrgChart-Komponente | Hierarchie-Visualisierung | 3 Tage |
| Agent-Karten | Visuelle Agenten-Darstellung | 1 Tag |
| Verbindungslinien | Beziehungen visualisieren | 1 Tag |
| Zoom/Pan | Navigation im Chart | 1 Tag |
| Detail-Popover | Klick zeigt Agent-Info | 1 Tag |
| Filter-Modi | Nach Rolle, Status | 0.5 Tag |

### Phase 5: Delegation (Sprint 5-6)
**Ziel**: Agent-zu-Agent Aufgabenverteilung

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Delegation-UI | "An Agent delegieren" Modal | 2 Tage |
| Delegation-API | Request + Accept/Reject | 2 Tage |
| Benachrichtigungen | Badge bei offenen Requests | 1 Tag |
| Delegation-History | Wer hat an wen delegiert? | 1 Tag |
| Auto-Assign | Automatische Zuweisung basierend auf Tier | 1 Tag |

### Phase 6: Roadmaps & Planning (Sprint 6-7)
**Ziel**: Langfristige Planung

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Roadmap-Modell | DB-Schema | 1 Tag |
| Roadmap-Liste | Übersicht aller Roadmaps | 1 Tag |
| Roadmap-Detail | Zeitachse + Milestones | 2 Tage |
| Milestone-Verknüpfung | Tickets zu Milestones | 1 Tag |
| Fortschrittsanzeige | % pro Milestone | 1 Tag |
| Roadmap-Export | JSON/MD Export | 0.5 Tag |

### Phase 7: Dashboard & Stats (Sprint 7-8)
**Ziel**: Überblick + Metriken

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Dashboard-Startseite | Zusammenfassung | 2 Tage |
| Ticket-Statistiken | Offen/in Progress/Resolved | 1 Tag |
| Agent-Auslastung | Wer ist wie ausgelastet? | 1 Tag |
| Recent Activity | Letzte Aktionen | 1 Tag |
| Burndown-Chart | Ticket-Fortschritt | 1 Tag |

### Phase 8: AI-Provider Mock (Sprint 8-9)
**Ziel**: Testbare Simulation

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| IAIProvider Interface | Abstrakte Schicht | 1 Tag |
| MockAIProvider | Simulierte Responses | 2 Tage |
| Demo-Workflow | Beispiel-Delegation | 1 Tag |
| Provider-Umschalter | Mock ↔ Production | 1 Tag |
| Provider-Konfiguration | Per Config-JSON | 1 Tag |

---

## 4. UI-/UX-Konzept

### Hauptseiten / Navigation
```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo] PaperOrg    │ Agents │ Tickets │ Roadmaps │ Dashboard    │
└────���─��───────────────────────────────────────────────────────────┘
```

### 1. Agents-Seite (Listenansicht)
- Tabelle mit: Name, Rolle, Status, Parent, Erstellt
- Suchfeld + Filter (Rolle, Status)
- Klick auf Agent → OrgChart-Zentrierung
- Action-Buttons: Edit, Delegieren, Archivieren

### 2. Organigramm (Kern-Feature)
```
       ┌─────────────┐
       │   CEO      │  ← Hauptknoten (keine Parent)
       │  Agent-1   │
       └─────┬─────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───┴───┐ ┌─┴──┐ ┌───┴───┐
│ Lead  │ │Dev │ │  QA  │
│Agent-2│ │A-3 │ │Agent-4│
└───────┘ └────┘ └───────┘
```
- Vertikaler Baum (top-down)
- Farbkodierung nach Rolle
- Hover zeigt Quick-Info (Tooltip)
- Klick → Agent-Detailseite
- Admin: Drag-to-reparent

### 3. Tickets-Seite
- **Kanban-Modus**: Open | In Progress | Blocked | Resolved
- **Listen-Modus**: Sortierbare Tabelle
- Filter: Status, Priority, Assignee, Tags
- Bulk-Actions für Admin

### 4. Roadmap-Seite
- Horizontale Zeitachse (Gantt-ähnlich)
- Milestones als Meilensteine (Diamant-Symbol)
- Tickets als Items unter Milestones
- Farbkodierung nach Status

### 5. Dashboard
- KPI-Karten: Offene Tickets, Heute fällig, Durchschn. Lösungszeit
- Mini-OrgChart (Top-5 Hierarchie)
- Recent Activity Feed (letzte 10 Aktionen)

---

## 5. AI-Provider Integration (Zukunft)

### Abstrahiertes Interface
```typescript
interface IAIProvider {
  // Prompt an Agent senden
  sendPrompt(agent: Agent, task: string): Promise<AIPromptResponse>
  
  // Delegation vorschlagen
  suggestDelegation(agent: Agent, task: Task): Promise<SuggestedAgent[]>
  
  // Agent-Performance analysieren
  analyzeAgentPerformance(agent: Agent): Promise<PerformanceMetrics>
}
```

### Mock-Implementierung
```typescript
class MockAIProvider implements IAIProvider {
  async sendPrompt(agent: Agent, task: string): Promise<AIPromptResponse> {
    return {
      success: true,
      response: `Mock-Response für Agent ${agent.name}: Aufgabe "${task}" wurde simuliert.`,
      duration: Math.random() * 1000
    }
  }
}
```

### Später: Externe Provider
- Interface bleibt gleich
- Nur Provider- Klasse tauschen
- Konfiguration via Config-Datei

---

## 6. Projektstruktur

```
/paperorg
├── /client                 # React Frontend
│   ├── /src
│   │   ├── /components     # UI-Komponenten
│   │   ├── /pages          # Seiten (Agents, Tickets, etc.)
│   │   ├── /hooks          # Custom Hooks
│   │   ├── /lib            # Utilities
│   │   └── /types          # TypeScript Typen
│   ├── package.json
│   └── vite.config.ts
│
├── /server                 # Express Backend
│   ├── /src
│   │   ├── /routes        # API-Routen
│   │   ├── /controllers   # Request-Handler
│   │   ├── /models        # Datenmodelle
│   │   ├── /services      # Business Logic
│   │   └── /db             # SQLite Setup
│   ├── package.json
│   └── index.ts
│
├── /shared                 # Geteilte Typen
│   └── /types
│
├── package.json            # Root mit Scripts
└── README.md
```

---

## 7. Definition of Done (MVP)

- [ ] Projekt startet ohne Fehler (Client + Server)
- [ ] Agenten können erstellt, bearbeitet, gelöscht werden
- [ ] Rollen können zugewiesen werden
- [ ] Hierarchie wird visualisiert (OrgChart)
- [ ] Tickets können erstellt und zugewiesen werden
- [ ] Prioritäten und Status funktionieren
- [ ] Delegation kann erstellt werden
- [ ] Dashboard zeigt Statistiken
- [ ] Mock AI Provider antwortet
- [ ] UI ist visuell ansprechend

---

## 8. Zeitplan (Geschätzt)

| Phase | Dauer | Summe |
|-------|-------|-------|
| 1: Foundation | 2 Wochen | 2 Wochen |
| 2: Rollen & Hierarchie | 2 Wochen | 4 Wochen |
| 3: Ticketsystem | 2 Wochen | 6 Wochen |
| 4: Organigramm | 2 Wochen | 8 Wochen |
| 5: Delegation | 2 Wochen | 10 Wochen |
| 6: Roadmaps | 2 Wochen | 12 Wochen |
| 7: Dashboard | 2 Wochen | 14 Wochen |
| 8: AI-Provider Mock | 2 Wochen | 16 Wochen |

**Gesamt: ~4 Monate für voll funktionsfähigen Prototyp**

---

*Erstellt: 2026-04-11*
*Version: 1.0.0*