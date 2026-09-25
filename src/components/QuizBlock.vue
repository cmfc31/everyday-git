<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RichText from './RichText.vue'
import type { QuizQuestion } from '../content/types'
import { markQuizCorrect, progress } from '../progress'

const props = defineProps<{
  lessonId: string
  questions: QuizQuestion[]
  disabled: boolean
}>()

const { t } = useI18n()
const feedback = ref<{ index: number; ok: boolean } | null>(null)
const wrongPick = ref<{ q: number; c: number } | null>(null)
const answered = computed(() => new Set(progress.quizCorrect[props.lessonId] ?? []))

function choose(questionIndex: number, choiceIndex: number) {
  if (props.disabled || answered.value.has(questionIndex)) return
  const question = props.questions[questionIndex]
  if (!question) return
  const ok = choiceIndex === question.correct
  feedback.value = { index: questionIndex, ok }
  wrongPick.value = ok ? null : { q: questionIndex, c: choiceIndex }
  if (ok) markQuizCorrect(props.lessonId, questionIndex)
}
</script>

<template>
  <section class="stack" data-testid="quiz">
    <h2>{{ t('ui.quiz') }}</h2>
    <p v-if="disabled" class="note">{{ t('ui.quizLocked') }}</p>
    <article v-for="(question, qi) in questions" :key="question.prompt" class="question panel">
      <h3>{{ t('ui.questionOf', { current: qi + 1, total: questions.length }) }}</h3>
      <p><RichText :text="question.prompt" /></p>
      <div class="choice-list" style="display: grid">
        <button
          v-for="(choice, ci) in question.choices"
          :key="choice"
          type="button"
          class="choice"
          :class="{
            good: answered.has(qi) && ci === question.correct,
            bad: wrongPick?.q === qi && wrongPick?.c === ci,
          }"
          :disabled="disabled || answered.has(qi)"
          @click="choose(qi, ci)"
        >
          <RichText :text="choice" />
        </button>
      </div>
      <p
        v-if="feedback?.index === qi || answered.has(qi)"
        class="note"
        :class="answered.has(qi) ? 'good' : 'bad'"
        role="status"
      >
        <RichText :text="answered.has(qi) ? question.feedbackCorrect : question.feedbackWrong" />
      </p>
    </article>
  </section>
</template>
