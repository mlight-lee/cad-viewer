<template>
  <ml-language
    class="ml-language-selector"
    :languages="languages"
    :current="locale"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { MlDropdownMenuItem, MlLanguage } from '@mlightcad/ui-components'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

const languages = reactive<MlDropdownMenuItem[]>([
  {
    name: 'en',
    text: 'English'
  },
  {
    name: 'zh',
    text: '简体中文'
  }
])

const handleClick = (lang: string) => {
  locale.value = lang
  localStorage.setItem('preferred_lang', lang)
}
</script>

<style scoped>
.ml-language-selector {
  position: fixed;
  right: 40px;
  top: 20px;
  z-index: 1000;
}
</style>
