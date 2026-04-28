export interface Agent {
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
  department_id?: string | null
  api_key?: string | null
}

export interface Department {
  id: string
  name: string
  description: string
  created_at: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  agent_id: string
  content: string
  created_at: string
}

export interface RoutingRule {
  id: string
  source_department_id: string
  target_role_id: string | null
  target_department_id: string | null
  created_at: string
}

export interface AgentRole {
  id: string
  name: string
  permissions: string[]
  tier: number
  color: string
}

export interface Ticket {
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

export interface Delegation {
  id: string
  from_agent_id: string
  to_agent_id: string
  ticket_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  resolved_at: string | null
}

export interface Roadmap {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'completed'
  created_at: string
}

export interface Milestone {
  id: string
  roadmap_id: string
  name: string
  description: string
  target_date: string
  status: 'pending' | 'in_progress' | 'completed'
  ticket_ids: string[]
}

export type CreateAgentInput = Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'api_key'>
export type UpdateAgentInput = Partial<CreateAgentInput>

export type CreateTicketInput = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>
export type UpdateTicketInput = Partial<CreateTicketInput>

export type CreateRoleInput = Omit<AgentRole, 'id'>
export type UpdateRoleInput = Partial<CreateRoleInput>

export type CreateRoadmapInput = Omit<Roadmap, 'id' | 'created_at'>
export type UpdateRoadmapInput = Partial<CreateRoadmapInput>

export type CreateDelegationInput = Omit<Delegation, 'id' | 'status' | 'created_at' | 'resolved_at'>
export type UpdateDelegationInput = Partial<{ status: string }>

export type CreateMilestoneInput = Omit<Milestone, 'id'>
export type UpdateMilestoneInput = Partial<CreateMilestoneInput>

export type CreateDepartmentInput = Omit<Department, 'id' | 'created_at'>
export type UpdateDepartmentInput = Partial<CreateDepartmentInput>

export type CreateRoutingRuleInput = Omit<RoutingRule, 'id' | 'created_at'>
export type UpdateRoutingRuleInput = Partial<CreateRoutingRuleInput>

export type CreateTicketCommentInput = Omit<TicketComment, 'id' | 'created_at'>