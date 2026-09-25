import { reactive, watch } from 'vue'

export type LocaleId = 'en' | 'es-419'
export type ThemeChoice = 'light' | 'dark' | null

export interface ProgressState {
  completed: string[]
  skippedBackground: Record<string, boolean>
  lastLesson: string | null
  language: LocaleId
  theme: ThemeChoice
  practiceDone: string[]
  quizCorrect: Record<string, number[]>
}

const KEY = 'everyday-git-progress'

function initialLanguage(): LocaleId {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('es')) {
    return 'es-419'
  }
  return 'en'
}

function blank(): ProgressState {
  return {
    completed: [],
    skippedBackground: {},
    lastLesson: null,
    language: initialLanguage(),
    theme: null,
    practiceDone: [],
    quizCorrect: {},
  }
}

function load(): ProgressState {
  const base = blank()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      ...base,
      ...parsed,
      completed: parsed.completed ?? [],
      skippedBackground: parsed.skippedBackground ?? {},
      practiceDone: parsed.practiceDone ?? [],
      quizCorrect: parsed.quizCorrect ?? {},
      language: parsed.language === 'es-419' || parsed.language === 'en' ? parsed.language : base.language,
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : null,
      lastLesson: parsed.lastLesson ?? null,
    }
  } catch {
    return base
  }
}

export const progress = reactive(load())

watch(
  progress,
  (value) => {
    localStorage.setItem(KEY, JSON.stringify(value))
  },
  { deep: true },
)

export function resolvedTheme(choice: ThemeChoice = progress.theme): 'light' | 'dark' {
  if (choice === 'light' || choice === 'dark') return choice
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme() {
  document.documentElement.dataset.theme = resolvedTheme()
}

export function toggleTheme() {
  progress.theme = resolvedTheme() === 'dark' ? 'light' : 'dark'
  applyTheme()
}

export function setLanguage(locale: LocaleId) {
  progress.language = locale
}

export function setLastLesson(id: string) {
  progress.lastLesson = id
}

export function setBackgroundSkipped(id: string, skipped: boolean) {
  progress.skippedBackground[id] = skipped
}

export function markPractice(id: string) {
  if (!progress.practiceDone.includes(id)) progress.practiceDone.push(id)
}

export function markQuizCorrect(id: string, index: number) {
  const list = progress.quizCorrect[id] ?? []
  if (!list.includes(index)) progress.quizCorrect[id] = [...list, index]
}

export function tryComplete(id: string, quizLength: number) {
  const quiz = progress.quizCorrect[id] ?? []
  if (progress.practiceDone.includes(id) && quiz.length >= quizLength && !progress.completed.includes(id)) {
    progress.completed.push(id)
  }
}

export function resetLesson(id: string) {
  progress.completed = progress.completed.filter((item) => item !== id)
  progress.practiceDone = progress.practiceDone.filter((item) => item !== id)
  delete progress.quizCorrect[id]
}

export function listenForSystemTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', () => {
    if (progress.theme === null) applyTheme()
  })
}
