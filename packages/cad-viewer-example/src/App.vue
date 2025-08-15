<template>
  <div id="app-root">
    <MlCadViewer
      locale="en"
      canvas-id="canvas"
      url="https://cdn.jsdelivr.net/gh/mlight-lee/cad-data/data/anteen.dwg"
    />
  </div>
</template>

<script setup lang="ts">
import { AcApSettingManager } from '@mlightcad/cad-simple-viewer'
import { MlCadViewer } from '@mlightcad/cad-viewer'

AcApSettingManager.instance.isShowCommandLine = false
// Decide whether to show vertical toolbar at the right side, performance stats, coordinates in status bar, etc.
// AcApSettingManager.instance.isShowToolbar = false
// AcApSettingManager.instance.isShowStats = false
// AcApSettingManager.instance.isShowCoordinate = false
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
