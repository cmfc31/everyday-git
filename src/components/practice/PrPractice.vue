<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PrPractice } from '../../content/types'
import DragChip from '../viz/DragChip.vue'
import StepHint from '../viz/StepHint.vue'
import GitGraph from '../viz/GitGraph.vue'
import PlaceFrame from '../viz/PlaceFrame.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import type { GraphLane, GraphLink } from '../viz/graph'
import { useDrag } from './drag'

const props = defineProps<{ practice: PrPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const { over, start, allow, read, leave } = useDrag()
const summary = ref('')
const reviewer = ref(props.done ? props.practice.correctReviewer : '')
const target = ref(props.done ? props.practice.correctTarget : '')
const error = ref('')
const solved = ref(props.done)

// Steps open one at a time: summary, then reviewer, then where the branch goes.
const step = ref(props.done ? 3 : 1)
const reviewerLabel = computed(() => props.practice.reviewers.find((person) => person.id === reviewer.value)?.label)

const overwriting = computed(() => target.value !== '' && target.value !== props.practice.correctTarget)

const lanes = computed<GraphLane[]>(() => [
  {
    id: 'main',
    label: 'main',
    tone: 'main',
    commits: [
      { id: 'a', x: 10 },
      { id: 'b', x: 28 },
      ...(overwriting.value ? [{ id: 'bad', x: 86, label: t('viz.commit.noReview'), tone: 'bad' as const }] : []),
      ...(target.value && !overwriting.value ? [{ id: 'pr', x: 86, label: t('viz.pr.link'), tone: 'ghost' as const }] : []),
    ],
  },
  {
    id: 'branch',
    label: props.practice.card,
    tone: 'branch',
    from: { lane: 'main', x: 28 },
    start: 40,
    commits: [
      { id: 'dessert', x: 50, label: t('viz.commit.dessert') },
      { id: 'price', x: 68, label: t('viz.commit.price') },
    ],
  },
])

const links = computed<GraphLink[]>(() => {
  if (!target.value) return []
  return [{ from: { lane: 'branch', x: 68 }, to: { lane: 'main', x: 86 }, tone: overwriting.value ? 'bad' : 'pr' }]
})

function initial(id: string, label: string) {
  return id === 'none' ? '–' : label.charAt(0)
}

function place(id: string | null) {
  if (!id || solved.value) return
  target.value = id
  error.value = id === props.practice.correctTarget ? '' : props.practice.errors.target
}

function drop(id: string, event: DragEvent) {
  const card = read(event)
  if (card === 'branch') place(id)
}

function summaryError() {
  const practice = props.practice
  const text = summary.value.trim()
  if (text.length < practice.minLength) return practice.errors.summaryShort
  if (!includesAny(text, practice.requireAny)) return practice.errors.summaryWhat
  if (!includesAny(text, practice.requireWhy)) return practice.errors.summaryWhy
  return ''
}

function confirmSummary() {
  error.value = summaryError()
  if (!error.value) step.value = 2
}

function chooseReviewer(id: string) {
  if (solved.value) return
  reviewer.value = id
  if (id !== props.practice.correctReviewer) {
    error.value = props.practice.errors.reviewer
    return
  }
  error.value = ''
  step.value = 3
}

function includesAny(text: string, needles: string[]) {
  const padded = ` ${text.toLowerCase()} `
  return needles.some((needle) => padded.includes(needle.toLowerCase()))
}

function check() {
  if (solved.value) return
  const practice = props.practice
  const summaryProblem = summaryError()
  if (summaryProblem) {
    error.value = summaryProblem
    return
  }
  if (reviewer.value !== practice.correctReviewer) {
    error.value = practice.errors.reviewer
    return
  }
  if (target.value !== practice.correctTarget) {
    error.value = practice.errors.target
    return
  }
  solved.value = true
  error.value = ''
  emit('complete')
}
</script>

<template>
  <div class="practice" data-testid="practice">
    <p>{{ practice.intro }}</p>

    <PlaceFrame kind="remote" :title="t('viz.remote')" :subtitle="t('viz.remoteSub')">
      <GitGraph :lanes="lanes" :links="links" />
    </PlaceFrame>

    <article class="gh-card">
      <header class="gh-head">
        <div class="gh-title">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="5.5" r="2.3" />
            <circle cx="6" cy="18.5" r="2.3" />
            <circle cx="18" cy="18.5" r="2.3" />
            <path d="M6 7.8v8.4M18 16.2V9a3 3 0 0 0-3-3h-4M13 3.5 10.5 6l2.5 2.5" />
          </svg>
          <strong>{{ solved ? summary.trim() || t('viz.review.prTitle') : t('viz.pr.title') }}</strong>
          <span class="state-badge" :class="{ open: solved }">{{ solved ? t('viz.pr.open') : t('viz.pr.draft') }}</span>
        </div>
        <div class="compare">
          <span class="branch-pill pill-branch">{{ practice.card }}</span>
          {{ t('viz.pr.wantsMerge') }}
          <span class="branch-pill pill-main">main</span>
        </div>
      </header>

      <div class="gh-body">
        <PracticeStep :n="1" :title="practice.summaryLabel" :state="step > 1 ? 'done' : 'active'" :summary="summary.trim()">
          <StepHint :text="t('viz.hints.prSummary')" icon="type" />
          <textarea
            v-model="summary"
            :aria-label="practice.summaryLabel"
            :placeholder="practice.summaryPlaceholder"
            :disabled="solved"
          />
          <div class="chip-row">
            <button type="button" class="button primary" @click="confirmSummary">{{ t('viz.next') }}</button>
          </div>
        </PracticeStep>

        <PracticeStep
          :n="2"
          :title="practice.reviewerLabel"
          :state="step > 2 ? 'done' : step === 2 ? 'active' : 'locked'"
          :summary="reviewerLabel"
        >
          <StepHint :text="t('viz.hints.prReviewer')" icon="tap" />
          <div class="avatars" role="group" :aria-label="practice.reviewerLabel">
            <button
              v-for="person in practice.reviewers"
              :key="person.id"
              type="button"
              class="avatar-choice"
              :aria-pressed="reviewer === person.id"
              :disabled="solved"
              @click="chooseReviewer(person.id)"
            >
              <span class="avatar" :class="{ 'muted-avatar': person.id === 'none', you: person.id === 'me' }">
                {{ initial(person.id, person.label) }}
              </span>
              {{ person.label }}
            </button>
          </div>
        </PracticeStep>

        <PracticeStep :n="3" :title="t('viz.pr.step3')" :state="solved ? 'done' : step === 3 ? 'active' : 'locked'" final>
          <StepHint v-if="!solved" :text="t('viz.pr.dragInstruction')" icon="down">
            <DragChip icon="branch" :label="practice.card" @dragstart="start($event, 'branch')" />
          </StepHint>
          <div class="targets">
            <button
              v-for="zone in practice.targets"
              :key="zone.id"
              type="button"
              class="target"
              :class="{ over: over === zone.id, chosen: target === zone.id, danger: zone.id !== practice.correctTarget }"
              :disabled="solved"
              @dragover="allow($event, zone.id)"
              @dragleave="leave"
              @drop="drop(zone.id, $event)"
              @click="place(zone.id)"
            >
              <span class="target-head">
                <svg v-if="zone.id === practice.correctTarget" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v10a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V17h-.5A1.5 1.5 0 0 1 4 15.5v-10Z" />
                  <path d="M8.5 9h7M8.5 12.5h4.5" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4 2.8 19.5h18.4L12 4Z" />
                  <path d="M12 10v4.2M12 17h.01" />
                </svg>
                {{ zone.label }}
              </span>
              <DragChip v-if="target === zone.id" icon="branch" :label="practice.card" inert />
              <span v-else class="hint">{{ t('viz.dropHere') }}</span>
            </button>
          </div>
          <div v-if="!solved" class="chip-row">
            <button type="button" class="button primary" :disabled="!target" @click="check">{{ practice.checkLabel }}</button>
          </div>
        </PracticeStep>

        <p v-if="error" class="note bad" role="status">{{ error }}</p>
        <p v-if="solved" class="note good" role="status">{{ practice.success }}</p>
      </div>
    </article>
  </div>
</template>
