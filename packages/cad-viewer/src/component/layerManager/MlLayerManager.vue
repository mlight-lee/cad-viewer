<template>
  <ml-tool-palette
    class="ml-layer-manager"
    v-model="store.dialogs.layerManager"
    title="Layers"
    :bottom-offset="30"
  >
    <div class="ml-layer-list-wrapper">
      <ml-layer-list :editor="props.editor" />
    </div>
  </ml-tool-palette>
</template>

<script setup lang="ts">
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { MlToolPalette } from '@mlightcad/ui-components'

import { store } from '../../app'
import MlLayerList from './MlLayerList.vue'

/**
 * Properties of MlLayerList component
 */
interface Props {
  /**
   * Current editor
   */
  editor: AcApDocManager
}

const props = defineProps<Props>()
</script>

<style scoped>
.ml-layer-manager {
  left: 2px;
  top: 55px;
  width: 400px;
  height: 500px;
}

.ml-layer-list-wrapper {
  overflow: auto;
  width: 100%;
  display: flex;
  align-items: flex-start; /* Align items at the top */
  justify-content: flex-start; /* Align items to the left */
}
</style>
