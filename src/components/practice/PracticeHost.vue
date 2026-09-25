<script setup lang="ts">
import type { Practice } from '../../content/types'
import BranchPractice from './BranchPractice.vue'
import ChoicePractice from './ChoicePractice.vue'
import CommitPractice from './CommitPractice.vue'
import ConflictPractice from './ConflictPractice.vue'
import PrPractice from './PrPractice.vue'
import PullPractice from './PullPractice.vue'
import ReviewPractice from './ReviewPractice.vue'

defineProps<{ practice: Practice; done: boolean }>()
const emit = defineEmits<{ complete: [] }>()
</script>

<template>
  <PullPractice v-if="practice.kind === 'pull'" :practice="practice" :done="done" @complete="emit('complete')" />
  <CommitPractice v-else-if="practice.kind === 'commit'" :practice="practice" :done="done" @complete="emit('complete')" />
  <BranchPractice v-else-if="practice.kind === 'branch'" :practice="practice" :done="done" @complete="emit('complete')" />
  <ChoicePractice v-else-if="practice.kind === 'choice'" :practice="practice" :done="done" @complete="emit('complete')" />
  <PrPractice v-else-if="practice.kind === 'pr'" :practice="practice" :done="done" @complete="emit('complete')" />
  <ReviewPractice v-else-if="practice.kind === 'review'" :practice="practice" :done="done" @complete="emit('complete')" />
  <ConflictPractice v-else-if="practice.kind === 'conflict'" :practice="practice" :done="done" @complete="emit('complete')" />
</template>
