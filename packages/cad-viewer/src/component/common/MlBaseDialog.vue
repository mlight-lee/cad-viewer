<script lang="ts" setup>
import { ElButton, ElDialog } from 'element-plus'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDialogManager } from '../../composable/useDialogManager'

const { t } = useI18n()
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: true
  },
  width: {
    type: [Number, String],
    default: ''
  },
  props: {
    type: Object,
    default: () => ({})
  }
})

const emits = defineEmits(['update:modelValue', 'ok', 'cancel'])

const { registerDialog } = useDialogManager()

function handleOk() {
  emits('ok')
  emits('update:modelValue', false)
}

function handleCancel() {
  emits('cancel')
  emits('update:modelValue', false)
}

onMounted(() => {
  registerDialog({
    name: props.name,
    component: 'BaseDialog',
    props: props.props
  })
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :width="width"
    close="handleCancel"
    class="ml-dialog"
  >
    <template #header>
      <div>{{ title }}</div>
      <el-divider class="ml-dialog-header-bottom-line" />
    </template>
    <slot />
    <template #footer>
      <el-divider class="ml-dialog-footer-top-line" />
      <el-button @click="handleCancel">{{
        t('dialog.baseDialog.cancel')
      }}</el-button>
      <el-button type="primary" @click="handleOk">{{
        t('dialog.baseDialog.ok')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.ml-dialog-header-bottom-line {
  margin-left: -16px;
  margin-top: 6px;
  margin-bottom: 6px;
  width: calc(100% + 64px);
}

.ml-dialog-footer-top-line {
  margin-left: -16px;
  margin-top: 6px;
  margin-bottom: 6px;
  width: calc(100% + 32px);
}
</style>
