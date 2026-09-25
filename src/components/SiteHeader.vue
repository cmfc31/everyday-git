<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GitMark from './GitMark.vue'
import { progress, resolvedTheme, setLanguage, toggleTheme } from '../progress'

const { t } = useI18n()
const route = useRoute()
const theme = computed(() => resolvedTheme())
const menuOpen = ref(false)
const prefsOpen = ref(false)
const prefsEl = ref<HTMLElement | null>(null)
const prefsToggle = ref<HTMLButtonElement | null>(null)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    prefsOpen.value = false
  },
)

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (prefsOpen.value) prefsToggle.value?.focus()
  menuOpen.value = false
  prefsOpen.value = false
}

function onPointerDown(event: PointerEvent) {
  if (prefsOpen.value && !prefsEl.value?.contains(event.target as Node)) {
    prefsOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))

function choose(locale: 'en' | 'es-419') {
  setLanguage(locale)
}
</script>

<template>
  <header class="app-header" :class="{ 'menu-is-open': menuOpen }" @keydown="onKeydown">
    <RouterLink class="brand" to="/">
      <GitMark class="brand-mark" />
      <span>Everyday Git</span>
    </RouterLink>
    <button
      type="button"
      class="icon-button icon-only menu-toggle"
      :aria-expanded="menuOpen"
      aria-controls="header-menu"
      :aria-label="menuOpen ? t('ui.closeMenu') : t('ui.openMenu')"
      @click="menuOpen = !menuOpen"
    >
      <svg v-if="!menuOpen" class="line-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
      <svg v-else class="line-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
    <div id="header-menu" class="header-menu" :class="{ 'is-open': menuOpen }">
    <nav id="header-nav" class="header-nav" :aria-label="t('ui.primary')">
      <RouterLink to="/" custom v-slot="{ href, navigate, isExactActive }">
        <a :href="href" :class="{ 'router-link-active': isExactActive }" @click="navigate">
          <span>{{ t('ui.home') }}</span>
          <svg class="line-icon menu-only" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </a>
      </RouterLink>
      <RouterLink to="/learn">
        <span>{{ t('ui.lessons') }}</span>
        <svg class="line-icon menu-only" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </RouterLink>
    </nav>
    <div ref="prefsEl" class="prefs">
    <button
      ref="prefsToggle"
      type="button"
      class="icon-button icon-only prefs-toggle"
      :aria-expanded="prefsOpen"
      aria-controls="header-prefs"
      :aria-label="t('ui.preferences')"
      :title="t('ui.preferences')"
      @click="prefsOpen = !prefsOpen"
    >
      <svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
        <circle cx="15" cy="7" r="2.5" />
        <circle cx="9" cy="17" r="2.5" />
      </svg>
    </button>
    <div id="header-prefs" class="prefs-panel" :class="{ 'is-open': prefsOpen }">
    <p class="menu-heading">{{ t('ui.preferences') }}</p>
    <div id="header-tools" class="header-tools">
      <div class="tool-row">
      <span class="menu-label" aria-hidden="true">{{ t('ui.language') }}</span>
      <div class="lang-switch" role="group" :aria-label="t('ui.language')">
        <button
          type="button"
          data-testid="language-en"
          :aria-pressed="progress.language === 'en'"
          @click="choose('en')"
        >
          EN
        </button>
        <button
          type="button"
          data-testid="language-es"
          :aria-pressed="progress.language === 'es-419'"
          @click="choose('es-419')"
        >
          ES
        </button>
      </div>
      </div>
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
        <span class="menu-label" aria-hidden="true">{{ theme === 'dark' ? t('ui.useLight') : t('ui.useDark') }}</span>
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
        <span class="menu-label" aria-hidden="true">GitHub</span>
      </a>
    </div>
    </div>
    </div>
    </div>
    <div v-if="menuOpen" class="menu-scrim" aria-hidden="true" @click="menuOpen = false" />
  </header>
</template>
