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
      <button
        type="button"
        class="icon-button icon-only"
        data-testid="theme-toggle"
        :aria-label="theme === 'dark' ? t('ui.useLight') : t('ui.useDark')"
        @click="toggleTheme"
      >
        <svg v-if="theme === 'dark'" class="mark" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"
          />
        </svg>
        <svg v-else class="mark" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
          />
        </svg>
      </button>
      <a
        class="icon-button icon-only"
        href="https://github.com/cmfc31/everyday-git"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="github-link"
        :aria-label="t('ui.github')"
      >
        <svg class="mark" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </div>
  </header>
</template>
