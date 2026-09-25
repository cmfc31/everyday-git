<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommandLine } from '../content/types'

defineProps<{ commands: CommandLine[] }>()

const open = ref(false)
const copied = ref<number | null>(null)
const failed = ref(false)
const { t } = useI18n()

const running = new WeakMap<HTMLElement, Animation>()

function animateHeight(el: Element, to: 'open' | 'closed', done: () => void) {
  const node = el as HTMLElement
  const from = running.has(node) || to === 'closed' ? node.getBoundingClientRect().height : 0
  running.get(node)?.cancel()
  const full = node.scrollHeight
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  node.style.overflow = 'hidden'
  const animation = node.animate(
    [
      { height: `${from}px`, opacity: from / full || 0 },
      { height: to === 'open' ? `${full}px` : '0px', opacity: to === 'open' ? 1 : 0 },
    ],
    { duration: reduce ? 0 : 260, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  )
  running.set(node, animation)
  animation.onfinish = () => {
    running.delete(node)
    node.style.overflow = ''
    done()
  }
}

function onEnter(el: Element, done: () => void) {
  animateHeight(el, 'open', done)
}

function onLeave(el: Element, done: () => void) {
  animateHeight(el, 'closed', done)
}

async function copy(command: string, index: number) {
  failed.value = false
  try {
    await navigator.clipboard.writeText(command)
    copied.value = index
    window.setTimeout(() => {
      if (copied.value === index) copied.value = null
    }, 1500)
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <div class="command-drawer">
    <button type="button" class="button quiet" data-testid="show-commands" :aria-expanded="open" @click="open = !open">
      <span>{{ open ? t('ui.hideCommands') : t('ui.showCommands') }}</span>
      <svg class="drawer-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-show="open" class="commands-reveal">
    <div class="commands panel" data-testid="command-drawer">
      <p class="muted">{{ t('ui.commandNote') }}</p>
      <div v-for="(line, index) in commands" :key="line.command" class="command">
        <div>
          <code>{{ line.command }}</code>
          <p class="hint">{{ line.gloss }}</p>
        </div>
        <button type="button" class="icon-button" @click="copy(line.command, index)">
          {{ copied === index ? t('ui.copied') : t('ui.copy') }}
        </button>
      </div>
      <p v-if="failed" class="note bad" role="alert">{{ t('ui.copyFailed') }}</p>
    </div>
    </div>
    </Transition>
  </div>
</template>
