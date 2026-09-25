<script setup lang="ts">
// Tells the learner what to do in a step: drag (arrow toward the targets), tap a choice, or type.
defineProps<{ text: string; icon: 'up' | 'down' | 'tap' | 'type' }>()
</script>

<template>
  <div class="drag-instruction" :class="`hint-${icon}`">
    <slot />
    <p>
      <svg viewBox="0 0 24 24" aria-hidden="true" :class="`nudge-${icon}`">
        <path v-if="icon === 'up'" d="M12 20V5M6 11l6-6 6 6" />
        <path v-else-if="icon === 'down'" d="M12 4v15M6 13l6 6 6-6" />
        <template v-else-if="icon === 'tap'">
          <path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v5.5" />
          <path d="M12 10V8.5a1.5 1.5 0 0 1 3 0V11M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a5 5 0 0 1-4.1-2.1L5 15.5a1.6 1.6 0 0 1 2.4-2l1.6 1.6" />
        </template>
        <template v-else>
          <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16v4Z" />
          <path d="M13.5 6.5l4 4" />
        </template>
      </svg>
      {{ text }}
    </p>
  </div>
</template>
