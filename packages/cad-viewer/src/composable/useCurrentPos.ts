import { AcEdBaseView, AcEdMouseEventArgs } from '@mlightcad/cad-simple-viewer'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function useCurrentPos(view: AcEdBaseView) {
  // state encapsulated and managed by the composable
  const x = ref(0)
  const y = ref(0)

  // a composable can update its managed state over time.
  function update(event: AcEdMouseEventArgs) {
    x.value = event.x
    y.value = event.y
  }

  // a composable can also hook into its owner component's
  // lifecycle to setup and teardown side effects.
  onMounted(() => view.events.mouseMove.addEventListener(update))
  onUnmounted(() => view.events.mouseMove.removeEventListener(update))

  const text = computed(() => {
    return `${formatter.format(x.value)}, ${formatter.format(y.value)}`
  })

  // expose managed state as return value
  return { x, y, text }
}
