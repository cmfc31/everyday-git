<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChoicePractice } from '../../content/types'
import RichText from '../RichText.vue'
import GitGraph from '../viz/GitGraph.vue'
import PlaceFrame from '../viz/PlaceFrame.vue'
import PracticeStep from '../viz/PracticeStep.vue'
import StepHint from '../viz/StepHint.vue'
import TransferLink from '../viz/TransferLink.vue'
import type { GraphCommit, GraphLane, GraphLink } from '../viz/graph'

const props = defineProps<{ practice: ChoicePractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const message = ref(props.done ? props.practice.success : '')
const solved = ref(props.done)
const wrongPick = ref('')

const labels = computed(() => props.practice.pictureLabels)

function pick(id: string) {
  if (solved.value) return
  if (id !== props.practice.correct) {
    wrongPick.value = id
    message.value = props.practice.wrong
    return
  }
  wrongPick.value = ''
  solved.value = true
  message.value = props.practice.success
  emit('complete')
}

const mainBase: GraphCommit[] = [
  { id: 'a', x: 10 },
  { id: 'b', x: 28 },
]

// Push: the branch lives only on your computer until it is sent to GitHub.
const localLanes = computed<GraphLane[]>(() => [
  { id: 'main', label: 'main', tone: 'main', commits: mainBase },
  {
    id: 'branch',
    label: 'weekend-special',
    tone: 'branch',
    from: { lane: 'main', x: 28 },
    start: 40,
    commits: [
      { id: 'dessert', x: 52, label: t('viz.commit.dessert') },
      { id: 'price', x: 74, label: t('viz.commit.price') },
    ],
  },
])

const remoteLanes = computed<GraphLane[]>(() => {
  const main: GraphLane = {
    id: 'main',
    label: 'main',
    tone: 'main',
    commits:
      wrongPick.value === 'main'
        ? [...mainBase, { id: 'bad', x: 62, label: t('viz.commit.noReview'), tone: 'bad' }]
        : mainBase,
  }
  if (!solved.value) return [main]
  return [
    main,
    {
      id: 'branch',
      label: 'weekend-special',
      tone: 'branch',
      from: { lane: 'main', x: 28 },
      start: 40,
      commits: [
        { id: 'dessert', x: 52, label: t('viz.commit.dessert'), tone: 'new' },
        { id: 'price', x: 74, label: t('viz.commit.price'), tone: 'new' },
      ],
    },
  ]
})

// Behind: main moved ahead with Ana's tax line while you worked on the branch.
const behindLanes = computed<GraphLane[]>(() => [
  {
    id: 'main',
    label: 'main',
    tone: 'main',
    commits: [...mainBase, { id: 'tax', x: 56, label: t('viz.commit.tax'), tone: solved.value ? undefined : 'new' }],
  },
  {
    id: 'branch',
    label: 'weekend-special',
    tone: 'branch',
    from: { lane: 'main', x: 28 },
    start: 38,
    badge: solved.value ? undefined : t('viz.choice.behind'),
    commits: [
      { id: 'dessert', x: 46, label: t('viz.commit.dessert') },
      ...(solved.value ? [{ id: 'merge', x: 76, label: t('viz.commit.merge'), tone: 'merge' as const }] : []),
    ],
  },
])

const behindLinks = computed<GraphLink[]>(() =>
  solved.value ? [{ from: { lane: 'main', x: 56 }, to: { lane: 'branch', x: 76 }, tone: 'merge' }] : [],
)
</script>

<template>
  <div class="practice" data-testid="practice">
    <p>{{ practice.intro }}</p>

    <div v-if="practice.picture === 'local'" class="places">
      <PlaceFrame kind="remote" :title="t('viz.remote')" :subtitle="labels.rightTitle">
        <GitGraph :lanes="remoteLanes" />
        <p v-if="!solved" class="hint">{{ labels.rightBody }}</p>
      </PlaceFrame>
      <TransferLink direction="up" :active="solved" label="git push" />
      <PlaceFrame kind="local" :title="labels.leftTitle" :subtitle="solved ? t('viz.localSub') : labels.leftBody">
        <GitGraph :lanes="localLanes" />
      </PlaceFrame>
    </div>

    <PlaceFrame v-else kind="local" :title="t('viz.local')" :subtitle="t('viz.localSub')">
      <GitGraph :lanes="behindLanes" :links="behindLinks" />
      <ul v-if="!solved" class="graph-legend">
        <li><span class="swatch swatch-main" />{{ labels.leftTitle }}: {{ labels.leftBody }}</li>
        <li><span class="swatch swatch-branch" />{{ labels.rightTitle }}: {{ labels.rightBody }}</li>
      </ul>
    </PlaceFrame>

    <PracticeStep :n="1" :title="practice.ask" :state="solved ? 'done' : 'active'" final>
      <StepHint v-if="!solved" :text="t('viz.hints.choiceGraph')" icon="tap" />
      <div class="choice-list" style="display: grid">
        <button
          v-for="choice in practice.choices"
          :key="choice.id"
          type="button"
          class="choice"
          :class="{ good: solved && choice.id === practice.correct, bad: wrongPick === choice.id }"
          :disabled="solved"
          @click="pick(choice.id)"
        >
          {{ choice.label }}
        </button>
      </div>
      <p v-if="message" class="note" :class="solved ? 'good' : 'bad'" role="status"><RichText :text="message" /></p>
    </PracticeStep>
  </div>
</template>
