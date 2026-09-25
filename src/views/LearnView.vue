<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RichText from '../components/RichText.vue'
import { catalogs } from '../i18n/catalog'
import { LESSON_IDS } from '../content/types'
import { progress } from '../progress'

const { t, locale } = useI18n()
const lessons = computed(() => {
  const catalog = locale.value === 'es-419' ? catalogs['es-419'] : catalogs.en
  return LESSON_IDS.map((id, index) => ({
    id,
    index: index + 1,
    title: catalog.lessons[id].title,
    summary: catalog.lessons[id].summary,
    done: progress.completed.includes(id),
  }))
})
const finished = computed(() => progress.completed.length >= LESSON_IDS.length)
</script>

<template>
  <article class="stack">
    <p class="eyebrow">{{ t('learn.eyebrow') }}</p>
    <h1>{{ t('learn.title') }}</h1>
    <p>{{ t('learn.story') }}</p>
    <p>{{ finished ? t('learn.finished') : t('learn.intro') }}</p>
    <ol class="lesson-list">
      <li v-for="lesson in lessons" :key="lesson.id">
        <RouterLink class="panel" :to="`/lesson/${lesson.id}`">
          <span>
            <strong><RichText :text="`${lesson.index}. ${lesson.title}`" /></strong>
            <span class="hint"><RichText :text="lesson.summary" /></span>
          </span>
          <span v-if="lesson.done" class="check" role="img" :aria-label="t('learn.done')">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5 9.5 17 19 7.5" />
            </svg>
          </span>
        </RouterLink>
      </li>
    </ol>
  </article>
</template>
