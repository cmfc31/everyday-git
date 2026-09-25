<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GitMark from './GitMark.vue'
import { progress, resolvedTheme, setLanguage, toggleTheme } from '../progress'

const { t } = useI18n()
const theme = computed(() => resolvedTheme())

function choose(locale: 'en' | 'es-419') {
  setLanguage(locale)
}
</script>

<template>
  <header class="app-header">
    <div class="header-start">
      <RouterLink class="brand" to="/">
        <GitMark class="brand-mark" />
        Everyday Git
      </RouterLink>
      <nav class="header-nav" :aria-label="t('ui.primary')">
      <RouterLink to="/" custom v-slot="{ href, navigate, isExactActive }">
        <a :href="href" :class="{ 'router-link-active': isExactActive }" @click="navigate">{{ t('ui.home') }}</a>
      </RouterLink>
      <RouterLink to="/learn">{{ t('ui.lessons') }}</RouterLink>
      </nav>
    </div>
    <div class="header-tools">
      <button
        type="button"
        class="icon-button"
        data-testid="language-en"
        :aria-pressed="progress.language === 'en'"
        @click="choose('en')"
      >
        EN
      </button>
      <button
        type="button"
        class="icon-button"
        data-testid="language-es"
        :aria-pressed="progress.language === 'es-419'"
        @click="choose('es-419')"
      >
        ES
      </button>
      <button type="button" class="icon-button" data-testid="theme-toggle" @click="toggleTheme">
        {{ theme === 'dark' ? t('ui.useLight') : t('ui.useDark') }}
      </button>
    </div>
  </header>
</template>
