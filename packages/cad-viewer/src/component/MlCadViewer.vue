<script setup lang="ts">
import { AcApDocManager, eventBus } from '@mlightcad/cad-simple-viewer'
import {
  AcDbDatabaseConverterManager,
  AcDbFileType,
  AcDbOpenDatabaseOptions} from '@mlightcad/data-model'
import { ElLoading,ElMessage } from 'element-plus'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { store } from '../app'
import { useLocale } from '../composable'
import { LocaleProp } from '../locale'
import { MlDialogManager, MlFileReader } from './common'
import { MlLayerManager } from './layerManager'
import {
  MlCommandLine,
  MlEntityInfo,
  MlLanguageSelector,
  MlMainMenu,
  MlToolBars
} from './layout'
import { MlStatusBar } from './statusBar'

// Define props
interface Props {
  locale?: LocaleProp
  url?: string
  wait?: number
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'default',
  url: undefined,
  wait: 10
})

// Function to wait for libredwg.js to be loaded
const waitForLibreDwg = () => {
  if (props.wait <= 0) {
    return Promise.resolve()
  }

  return new Promise<void>(resolve => {
    // Show loading service
    const loading = ElLoading.service({
      lock: true,
      text: t('main.message.loadingDwgConverter')
    })

    // Check if DWG converter is already registered
    const checkDwgConverter = () => {
      const dwgConverter = AcDbDatabaseConverterManager.instance.get(
        AcDbFileType.DWG
      )
      if (dwgConverter) {
        loading.close()
        resolve()
        return true
      }
      return false
    }

    // Check immediately first
    if (checkDwgConverter()) {
      return
    }

    // Poll every 0.5 seconds for up to the specified timeout
    let attempts = 0
    const maxAttempts = Math.floor(props.wait * 2) // Convert seconds to attempts (0.5 second intervals)
    const pollInterval = setInterval(() => {
      attempts++
      if (checkDwgConverter()) {
        clearInterval(pollInterval)
        return
      }

      if (attempts >= maxAttempts) {
        console.warn(
          `DWG converter loading timeout after ${props.wait} seconds - proceeding anyway`
        )
        loading.close()
        clearInterval(pollInterval)
        resolve()
      }
    }, 500) // Check every 0.5 seconds
  })
}

const { t } = useI18n()
const { effectiveLocale, elementPlusLocale } = useLocale(props.locale)

const handleFileRead = async (
  fileName: string,
  fileContent: string | ArrayBuffer
) => {
  const options: AcDbOpenDatabaseOptions = { minimumChunkSize: 1000 }
  await AcApDocManager.instance.openDocument(fileName, fileContent, options)
  store.fileName = fileName
}

// Function to fetch and open file from URL
const openFileFromUrl = async (url: string) => {
  try {
    const options: AcDbOpenDatabaseOptions = { minimumChunkSize: 1000 }
    await AcApDocManager.instance.openUrl(url, options)

    const fileName = url.split('/').pop()
    store.fileName = fileName ?? ''
  } catch (error) {
    console.error('Failed to open file from URL:', error)
    ElMessage({
      message: t('main.message.failedToOpenFile', { fileName: url }),
      grouping: true,
      type: 'error',
      showClose: true
    })
  }
}

// Watch for URL changes and open file
watch(
  () => props.url,
  async newUrl => {
    if (newUrl) {
      // Wait for libredwg.js to be loaded if wait prop is true
      await waitForLibreDwg()
      openFileFromUrl(newUrl)
    }
  }
)

// Open file from URL on mount if provided
onMounted(async () => {
  // Wait for libredwg.js to be loaded if wait prop is true
  await waitForLibreDwg()

  if (props.url) {
    openFileFromUrl(props.url)
  }
})

eventBus.on('message', params => {
  ElMessage({
    message: params.message,
    grouping: true,
    type: params.type,
    showClose: true
  })
})

eventBus.on('font-not-loaded', params => {
  ElMessage({
    message: t('main.message.fontNotLoaded', {
      fontName: params.fontName,
      url: params.url
    }),
    grouping: true,
    type: 'error',
    showClose: true
  })
})

eventBus.on('failed-to-get-avaiable-fonts', params => {
  ElMessage({
    message: t('main.message.failedToGetAvaiableFonts', { url: params.url }),
    grouping: true,
    type: 'error',
    showClose: true
  })
})

eventBus.on('failed-to-open-file', params => {
  ElMessage({
    message: t('main.message.failedToOpenFile', { fileName: params.fileName }),
    grouping: true,
    type: 'error',
    showClose: true
  })
})
</script>

<template>
  <div>
    <el-config-provider :locale="elementPlusLocale">
      <header>
        <ml-main-menu />
        <ml-language-selector :current-locale="effectiveLocale" />
      </header>
      <main>
        <div class="ml-file-name">{{ store.fileName }}</div>
        <ml-tool-bars />
        <ml-layer-manager :editor="AcApDocManager.instance" />
        <ml-dialog-manager />
      </main>
      <footer>
        <ml-command-line />
        <ml-status-bar />
      </footer>

      <ml-file-reader @file-read="handleFileRead" />
      <ml-entity-info />
    </el-config-provider>
  </div>
</template>

<style>
.ml-file-name {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
  margin-top: 20px;
}
</style>
