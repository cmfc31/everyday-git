<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RichText from '../RichText.vue'
import DragChip from '../viz/DragChip.vue'
import StepHint from '../viz/StepHint.vue'
import GitGraph from '../viz/GitGraph.vue'
import PlaceFrame from '../viz/PlaceFrame.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import TransferLink from '../viz/TransferLink.vue'
import type { GraphLane } from '../viz/graph'
import type { PullPractice } from '../../content/types'
import { useDrag } from './drag'

const props = defineProps<{ practice: PullPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const { over, start, allow, read, leave } = useDrag()
const location = ref(props.done ? 'to' : 'from')
const message = ref(props.done ? props.practice.success : '')
const solved = ref(props.done)
const pulled = computed(() => location.value === 'to')

watch(
  () => props.done,
  (done) => {
    if (done) {
      location.value = 'to'
      solved.value = true
      message.value = props.practice.success
    }
  },
)

const teamLanes = computed<GraphLane[]>(() => [
  {
    id: 'main',
    label: 'main',
    tone: 'main',
    commits: [
      { id: 'a', x: 14 },
      { id: 'b', x: 38, label: t('viz.commit.published') },
      { id: 'ana', x: 66, label: t('viz.commit.anaTitle'), tone: 'new' },
    ],
  },
])

const yourLanes = computed<GraphLane[]>(() => [
  {
    id: 'main',
    label: 'main',
    tone: 'main',
    commits: [
      { id: 'a', x: 14 },
      { id: 'b', x: 38, label: t('viz.commit.published') },
      pulled.value
        ? { id: 'ana', x: 66, label: t('viz.commit.anaTitle'), tone: 'new' }
        : { id: 'ana', x: 66, label: t('viz.notHere'), tone: 'ghost' },
    ],
  },
])

function drop(target: string, event: DragEvent) {
  const id = read(event)
  if (id === 'update') location.value = target
}

function pick(id: string) {
  if (solved.value || !pulled.value) return
  if (id !== props.practice.correct) {
    message.value = props.practice.wrong
    return
  }
  solved.value = true
  message.value = props.practice.success
  emit('complete')
}
</script>

<template>
  <div class="practice" data-testid="practice">
    <p><RichText :text="practice.intro" /></p>

    <div class="places">
      <PlaceFrame kind="remote" :title="t('viz.remote')" :subtitle="practice.from">
        <div class="file-line">
          <span class="hint">{{ t('viz.pull.file') }}</span>
          <strong>{{ practice.teamNow }}</strong>
        </div>
        <GitGraph :lanes="teamLanes" />
        <div v-if="!pulled" class="chip-row">
          <DragChip :label="practice.card" @dragstart="start($event, 'update')" @activate="location = 'to'" />
        </div>
      </PlaceFrame>

      <TransferLink direction="down" :active="pulled" label="git pull" />

      <PlaceFrame
        kind="local"
        :title="t('viz.local')"
        :subtitle="practice.to"
        :droppable="!pulled"
        :over="over === 'to'"
        @dragover="allow($event, 'to')"
        @dragleave="leave"
        @drop="drop('to', $event)"
      >
        <div class="file-line" :class="{ flash: pulled }">
          <span class="hint">{{ t('viz.pull.file') }}</span>
          <strong>{{ pulled ? practice.teamNow : practice.yourBefore }}</strong>
        </div>
        <GitGraph :lanes="yourLanes" />
        <p v-if="!pulled" class="drop-zone">{{ practice.dropHint }}</p>
      </PlaceFrame>
    </div>

    <PracticeStep :n="1" :title="t('viz.pull.step1')" :state="pulled ? 'done' : 'active'" :summary="practice.teamNow">
      <StepHint :text="t('viz.pull.dragInstruction', { card: practice.card })" icon="up" />
    </PracticeStep>

    <PracticeStep :n="2" :title="practice.ask" :state="solved ? 'done' : pulled ? 'active' : 'locked'" final>
      <StepHint v-if="!solved" :text="t('viz.hints.agentChoice')" icon="tap" />
      <div class="choice-list" style="display: grid">
        <button
          v-for="choice in practice.choices"
          :key="choice.id"
          type="button"
          class="choice"
          :class="{ good: solved && choice.id === practice.correct }"
          :disabled="!pulled || solved"
          @click="pick(choice.id)"
        >
          <RichText :text="choice.label" />
        </button>
      </div>
      <p v-if="message" class="note" :class="solved ? 'good' : 'bad'" role="status"><RichText :text="message" /></p>
    </PracticeStep>
  </div>
</template>
