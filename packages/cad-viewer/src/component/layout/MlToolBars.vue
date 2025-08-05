<script setup lang="ts">
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { MlToolBar } from '@mlightcad/ui-components'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettings } from '../../composable'
import { layer, move, select, zoomToBox, zoomToExtent } from '../../svg'

const { t } = useI18n()
const features = useSettings()

const verticalToolbarData = computed(() => [
  {
    icon: select,
    text: t('main.verticalToolbar.select.text'),
    command: 'select',
    description: t('main.verticalToolbar.select.description')
  },
  {
    icon: move,
    text: t('main.verticalToolbar.pan.text'),
    command: 'pan',
    description: t('main.verticalToolbar.pan.description')
  },
  {
    icon: zoomToExtent,
    text: t('main.verticalToolbar.zoomToExtent.text'),
    command: 'zoom',
    description: t('main.verticalToolbar.zoomToExtent.description')
  },
  {
    icon: zoomToBox,
    text: t('main.verticalToolbar.zoomToBox.text'),
    command: 'zoomw',
    description: t('main.verticalToolbar.zoomToBox.description')
  },
  {
    icon: layer,
    text: t('main.verticalToolbar.layer.text'),
    command: 'la',
    description: t('main.verticalToolbar.layer.description')
  }
])

const handleCommand = (command: string) => {
  AcApDocManager.instance.sendStringToExecute(command)
}
</script>

<template>
  <div v-if="features.isShowToolbar" class="ml-vertical-toolbar-container">
    <ml-tool-bar
      :items="verticalToolbarData"
      size="small"
      direction="vertical"
      @click="handleCommand"
    />
  </div>
</template>

<style>
.ml-vertical-toolbar-container {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
