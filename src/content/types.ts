export const LESSON_IDS = [
  'branch',
  'shared',
  'commit',
  'push',
  'pull-request',
  'review',
  'behind',
  'conflict',
] as const

export type LessonId = (typeof LESSON_IDS)[number]

export function isLessonId(value: string): value is LessonId {
  return (LESSON_IDS as readonly string[]).includes(value)
}

export interface CommandLine {
  command: string
  gloss: string
}

export interface QuizQuestion {
  prompt: string
  choices: string[]
  correct: number
  feedbackCorrect: string
  feedbackWrong: string
}

export interface LabeledChoice {
  id: string
  label: string
}

export interface Intuition {
  paragraphs: string[]
  scene: string
  sceneLabels: Record<string, string>
}

interface PracticeBase {
  intro: string
  success: string
}

export interface PullPractice extends PracticeBase {
  kind: 'pull'
  card: string
  from: string
  to: string
  yourBefore: string
  teamNow: string
  dropHint: string
  ask: string
  choices: LabeledChoice[]
  correct: string
  wrong: string
}

export interface CommitFile {
  id: string
  label: string
  detail: string
}

export interface CommitPractice extends PracticeBase {
  kind: 'commit'
  files: CommitFile[]
  tray: string
  commitLabel: string
  messageLabel: string
  messagePlaceholder: string
  checkLabel: string
  rejectExact: string[]
  mustIncludeAny: string[]
  minLength: number
  errors: {
    needPrice: string
    hasDraft: string
    short: string
    vague: string
    missing: string
  }
}

export interface BranchPractice extends PracticeBase {
  kind: 'branch'
  ask: string
  choices: LabeledChoice[]
  correct: string
  wrong: string
  started: string
  card: string
  holding: string
  mainLane: string
  branchLane: string
  mainNote: string
  branchNote: string
  dropWrong: string
  needBranch: string
}

export interface ChoicePractice extends PracticeBase {
  kind: 'choice'
  ask: string
  choices: LabeledChoice[]
  correct: string
  wrong: string
  picture: string
  pictureLabels: Record<string, string>
}

export interface PrPractice extends PracticeBase {
  kind: 'pr'
  summaryLabel: string
  summaryPlaceholder: string
  minLength: number
  requireAny: string[]
  requireWhy: string[]
  reviewerLabel: string
  reviewers: LabeledChoice[]
  correctReviewer: string
  card: string
  targets: LabeledChoice[]
  correctTarget: string
  checkLabel: string
  errors: {
    summaryShort: string
    summaryWhat: string
    summaryWhy: string
    reviewer: string
    target: string
  }
}

export interface ReviewPractice extends PracticeBase {
  kind: 'review'
  comment: string
  ask: string
  choices: LabeledChoice[]
  correct: string
  wrong: string
  card: string
  targets: LabeledChoice[]
  correctTarget: string
  dropWrong: string
  needChoice: string
}

export interface ConflictPractice extends PracticeBase {
  kind: 'conflict'
  prompt: string
  options: LabeledChoice[]
  chosen: string
  thenAsk: string
  choices: LabeledChoice[]
  correct: string
  wrong: string
  needSentence: string
}

export type Practice =
  | PullPractice
  | CommitPractice
  | BranchPractice
  | ChoicePractice
  | PrPractice
  | ReviewPractice
  | ConflictPractice

export interface Lesson {
  title: string
  summary: string
  deepBackground: string[]
  narrowBackground: string[]
  intuition: Intuition
  practice: Practice
  commands: CommandLine[]
  quiz: QuizQuestion[]
}

export interface Catalog {
  ui: Record<string, string>
  landing: Record<string, string>
  learn: Record<string, string>
  lessons: Record<LessonId, Lesson>
}
