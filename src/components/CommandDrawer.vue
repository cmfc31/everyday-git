<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommandLine } from '../content/types'

defineProps<{ commands: CommandLine[] }>()

const open = ref(false)
const copied = ref<number | null>(null)
const failed = ref(false)
const { t } = useI18n()

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
      {{ open ? t('ui.hideCommands') : t('ui.showCommands') }}
    </button>
    <div v-if="open" class="commands panel" data-testid="command-drawer">
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
</template>
