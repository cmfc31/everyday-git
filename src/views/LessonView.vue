<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CommandDrawer from '../components/CommandDrawer.vue'
import RichText from '../components/RichText.vue'
import QuizBlock from '../components/QuizBlock.vue'
import SceneBoard from '../components/SceneBoard.vue'
import PracticeHost from '../components/practice/PracticeHost.vue'
import { LESSON_IDS, isLessonId } from '../content/types'
import { catalogs } from '../i18n/catalog'
import { markPractice, progress, resetLesson, setBackgroundSkipped, setLastLesson, tryComplete } from '../progress'

const route = useRoute()
const { t, locale } = useI18n()
const id = computed(() => String(route.params.id ?? ''))
const lesson = computed(() => {
  if (!isLessonId(id.value)) return null
  const catalog = locale.value === 'es-419' ? catalogs['es-419'] : catalogs.en
  return catalog.lessons[id.value]
})
const index = computed(() => (isLessonId(id.value) ? LESSON_IDS.indexOf(id.value) : -1))
const prevId = computed(() => (index.value > 0 ? LESSON_IDS[index.value - 1] : null))
const nextId = computed(() =>
  index.value >= 0 && index.value < LESSON_IDS.length - 1 ? LESSON_IDS[index.value + 1] : null,
)
const skipped = computed(() => Boolean(progress.skippedBackground[id.value]))
const practiceDone = computed(() => progress.practiceDone.includes(id.value))
const quizCount = computed(() => (progress.quizCorrect[id.value] ?? []).length)
const complete = computed(() => progress.completed.includes(id.value))
const hasProgress = computed(() => practiceDone.value || quizCount.value > 0)
// Bumped on reset so the practice and quiz remount with fresh local state.
const resetKey = ref(0)
const confirmingReset = ref(false)
const justReset = ref(false)
const practiceSection = ref<HTMLElement | null>(null)

watch(
  id,
  (value) => {
    if (isLessonId(value)) setLastLesson(value)
    confirmingReset.value = false
    justReset.value = false
  },
  { immediate: true },
)

watch([practiceDone, quizCount], () => {
  if (isLessonId(id.value) && lesson.value) tryComplete(id.value, lesson.value.quiz.length)
})

function forgetLesson() {
  if (!isLessonId(id.value)) return
  resetLesson(id.value)
  resetKey.value += 1
  confirmingReset.value = false
  justReset.value = true
  nextTick(() => practiceSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function onPracticeComplete() {
  justReset.value = false
  if (!isLessonId(id.value) || !lesson.value) return
  markPractice(id.value)
  tryComplete(id.value, lesson.value.quiz.length)
}
</script>

<template>
  <article v-if="lesson" class="lesson">
    <header class="lesson-head">
      <p class="eyebrow">{{ t('ui.lessonLabel', { current: index + 1, total: LESSON_IDS.length }) }}</p>
      <h1><RichText :text="lesson.title" /></h1>
      <p class="muted"><RichText :text="lesson.summary" /></p>
    </header>

    <section class="panel background-panel" :data-open="String(!skipped)">
      <div class="background-head">
        <div>
          <h2>{{ t('ui.deepBackground') }}</h2>
          <p class="hint">{{ t('ui.backgroundNote') }}</p>
        </div>
        <button
          type="button"
          class="button quiet"
          data-testid="skip-background"
          :aria-expanded="!skipped"
          @click="setBackgroundSkipped(id, !skipped)"
        >
          {{ skipped ? t('ui.showBackground') : t('ui.skipBackground') }}
        </button>
      </div>
      <div v-if="!skipped" class="background-body" data-testid="deep-background">
        <p v-for="paragraph in lesson.deepBackground" :key="paragraph"><RichText :text="paragraph" /></p>
      </div>
    </section>

    <section class="stack lesson-section">
      <h2>{{ t('ui.narrowBackground') }}</h2>
      <p v-for="paragraph in lesson.narrowBackground" :key="paragraph"><RichText :text="paragraph" /></p>
    </section>

    <section class="stack lesson-section">
      <h2>{{ t('ui.intuition') }}</h2>
      <p v-for="paragraph in lesson.intuition.paragraphs" :key="paragraph"><RichText :text="paragraph" /></p>
      <SceneBoard :scene="lesson.intuition.scene" :labels="lesson.intuition.sceneLabels" />
    </section>

    <section ref="practiceSection" class="stack lesson-section">
      <h2>{{ t('ui.practice') }}</h2>
      <p v-if="justReset" class="note good" role="status">{{ t('ui.forgotten') }}</p>
      <CommandDrawer :commands="lesson.commands" />
      <PracticeHost
        :key="`${id}-${resetKey}`"
        :practice="lesson.practice"
        :done="practiceDone"
        @complete="onPracticeComplete"
      />
    </section>

    <QuizBlock
      :key="`${id}-${resetKey}`"
      class="lesson-section"
      :lesson-id="id"
      :questions="lesson.quiz"
      :disabled="!practiceDone"
    />

    <p v-if="complete" class="note good" data-testid="lesson-complete">{{ t('ui.lessonComplete') }}</p>

    <div v-if="hasProgress" class="lesson-reset">
      <button
        v-if="!confirmingReset"
        type="button"
        class="button quiet small"
        data-testid="forget-lesson"
        @click="confirmingReset = true"
      >
        {{ t('ui.forgetProgress') }}
      </button>
      <div v-else class="note bad reset-confirm" role="alertdialog" :aria-label="t('ui.forgetProgress')">
        <p>{{ t('ui.forgetConfirm') }}</p>
        <div class="tool-row">
          <button type="button" class="button small danger" data-testid="forget-lesson-confirm" @click="forgetLesson">
            {{ t('ui.forgetYes') }}
          </button>
          <button type="button" class="button quiet small" @click="confirmingReset = false">{{ t('ui.forgetCancel') }}</button>
        </div>
      </div>
    </div>

    <nav class="pager">
      <RouterLink v-if="prevId" class="button quiet" :to="`/lesson/${prevId}`">{{ t('ui.previous') }}</RouterLink>
      <span v-else></span>
      <RouterLink v-if="nextId" class="button primary" :to="`/lesson/${nextId}`">{{ t('ui.next') }}</RouterLink>
      <RouterLink v-else class="button primary" to="/learn">{{ t('ui.backToPath') }}</RouterLink>
    </nav>
  </article>
  <article v-else class="stack">
    <h1>{{ t('ui.missing') }}</h1>
    <RouterLink class="button primary" to="/learn">{{ t('ui.backToPath') }}</RouterLink>
  </article>
</template>
