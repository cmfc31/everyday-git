<script setup lang="ts">
const props = defineProps<{
  scene: string
  labels: Record<string, string>
}>()

function label(key: string) {
  return props.labels[key] ?? ''
}
</script>

<template>
  <div class="lanes" :data-scene="scene">
    <template v-if="scene === 'copies' || scene === 'behind' || scene === 'local'">
      <section class="lane">
        <h3>{{ label('leftTitle') }}</h3>
        <p>{{ label('leftBody') }}</p>
      </section>
      <section class="lane">
        <h3>{{ label('rightTitle') }}</h3>
        <p>{{ label('rightBody') }}</p>
      </section>
    </template>
    <template v-else-if="scene === 'files'">
      <article class="card">
        <strong>{{ label('price') }}</strong>
        <span>{{ label('priceDetail') }}</span>
      </article>
      <article class="card">
        <strong>{{ label('draft') }}</strong>
        <span>{{ label('draftDetail') }}</span>
      </article>
    </template>
    <template v-else-if="scene === 'lanes' || scene === 'request' || scene === 'review'">
      <section class="lane">
        <h3>{{ label('main') }}</h3>
        <p>{{ label('mainBody') }}</p>
      </section>
      <section class="lane">
        <h3>{{ label('side') }}</h3>
        <p>{{ label('sideBody') }}</p>
      </section>
    </template>
    <template v-else>
      <article class="card">
        <strong>{{ label('you') }}</strong>
        <span>{{ label('youBody') }}</span>
      </article>
      <article class="card">
        <strong>{{ label('ana') }}</strong>
        <span>{{ label('anaBody') }}</span>
      </article>
    </template>
  </div>
</template>
