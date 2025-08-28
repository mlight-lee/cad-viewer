<template>
  <el-card v-if="visible" class="ml-entity-info">
    <el-row class="ml-entity-info-text">
      <el-col :span="24">
        <el-text size="small" class="ml-entity-info-title">{{
          info.type
        }}</el-text>
      </el-col>
    </el-row>
    <el-row class="ml-entity-info-text">
      <el-col :span="10">
        <el-text size="small">{{ t('main.entityInfo.color') }}</el-text>
      </el-col>
      <el-col :span="14">
        <el-text size="small">{{ info.color }}</el-text>
      </el-col>
    </el-row>
    <el-row class="ml-entity-info-text">
      <el-col :span="10">
        <el-text size="small">{{ t('main.entityInfo.layer') }}</el-text>
      </el-col>
      <el-col :span="14">
        <el-text size="small">{{ info.layer }}</el-text>
      </el-col>
    </el-row>
    <el-row class="ml-entity-info-text">
      <el-col :span="10">
        <el-text size="small">{{ t('main.entityInfo.lineType') }}</el-text>
      </el-col>
      <el-col :span="14">
        <el-text size="small">{{ info.lineType }}</el-text>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import {
  AcApDocManager,
  AcEdViewHoverEventArgs
} from '@mlightcad/cad-simple-viewer'
import { AcDbObjectId } from '@mlightcad/data-model'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { colorName, entityName } from '../../locale'

interface EntityInfo {
  type: string
  color: string
  layer: string
  lineType: string
}

const { t } = useI18n()
const hovered = ref<boolean>(false)
const x = ref<number>(-1)
const y = ref<number>(-1)
const id = ref<AcDbObjectId | null>(null)

const left = computed(() => {
  return x.value + 'px'
})

const top = computed(() => {
  return y.value + 'px'
})

const info = computed<EntityInfo>(() => {
  const db = AcApDocManager.instance.curDocument.database
  if (id.value) {
    const entity = db.tables.blockTable.modelSpace.getIdAt(id.value)
    if (entity) {
      return {
        type: entityName(entity),
        color: colorName(entity.color.toString()),
        layer: entity.layer,
        lineType: entity.lineType
      }
    }
  }
  return {
    type: '',
    color: '',
    layer: '',
    lineType: ''
  }
})

const visible = computed(() => {
  return hovered.value && info.value.type != ''
})

const updateHoverInfo = (args: AcEdViewHoverEventArgs) => {
  id.value = args.id
  x.value = args.x
  y.value = args.y
  hovered.value = true
}

const hideHoverInfo = () => {
  hovered.value = false
}

onMounted(() => {
  const events = AcApDocManager.instance.curView.events
  events.hover.addEventListener(updateHoverInfo)
  events.unhover.addEventListener(hideHoverInfo)
})
onUnmounted(() => {
  const events = AcApDocManager.instance.curView.events
  events.hover.removeEventListener(updateHoverInfo)
  events.unhover.removeEventListener(hideHoverInfo)
})
</script>

<style scoped>
.ml-entity-info {
  position: fixed;
  width: 180px;
  left: v-bind(left);
  top: v-bind(top);
  margin: 0px;
}

.ml-entity-info-title {
  font-weight: bold;
}

.ml-entity-info-text {
  margin-bottom: 6px;
  margin-top: 6px;
}
</style>
