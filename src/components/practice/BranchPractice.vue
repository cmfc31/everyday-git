<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BranchPractice } from '../../content/types'
import RichText from '../RichText.vue'
import DragChip from '../viz/DragChip.vue'
import StepHint from '../viz/StepHint.vue'
import GitGraph from '../viz/GitGraph.vue'
import PlaceFrame from '../viz/PlaceFrame.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import type { GraphLane } from '../viz/graph'
import { useDrag } from './drag'

const props = defineProps<{ practice: BranchPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const { over, start, allow, read, leave } = useDrag()
const started = ref(props.done)
const location = ref(props.done ? 'branch' : 'tray')
const message = ref(props.done ? props.practice.success : '')
const solved = ref(props.done)
// Shows what would go wrong on main, so a wrong answer is visible in the graph too.
const mainPreview = ref(false)
const chosenLabel = computed(() => props.practice.choices.find((choice) => choice.id === props.practice.correct)?.label)

const lanes = computed<GraphLane[]>(() => {
  const main: GraphLane = {
    id: 'main',
    label: props.practice.mainLane,
    tone: 'main',
    droppable: started.value && !solved.value,
    commits: [
      { id: 'a', x: 12 },
      { id: 'b', x: 34, label: t('viz.commit.published') },
      ...(mainPreview.value ? [{ id: 'bad', x: 64, label: t('viz.commit.unfinished'), tone: 'bad' as const }] : []),
    ],
  }
  if (!started.value) return [main]
  return [
    main,
    {
      id: 'branch',
      label: props.practice.branchLane,
      tone: 'branch',
      from: { lane: 'main', x: 34 },
      start: 48,
      droppable: !solved.value,
      commits:
        location.value === 'branch' ? [{ id: 'dessert', x: 64, label: props.practice.card, tone: 'new' }] : [],
    },
  ]
})

function pick(id: string) {
  if (solved.value || started.value) return
  mainPreview.value = id === 'main'
  if (id !== props.practice.correct) {
    message.value = props.practice.wrong
    return
  }
  started.value = true
  message.value = props.practice.started
}

function move(target: string) {
  if (!started.value || solved.value) {
    message.value = props.practice.needBranch
    return
  }
  if (target !== 'branch') {
    location.value = 'tray'
    mainPreview.value = true
    message.value = props.practice.dropWrong
    return
  }
  mainPreview.value = false
  location.value = 'branch'
  solved.value = true
  message.value = props.practice.success
  emit('complete')
}

function drop(target: string, event: DragEvent) {
  const id = read(event)
  if (id === 'dessert') move(target)
}
</script>

<template>
  <div class="practice" data-testid="practice">
    <p><RichText :text="practice.intro" /></p>

    <PlaceFrame kind="local" :title="t('viz.local')" :subtitle="t('viz.localSub')">
      <GitGraph
        :lanes="lanes"
        :over="over"
        :drop-hint="t('viz.dropHere')"
        @activate="move"
        @lane-dragover="(lane, event) => allow(event, lane)"
        @lane-dragleave="leave"
        @lane-drop="drop"
      />
      <ul class="graph-legend">
        <li><span class="swatch swatch-main" />{{ practice.mainLane }}: {{ practice.mainNote }}</li>
        <li v-if="started"><span class="swatch swatch-branch" />{{ practice.branchLane }}: {{ practice.branchNote }}</li>
      </ul>
    </PlaceFrame>

    <PracticeStep :n="1" :title="practice.ask" :state="started ? 'done' : 'active'" :summary="chosenLabel">
      <StepHint :text="t('viz.hints.branchChoice')" icon="tap" />
      <div class="choice-list" style="display: grid">
        <button
          v-for="choice in practice.choices"
          :key="choice.id"
          type="button"
          class="choice"
          :class="{ good: started && choice.id === practice.correct }"
          :disabled="started"
          @click="pick(choice.id)"
        >
          {{ choice.label }}
        </button>
      </div>
      <p v-if="message && !started" class="note bad" role="status"><RichText :text="message" /></p>
    </PracticeStep>

    <PracticeStep :n="2" :title="t('viz.branch.step2')" :state="solved ? 'done' : started ? 'active' : 'locked'" final>
      <StepHint v-if="location === 'tray'" :text="t('viz.branch.dragInstruction')" icon="up">
        <DragChip :label="practice.card" :detail="practice.holding" @dragstart="start($event, 'dessert')" />
      </StepHint>
      <p v-if="message && started" class="note" :class="solved || message === practice.started ? 'good' : 'bad'" role="status">
        <RichText :text="message" />
      </p>
    </PracticeStep>

  </div>
</template>
