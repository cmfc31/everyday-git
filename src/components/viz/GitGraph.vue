<script setup lang="ts">
import { computed } from 'vue'
import type { GraphLane, GraphLink } from './graph'

const props = defineProps<{
  lanes: GraphLane[]
  links?: GraphLink[]
  over?: string | null
  dropHint?: string
}>()

const emit = defineEmits<{
  activate: [lane: string]
  laneDragover: [lane: string, event: DragEvent]
  laneDrop: [lane: string, event: DragEvent]
  laneDragleave: []
}>()

const rows = computed(() => new Map(props.lanes.map((lane, index) => [lane.id, index])))

function y(lane: string) {
  return (rows.value.get(lane) ?? 0) + 0.5
}

function curve(fx: number, fy: number, tx: number, ty: number) {
  const mid = (fx + tx) / 2
  return `M ${fx} ${fy} C ${mid} ${fy} ${mid} ${ty} ${tx} ${ty}`
}

function laneStart(lane: GraphLane) {
  return lane.start ?? lane.from?.x ?? 0
}

// Neighbouring labels alternate sides of the line so they never overlap.
function flipped(lane: GraphLane, id: string) {
  const labeled = lane.commits.filter((commit) => commit.label)
  return labeled.findIndex((commit) => commit.id === id) % 2 === 1
}

function activate(lane: GraphLane) {
  if (lane.droppable) emit('activate', lane.id)
}
</script>

<template>
  <div class="graph" :style="{ '--rows': lanes.length }">
    <svg class="graph-lines" :viewBox="`0 0 100 ${lanes.length}`" preserveAspectRatio="none" aria-hidden="true">
      <template v-for="lane in lanes" :key="lane.id">
        <path
          v-if="lane.from"
          class="graph-line"
          :class="`line-${lane.tone}`"
          :d="curve(lane.from.x, y(lane.from.lane), laneStart(lane), y(lane.id))"
        />
        <line
          class="graph-line"
          :class="`line-${lane.tone}`"
          :x1="laneStart(lane)"
          x2="100"
          :y1="y(lane.id)"
          :y2="y(lane.id)"
        />
      </template>
      <path
        v-for="(link, index) in links ?? []"
        :key="index"
        class="graph-line graph-link"
        :class="`link-${link.tone ?? 'merge'}`"
        :d="curve(link.from.x, y(link.from.lane), link.to.x, y(link.to.lane))"
      />
    </svg>

    <template v-for="(lane, index) in lanes" :key="lane.id">
      <div class="graph-label" :style="{ gridRow: index + 1 }">
        <span class="branch-pill" :class="`pill-${lane.tone}`">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="5" r="2.2" />
            <circle cx="6" cy="19" r="2.2" />
            <circle cx="18" cy="8" r="2.2" />
            <path d="M6 7.2v9.6M18 10.2c0 4-4 4.6-9.6 7" />
          </svg>
          {{ lane.label }}
        </span>
      </div>
      <div
        class="graph-track"
        :class="{ droppable: lane.droppable, over: over === lane.id, [`track-${lane.tone}`]: true }"
        :style="{ gridRow: index + 1 }"
        :role="lane.droppable ? 'button' : undefined"
        :tabindex="lane.droppable ? 0 : undefined"
        :aria-label="lane.droppable ? `${dropHint ?? ''} ${lane.label}`.trim() : undefined"
        @click="activate(lane)"
        @keydown.enter.prevent="activate(lane)"
        @keydown.space.prevent="activate(lane)"
        @dragover="lane.droppable && emit('laneDragover', lane.id, $event)"
        @dragleave="lane.droppable && emit('laneDragleave')"
        @drop="lane.droppable && emit('laneDrop', lane.id, $event)"
      >
        <span
          v-for="commit in lane.commits"
          :key="commit.id"
          class="dot"
          :class="[`dot-${lane.tone}`, commit.tone ? `dot-${commit.tone}` : '', { flip: flipped(lane, commit.id) }]"
          :style="{ left: `${commit.x}%` }"
        >
          <span v-if="commit.label" class="dot-label">{{ commit.label }}</span>
        </span>
        <span v-if="lane.badge" class="lane-badge">{{ lane.badge }}</span>
        <span v-else-if="lane.droppable" class="drop-hint">{{ dropHint }}</span>
      </div>
    </template>
  </div>
</template>
