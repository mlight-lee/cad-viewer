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
import { AcApDocManager, AcEdOpenFileProgressEventArgs, eventBus } from '@mlightcad/cad-simple-viewer'
import { ElLoading, ElProgress } from 'element-plus'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { conversionSubStageName } from '../../locale'

const { t } = useI18n()
const percentage = ref(0)
const visible = ref(false)

const updateProgress = (data: AcEdOpenFileProgressEventArgs) => {
  if (data.stage === 'CONVERSION') {
    const loading = ElLoading.service({
      lock: true
    })
    if (data.subStage) {
      const stageName = conversionSubStageName(data.subStage)
      loading.setText(stageName)
    }

    percentage.value = data.percentage
    if (percentage.value < 100) {
      visible.value = true
    } else {
      visible.value = false
      loading.close()
      AcApDocManager.instance.curView.zoomToFit()
    }
  } else if (data.stage === 'FETCH_FILE') {
    const loading = ElLoading.service({
      lock: true
    })
    loading.setText(t('main.message.fetchingDrawingFile'))
    
    percentage.value = data.percentage
    if (percentage.value < 100) {
      visible.value = true
    } else {
      visible.value = false
      loading.close()
    }
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
