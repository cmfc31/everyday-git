<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()

const parts = computed(() => {
  const pieces: { term: boolean; text: string }[] = []
  const pattern = /\*\*([^*]+)\*\*/g
  let last = 0
  for (const match of props.text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) pieces.push({ term: false, text: props.text.slice(last, index) })
    pieces.push({ term: true, text: match[1] ?? '' })
    last = index + match[0].length
  }
  if (last < props.text.length) pieces.push({ term: false, text: props.text.slice(last) })
  return pieces
})
</script>

<template>
  <span>
    <template v-for="(part, index) in parts" :key="index">
      <strong v-if="part.term" class="term">{{ part.text }}</strong>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>
