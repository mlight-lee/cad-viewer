<template>
  <ml-toggle-button
    v-model="isDark"
    :data="themeBtnData"
    @click="toggleDark()"
  />
</template>

<script lang="ts" setup>
import { Moon, Sunny } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { isDark, toggleDark } from '../../composable'
import { MlToggleButton } from '../common'

const { t } = useI18n()

const themeBtnData = computed(() => {
  return {
    onIcon: Sunny,
    offIcon: Moon,
    onTooltip: t('main.statusBar.theme.light'),
    offTooltip: t('main.statusBar.theme.dark')
  }
})
</script>
