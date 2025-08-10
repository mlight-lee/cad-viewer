<template>
  <div id="app-root">
    <MlCadViewer
      locale="en"
      url="https://cdn.jsdelivr.net/gh/mlight-lee/cad-data/data/anteen.dwg"
    />
  </div>
</template>

<script setup lang="ts">
import { MlCadViewer } from '@mlightcad/cad-viewer'
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
