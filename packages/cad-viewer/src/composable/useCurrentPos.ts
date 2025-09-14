import { AcEdBaseView, AcEdMouseEventArgs } from '@mlightcad/cad-simple-viewer'
import { computed, onMounted, onUnmounted, ref } from 'vue'

function formatNumberSmart(num: number, locale = 'en-US') {
  // threshold can be adjusted
  const ABS = Math.abs(num)
  if (ABS !== 0 && (ABS < 1e-3 || ABS >= 1e6)) {
    // use scientific notation
    const [coefficient, exponent] = num.toExponential(3).split('e')
    const formattedCoeff = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 3
    }).format(Number(coefficient))
    return `${formattedCoeff}e${exponent}`
  } else {
    // normal localized formatting
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 6
    }).format(num)
  }
}

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
    return `${formatNumberSmart(x.value)}, ${formatNumberSmart(y.value)}`
  })

  // expose managed state as return value
  return { x, y, text }
}
