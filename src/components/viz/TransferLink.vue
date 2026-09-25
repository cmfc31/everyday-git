<script setup lang="ts">
defineProps<{ direction: 'up' | 'down'; active: boolean; label: string }>()
</script>

<template>
  <div class="transfer" :class="[`transfer-${direction}`, { active }]" aria-hidden="true">
    <span class="transfer-line"><span class="transfer-packet" /></span>
    <span class="transfer-label">
      <svg viewBox="0 0 24 24">
        <path v-if="direction === 'down'" d="M12 4v15M6 13l6 6 6-6" />
        <path v-else d="M12 20V5M6 11l6-6 6 6" />
      </svg>
      <code>{{ label }}</code>
    </span>
    <span class="transfer-line"><span class="transfer-packet" /></span>
  </div>
</template>
