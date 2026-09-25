import { ref } from 'vue'

export function useDrag() {
  const dragging = ref<string | null>(null)
  const over = ref<string | null>(null)

  function start(event: DragEvent, id: string) {
    dragging.value = id
    event.dataTransfer?.setData('text/plain', id)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  function allow(event: DragEvent, target: string) {
    event.preventDefault()
    over.value = target
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  function read(event: DragEvent) {
    event.preventDefault()
    const id = event.dataTransfer?.getData('text/plain') || dragging.value
    dragging.value = null
    over.value = null
    return id
  }

  function leave() {
    over.value = null
  }

  return { dragging, over, start, allow, read, leave }
}
