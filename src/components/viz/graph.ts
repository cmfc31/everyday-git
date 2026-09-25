export interface GraphCommit {
  id: string
  /** Horizontal position on the track, from 0 to 100. */
  x: number
  label?: string
  tone?: 'new' | 'bad' | 'ghost' | 'merge'
}

export interface GraphLane {
  id: string
  label: string
  tone: 'main' | 'branch'
  /** Where this lane forks off another lane. */
  from?: { lane: string; x: number }
  /** Where this lane's own line begins. Defaults to the fork point, or 0. */
  start?: number
  commits: GraphCommit[]
  droppable?: boolean
  badge?: string
}

export interface GraphLink {
  from: { lane: string; x: number }
  to: { lane: string; x: number }
  tone?: 'merge' | 'pr' | 'bad'
}
