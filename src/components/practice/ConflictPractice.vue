<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ConflictPractice } from '../../content/types'
import PracticeStep from '../viz/PracticeStep.vue'
import StepHint from '../viz/StepHint.vue'

const props = defineProps<{ practice: ConflictPractice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
const { t } = useI18n()
const sentence = ref(props.done ? props.practice.options[0]?.id ?? '' : '')
const message = ref(props.done ? props.practice.success : '')
const solved = ref(props.done)
const wrongPick = ref('')

// The options arrive in a fixed order: your sentence, Ana's sentence, then both combined.
const ours = computed(() => props.practice.options[0])
const theirs = computed(() => props.practice.options[1])
const chosen = computed(() => props.practice.options.find((option) => option.id === sentence.value))
const optionTone = ['ours', 'theirs', 'both'] as const
const optionTag = computed(() => [t('viz.conflict.yours'), t('viz.conflict.theirs'), t('viz.conflict.both')])

function chooseSentence(id: string) {
  if (solved.value) return
  sentence.value = id
  message.value = props.practice.chosen
}

function pick(id: string) {
  if (solved.value) return
  if (!sentence.value) {
    message.value = props.practice.needSentence
    return
  }
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
</script>

<template>
  <div class="practice" data-testid="practice">
    <p>{{ practice.intro }}</p>

    <div class="editor">
      <div class="editor-bar">
        <span class="dots" aria-hidden="true"><span /><span /><span /></span>
        <span>menu.md</span>
        <span v-if="solved" class="state-badge open">{{ t('viz.conflict.merged') }}</span>
        <span v-else-if="chosen" class="state-badge open">{{ t('viz.conflict.resolved') }}</span>
        <span v-else class="state-badge bad">{{ t('viz.conflict.badge') }}</span>
      </div>
      <div class="editor-lines">
        <div class="editor-line"><span class="ln">1</span>{{ t('viz.conflict.heading') }}</div>
        <template v-if="chosen">
          <div :key="chosen.id" class="editor-line resolved">
            <span class="ln">2</span>{{ chosen.label }}
            <span class="tag">{{ t('viz.conflict.result') }}</span>
          </div>
        </template>
        <template v-else>
          <div class="editor-line marker"><span class="ln">2</span>&lt;&lt;&lt;&lt;&lt;&lt;&lt; {{ t('viz.conflict.yours') }}</div>
          <div class="editor-line ours">
            <span class="ln">3</span>{{ ours?.label }}
            <span class="tag">{{ t('viz.conflict.yours') }}</span>
          </div>
          <div class="editor-line marker"><span class="ln">4</span>=======</div>
          <div class="editor-line theirs">
            <span class="ln">5</span>{{ theirs?.label }}
            <span class="tag">{{ t('viz.conflict.theirs') }}</span>
          </div>
          <div class="editor-line marker"><span class="ln">6</span>&gt;&gt;&gt;&gt;&gt;&gt;&gt; Ana</div>
        </template>
      </div>
    </div>

    <PracticeStep :n="1" :title="practice.prompt" :state="sentence ? 'done' : 'active'" :summary="chosen?.label">
      <StepHint :text="t('viz.hints.conflictSentence')" icon="tap" />
      <div class="resolve-options">
        <button
          v-for="(option, index) in practice.options"
          :key="option.id"
          type="button"
          class="choice resolve-option"
          :class="[optionTone[index] ?? 'both', { good: sentence === option.id }]"
          :disabled="solved"
          @click="chooseSentence(option.id)"
        >
          <span class="tag">{{ optionTag[index] }}</span>
          {{ option.label }}
        </button>
      </div>
    </PracticeStep>

    <PracticeStep :n="2" :title="practice.thenAsk" :state="solved ? 'done' : sentence ? 'active' : 'locked'" final>
      <StepHint v-if="!solved" :text="t('viz.hints.agentChoice')" icon="tap" />
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
      <p v-if="message" class="note" :class="solved || message === practice.chosen ? 'good' : 'bad'" role="status">
        {{ message }}
      </p>
    </PracticeStep>
  </div>
</template>
