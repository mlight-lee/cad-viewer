<template>
  <div v-if="visible" class="ml-progress">
    <el-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="percentage"
      :format="format"
    />
  </div>
</template>

<script lang="ts" setup>
import { AcApDocManager, eventBus } from '@mlightcad/cad-simple-viewer'
import { AcDbConversionStage } from '@mlightcad/data-model'
import { ElLoading, ElProgress } from 'element-plus'
import { onMounted, onUnmounted, ref } from 'vue'

import { progressStageName } from '../../locale'

const percentage = ref(0)
const visible = ref(false)

const updateProgress = (data: {
  percentage: number
  stage: AcDbConversionStage
}) => {
  const stageName = progressStageName(data.stage)
  const loading = ElLoading.service({
    lock: true
  })
  loading.setText(stageName)

  percentage.value = data.percentage
  if (percentage.value < 100) {
    visible.value = true
  } else {
    visible.value = false
    loading.close()
    AcApDocManager.instance.curView.zoomToFit()
  }
}

const format = (percentage: number) => {
  return `${percentage.toFixed(0)}%`
}

onMounted(() => {
  eventBus.on('open-file-progress', updateProgress)
})

onUnmounted(() => {
  eventBus.off('open-file-progress', updateProgress)
})
</script>

<style scoped>
.ml-progress {
  width: 100px;
}
</style>
