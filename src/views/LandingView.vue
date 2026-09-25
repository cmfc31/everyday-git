<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GitMark from '../components/GitMark.vue'
import { isLessonId } from '../content/types'
import { progress } from '../progress'

const { t } = useI18n()
const last = computed(() => (progress.lastLesson && isLessonId(progress.lastLesson) ? progress.lastLesson : null))
</script>

<template>
  <article class="stack landing" data-testid="landing">
    <GitMark class="landing-mark" />
    <div class="landing-intro">
      <p class="eyebrow">{{ t('landing.eyebrow') }}</p>
      <h1 class="site-title">Everyday Git</h1>
      <p class="welcome">{{ t('landing.welcome') }}</p>
      <p>{{ t('landing.welcomeBody') }}</p>
    </div>
    <section class="panel">
      <h2>{{ t('landing.audienceTitle') }}</h2>
      <p>{{ t('landing.audience') }}</p>
    </section>
    <div class="actions">
      <RouterLink class="button primary" to="/learn">{{ t('landing.start') }}</RouterLink>
      <RouterLink v-if="last" class="button quiet" :to="`/lesson/${last}`">{{ t('landing.continue') }}</RouterLink>
    </div>
  </article>
</template>
