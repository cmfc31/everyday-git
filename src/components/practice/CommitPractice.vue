<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommitPractice } from '../../content/types'
import DragChip from '../viz/DragChip.vue'
import StepHint from '../viz/StepHint.vue'
import GitGraph from '../viz/GitGraph.vue'
import PlaceFrame from '../viz/PlaceFrame.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import type { GraphLane } from '../viz/graph'
import { useDrag } from './drag'

const props = defineProps<{ practice: CommitPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const { over, start, allow, read, leave } = useDrag()
const placed = ref<string[]>(props.done ? ['price'] : [])
const messageText = ref(props.done ? props.practice.messagePlaceholder : '')
const error = ref('')
const solved = ref(props.done)

const filesReady = computed(() => placed.value.length === 1 && placed.value[0] === 'price')

const lanes = computed<GraphLane[]>(() => [
  {
    id: 'branch',
    label: 'weekend-special',
    tone: 'branch',
    commits: [
      { id: 'dessert', x: 18, label: t('viz.commit.dessert') },
      solved.value
        ? { id: 'price', x: 52, label: shortMessage(messageText.value), tone: 'new' }
        : { id: 'price', x: 52, label: t('viz.commit_.pending'), tone: 'ghost' },
    ],
  },
])

function shortMessage(text: string) {
  const clean = text.trim()
  return clean.length > 28 ? `${clean.slice(0, 27)}…` : clean
}

function includesFile(id: string) {
  return placed.value.includes(id)
}

function add(id: string | null) {
  if (!id || solved.value || includesFile(id)) return
  placed.value = [...placed.value, id]
  error.value = ''
}

function remove(id: string) {
  if (solved.value) return
  placed.value = placed.value.filter((item) => item !== id)
}

function drop(event: DragEvent) {
  add(read(event))
}

function dropBack(event: DragEvent) {
  const id = read(event)
  if (id) remove(id)
}

function check() {
  if (solved.value) return
  const practice = props.practice
  if (!includesFile('price')) {
    error.value = practice.errors.needPrice
    return
  }
  if (includesFile('draft')) {
    error.value = practice.errors.hasDraft
    return
  }
  const text = messageText.value.trim()
  const lower = text.toLowerCase()
  if (practice.rejectExact.some((word) => word.toLowerCase() === lower)) {
    error.value = practice.errors.vague
    return
  }
  if (text.length < practice.minLength) {
    error.value = practice.errors.short
    return
  }
  if (!practice.mustIncludeAny.some((word) => lower.includes(word.toLowerCase()))) {
    error.value = practice.errors.missing
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

    <PlaceFrame kind="local" :title="t('viz.local')" :subtitle="t('viz.localSub')">
      <div class="commit-board">
        <section
          class="zone"
          :class="{ over: over === 'tray' }"
          @dragover="!solved && allow($event, 'tray')"
          @dragleave="leave"
          @drop="dropBack"
        >
          <h4>{{ practice.tray }}</h4>
          <template v-for="file in practice.files" :key="file.id">
            <div v-if="!includesFile(file.id)" class="file-item">
              <DragChip
                icon="file"
                :label="file.label"
                :inert="solved"
                @dragstart="start($event, file.id)"
                @activate="add(file.id)"
              >
                <span v-if="file.id === 'price'" class="diff"><del>12</del> → <ins>14</ins></span>
                <span v-else>{{ file.detail }}</span>
              </DragChip>
            </div>
          </template>
        </section>
        <section
          class="zone snapshot"
          :class="{ over: over === 'commit', sealed: solved }"
          @dragover="!solved && allow($event, 'commit')"
          @dragleave="leave"
          @drop="drop"
        >
          <h4>📸 {{ practice.commitLabel }}</h4>
          <div v-for="file in practice.files.filter((item) => includesFile(item.id))" :key="file.id" class="file-item">
            <DragChip
              icon="file"
              :label="file.label"
              :inert="solved"
              @dragstart="start($event, file.id)"
              @activate="remove(file.id)"
            >
              <span v-if="file.id === 'price'" class="diff"><del>12</del> → <ins>14</ins></span>
              <span v-else>{{ file.detail }}</span>
            </DragChip>
          </div>
          <p v-if="!placed.length" class="drop-zone">{{ t('viz.dropHere') }}</p>
        </section>
      </div>
    </PlaceFrame>

    <PracticeStep
      :n="1"
      :title="t('viz.commit_.step1')"
      :state="solved || filesReady ? 'done' : 'active'"
      :summary="practice.files[0]?.label"
    >
      <StepHint :text="t('viz.commit_.dragInstruction')" icon="up" />
    </PracticeStep>

    <PracticeStep :n="2" :title="practice.messageLabel" :state="solved ? 'done' : filesReady ? 'active' : 'locked'" final>
      <StepHint v-if="!solved" :text="t('viz.hints.commitMessage')" icon="type" />
      <label class="commit-input">
        <code>git commit -m</code>
        <input
          v-model="messageText"
          :aria-label="practice.messageLabel"
          :placeholder="practice.messagePlaceholder"
          :disabled="solved"
          @keydown.enter="check"
        />
      </label>
      <div class="chip-row">
        <button type="button" class="button primary" :disabled="solved" @click="check">{{ practice.checkLabel }}</button>
      </div>
      <p v-if="error" class="note bad" role="status">{{ error }}</p>
    </PracticeStep>

    <PlaceFrame kind="local" :title="t('viz.commit_.history')">
      <GitGraph :lanes="lanes" />
    </PlaceFrame>

    <p v-if="solved" class="note good" role="status">{{ practice.success }}</p>
  </div>
</template>
