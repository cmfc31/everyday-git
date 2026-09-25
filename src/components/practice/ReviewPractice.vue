<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReviewPractice } from '../../content/types'
import DragChip from '../viz/DragChip.vue'
import StepHint from '../viz/StepHint.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import { useDrag } from './drag'

const props = defineProps<{ practice: ReviewPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const { over, start, allow, read, leave } = useDrag()
const choice = ref(props.done ? props.practice.correct : '')
const location = ref(props.done ? props.practice.correctTarget : 'tray')
const message = ref(props.done ? props.practice.success : '')
const solved = ref(props.done)
const wrongPick = ref('')
const chose = computed(() => choice.value === props.practice.correct)
const chosenLabel = computed(() => props.practice.choices.find((item) => item.id === props.practice.correct)?.label)
const sameTarget = computed(() => props.practice.targets.find((zone) => zone.id === props.practice.correctTarget))
const otherTargets = computed(() => props.practice.targets.filter((zone) => zone.id !== props.practice.correctTarget))
// The comment arrives as "Ana: ...", so the author and the text are shown apart.
const commentAuthor = computed(() => props.practice.comment.split(':')[0] ?? '')
const commentText = computed(() => {
  const text = props.practice.comment.slice(commentAuthor.value.length + 1).trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
})

function pick(id: string) {
  if (solved.value) return
  if (id !== props.practice.correct) {
    wrongPick.value = id
    message.value = props.practice.wrong
    choice.value = ''
    return
  }
  wrongPick.value = ''
  choice.value = id
  message.value = ''
}

function move(target: string) {
  if (solved.value) return
  if (!chose.value) {
    message.value = props.practice.needChoice
    return
  }
  if (target !== props.practice.correctTarget) {
    message.value = props.practice.dropWrong
    return
  }
  location.value = target
  solved.value = true
  message.value = props.practice.success
  emit('complete')
}

function drop(target: string, event: DragEvent) {
  const id = read(event)
  if (id === 'commit') move(target)
}
</script>

<template>
  <div class="practice" data-testid="practice">
    <p>{{ practice.intro }}</p>

    <article class="gh-card">
      <header class="gh-head">
        <div class="gh-title">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="5.5" r="2.3" />
            <circle cx="6" cy="18.5" r="2.3" />
            <circle cx="18" cy="18.5" r="2.3" />
            <path d="M6 7.8v8.4M18 16.2V9a3 3 0 0 0-3-3h-4M13 3.5 10.5 6l2.5 2.5" />
          </svg>
          <strong>{{ t('viz.review.prTitle') }}</strong>
          <span class="state-badge open">{{ t('viz.review.open') }}</span>
        </div>
        <div class="compare">
          <span class="branch-pill pill-branch">weekend-special</span>
          {{ t('viz.pr.wantsMerge') }}
          <span class="branch-pill pill-main">main</span>
        </div>
      </header>

      <div class="gh-body">
        <ol class="timeline">
          <li class="timeline-commit">
            <span class="commit-mark"><span /></span>
            <span><strong>{{ t('viz.review.you') }}</strong> {{ t('viz.review.committed') }}: {{ t('viz.commit.dessert') }}</span>
          </li>
          <li class="timeline-commit">
            <span class="commit-mark"><span /></span>
            <span><strong>{{ t('viz.review.you') }}</strong> {{ t('viz.review.committed') }}: {{ t('viz.commit.price') }}</span>
          </li>
          <li>
            <span class="avatar">{{ commentAuthor.charAt(0) }}</span>
            <div class="comment">
              <div class="comment-head"><strong>{{ commentAuthor }}</strong> {{ t('viz.review.commented') }}</div>
              <p>{{ commentText }}</p>
            </div>
          </li>
          <li v-if="location === practice.correctTarget" class="timeline-commit fresh">
            <span class="commit-mark"><span /></span>
            <span><strong>{{ t('viz.review.you') }}</strong> {{ t('viz.review.committed') }}: {{ practice.card }}</span>
            <span class="state-badge open">{{ t('viz.review.new') }}</span>
          </li>
          <li v-else-if="sameTarget && chose">
            <span class="avatar you">{{ t('viz.review.you').charAt(0) }}</span>
            <button
              type="button"
              class="timeline-slot"
              :class="{ over: over === sameTarget.id }"
              :disabled="solved"
              @dragover="allow($event, sameTarget.id)"
              @dragleave="leave"
              @drop="drop(sameTarget.id, $event)"
              @click="move(sameTarget.id)"
            >
              {{ t('viz.review.slot') }} · {{ sameTarget.label }}
            </button>
          </li>
        </ol>
      </div>
    </article>

    <button
      v-for="zone in otherTargets"
      v-show="chose && !solved"
      :key="zone.id"
      type="button"
      class="side-target"
      :class="{ over: over === zone.id }"
      @dragover="allow($event, zone.id)"
      @dragleave="leave"
      @drop="drop(zone.id, $event)"
      @click="move(zone.id)"
    >
      <strong>+ {{ zone.label }}</strong>
      <span>{{ t('viz.dropHere') }}</span>
    </button>

    <PracticeStep :n="1" :title="practice.ask" :state="chose || solved ? 'done' : 'active'" :summary="chosenLabel">
      <StepHint :text="t('viz.hints.reviewChoice')" icon="tap" />
      <div class="choice-list" style="display: grid">
        <button
          v-for="item in practice.choices"
          :key="item.id"
          type="button"
          class="choice"
          :class="{ good: chose && item.id === practice.correct, bad: wrongPick === item.id }"
          :disabled="chose || solved"
          @click="pick(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
      <p v-if="message && !chose" class="note bad" role="status">{{ message }}</p>
    </PracticeStep>

    <PracticeStep :n="2" :title="t('viz.review.step2')" :state="solved ? 'done' : chose ? 'active' : 'locked'" final>
      <StepHint v-if="!solved" :text="t('viz.review.dragInstruction')" icon="up">
        <DragChip :label="practice.card" @dragstart="start($event, 'commit')" />
      </StepHint>
      <p v-if="message && chose" class="note" :class="solved ? 'good' : 'bad'" role="status">{{ message }}</p>
    </PracticeStep>
  </div>
</template>
