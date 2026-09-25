<script setup lang="ts">
import { computed } from 'vue'
import RichText from '../RichText.vue'

// Only the current step is open: locked steps stay hidden and finished ones shrink to a one-line summary.
// The final step stays open once done, so its result remains visible.
const props = defineProps<{
  n: number
  title: string
  state: 'active' | 'done' | 'locked'
  summary?: string
  final?: boolean
}>()

const collapsed = computed(() => props.state === 'done' && !props.final)
</script>

<template>
  <section v-if="state !== 'locked'" class="step" :class="[`step-${state}`, { collapsed }]">
    <header class="step-head">
      <span class="step-num" aria-hidden="true">
        <svg v-if="state === 'done'" viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5" /></svg>
        <template v-else>{{ n }}</template>
      </span>
      <h3><RichText :text="title" /></h3>
      <span v-if="collapsed && summary" class="step-summary">{{ summary }}</span>
    </header>
    <div v-if="!collapsed" class="step-body">
      <slot />
    </div>
  </section>
</template>
