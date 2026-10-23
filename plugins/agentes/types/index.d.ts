export type Phase = 'plan' | 'design' | 'delegate' | 'review' | 'close'

export type PlannedTask = {
  title: string
  tier: string
  after: number[]
}

export type Flow = {
  title: string
  total: number
  done: number
  running: number
  phase: Phase
  isFinished: boolean
  tasks: PlannedTask[]
}

/** `idle` is the session between turns. */
export type AgentStatus = 'running' | 'done' | 'failed' | 'stopped' | 'idle'

export type AgentRun = {
  id: string
  agentId?: string
  type: string
  description: string
  model: string
  effort?: string
  status: AgentStatus
  startedAt: number
  endedAt?: number
  contextTokens: number
  contextMax: number
  tokens: number
  costUsd: number
  steps: number
  round: number
  /** Tool calls the subagent made, and the last one's name. */
  tools: number
  lastTool?: string
  /** The session only: time spent in finished turns, and when the current turn began. */
  activeMs?: number
  turnStartedAt?: number
  /** Self-reported by the worker through the `step` tool. */
  stepDone?: number
  stepTotal?: number
  stepNote?: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

/** The main agent's own task list: TodoWrite, TaskCreate/TaskUpdate or the desktop plan. */
export type Task = {
  id: string
  title: string
  status: TaskStatus
}

export type Panel = {
  isCompact: boolean
  isDoneCollapsed: boolean
  isTasksCollapsed: boolean
  isBandHidden: boolean
  autoOpenedFor: string
}

declare module 'claude-code' {
  interface PluginState {
    agentes: {
      flow: Flow | null
      agents: AgentRun[]
      tasks: Task[]
      /** The current session's own agent, drawn as the first row. */
      session: AgentRun
      panel: Panel
      now: number
    }
  }
}
