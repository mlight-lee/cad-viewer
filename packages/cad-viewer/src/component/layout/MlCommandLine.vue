<template>
  <div class="autocomplete-container">
    <el-autocomplete
      v-model="currentQuery"
      v-if="features.isShowCommandLine"
      value-key="commandName"
      clearable
      :fetch-suggestions="fetchSuggestions"
      :placeholder="t('main.commandLine.prompt')"
      :debounce="300"
      trigger-on-focus
      :fit-input-width="false"
      @select="executeCommand"
      @keydown.enter="executeCommand"
      class="autocomplete-input"
    >
      <template #default="{ item }">
        <div>{{ commandDescription(item.groupName, item.commandName) }}</div>
      </template>
      <template #prepend>{{ `> ${lastQuery}` }}</template>
    </el-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { ElAutocomplete } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CommandInfo, useCommands, useSettings } from '../../composable'
import { cmdDescription } from '../../locale'

const { t } = useI18n()
const features = useSettings()
const commands = useCommands()
const currentQuery = ref<string>('')
const lastQuery = ref<string>('')

const fetchSuggestions = (
  query: string,
  callback: (suggestions: CommandInfo[]) => void
): void => {
  const results = query
    ? commands.filter((command: CommandInfo) =>
        command.commandName.startsWith(query.toLowerCase())
      )
    : commands
  callback(results)
}

const executeCommand = () => {
  if (currentQuery.value) {
    AcApDocManager.instance.sendStringToExecute(currentQuery.value)
    lastQuery.value = currentQuery.value
    currentQuery.value = ''
  }
}

const commandDescription = (groupName: string, cmdName: string) => {
  return `${cmdName}: ${cmdDescription(groupName, cmdName)}`
}
</script>

<style scoped>
.autocomplete-container {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
  z-index: 1000;
}

.autocomplete-input {
  width: 100%;
}
</style>
