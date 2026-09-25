<script setup lang="ts">
defineProps<{
  kind: 'local' | 'remote'
  title: string
  subtitle?: string
  droppable?: boolean
  over?: boolean
}>()
</script>

<template>
  <section class="place" :class="[`place-${kind}`, { droppable, over }]">
    <header class="place-head">
      <span class="place-icon" aria-hidden="true">
        <svg v-if="kind === 'remote'" viewBox="0 0 24 24">
          <path d="M7 18.5h10.5a4.5 4.5 0 0 0 .7-8.95A6 6 0 0 0 6.4 10.6 4 4 0 0 0 7 18.5Z" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="11" rx="1.6" />
          <path d="M2 19.5h20" />
        </svg>
      </span>
      <span class="place-title">
        <strong>{{ title }}</strong>
        <span v-if="subtitle" class="hint">{{ subtitle }}</span>
      </span>
      <slot name="badge" />
    </header>
    <div class="place-body">
      <slot />
    </div>
  </section>
</template>
