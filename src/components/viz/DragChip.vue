<script setup lang="ts">
// A draggable card. Unless it is inert, tapping it (or Enter/Space) emits `activate`,
// so every drag also works on touch screens and with the keyboard.
const props = defineProps<{ label: string; detail?: string; icon?: 'commit' | 'branch' | 'file'; inert?: boolean }>()
const emit = defineEmits<{ activate: [] }>()

function activate() {
  if (!props.inert) emit('activate')
}
</script>

<template>
  <article
    class="chip"
    :class="[`chip-${icon ?? 'commit'}`, { placed: inert }]"
    :draggable="!inert"
    :role="inert ? undefined : 'button'"
    :tabindex="inert ? undefined : 0"
    @click="activate"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <span class="chip-icon" aria-hidden="true">
      <svg v-if="icon === 'file'" viewBox="0 0 24 24">
        <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z" />
        <path d="M14 3.5V8h4" />
      </svg>
      <svg v-else-if="icon === 'branch'" viewBox="0 0 24 24">
        <circle cx="6" cy="5" r="2.2" />
        <circle cx="6" cy="19" r="2.2" />
        <circle cx="18" cy="8" r="2.2" />
        <path d="M6 7.2v9.6M18 10.2c0 4-4 4.6-9.6 7" />
      </svg>
      <svg v-else viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.6" />
        <path d="M2.5 12h5.9M15.6 12h5.9" />
      </svg>
    </span>
    <span class="chip-text">
      <strong>{{ label }}</strong>
      <span v-if="detail">{{ detail }}</span>
      <slot />
    </span>
    <span class="chip-grip" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
        <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
        <circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
      </svg>
    </span>
  </article>
</template>
