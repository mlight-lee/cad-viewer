<!--
  MlCadViewer - Main CAD Viewer Component
  
  This is the primary component for displaying and interacting with CAD files (DWG, DXF, etc.).
  It provides a complete CAD viewing experience with file loading, layer management, 
  command execution, and various viewing tools.
  
  USAGE EXAMPLE:
  MlCadViewer with locale="en", url="path/to/file.dwg", wait="15"
  
  FEATURES:
  - File loading from local files or URLs
  - Layer management and visibility control
  - Command line interface for CAD operations
  - Toolbars with common CAD tools (zoom, pan, select, etc.)
  - Entity information display
  - Multi-language support (English/Chinese)
  - Dark/light theme support
  - Status bar with progress and settings
  
  COMPONENTS INCLUDED:
  - Main menu and language selector
  - Toolbars with CAD commands
  - Layer manager for controlling entity visibility
  - Command line for text-based commands
  - Status bar with various controls
  - File reader for local file uploads
  - Entity info panel for object details
  
  EVENTS HANDLED:
  - File loading and error handling
  - Font loading notifications
  - General message display
  - File opening failures
  
  DEPENDENCIES:
  - @mlightcad/cad-simple-viewer: Core CAD functionality
  - @mlightcad/data-model: File format support
  - Element Plus: UI components
  - Vue 3 Composition API
-->

<script setup lang="ts">
/**
 * MlCadViewer Component
 *
 * A comprehensive CAD viewer component that provides a complete interface for viewing
 * and interacting with CAD files (DWG, DXF, etc.). This component integrates multiple
 * sub-components to deliver a full-featured CAD viewing experience.
 *
 * @example
 * ```vue
 * // Basic usage
 * <MlCadViewer
 *   :locale="'en'"
 *   :url="'https://example.com/drawing.dwg'"
 *   :wait="15"
 * />
 *
 * // Import statement
 * import { MlCadViewer } from '@mlightcad/cad-viewer'
 * ```
 *
 * @since 1.0.0
 * @version 1.0.0
 * @author MLight Lee (mlight.lee@outlook.com)
 *
 * @see {@link https://github.com/mlight-lee/cad-viewer | Project Repository}
 * @see {@link https://github.com/mlight-lee/cad-viewer/blob/main/packages/cad-viewer/src/component/MlCadViewer.vue | Source Code}
 */

import { AcApDocManager, eventBus } from '@mlightcad/cad-simple-viewer'
import { AcDbOpenDatabaseOptions } from '@mlightcad/data-model'
import { ElMessage } from 'element-plus'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { initializeCadViewer, registerDialogs, store } from '../app'
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

// Define component props with their purposes
interface Props {
  /** Language locale for internationalization ('en', 'zh', or 'default') */
  locale?: LocaleProp
  /** Optional URL to automatically load a CAD file on component mount */
  url?: string
  /** Timeout in seconds to wait for DWG converter (libredwg.js) to load before proceeding */
  wait?: number
  /** Canvas element ID for the CAD viewer. This is required to specify which canvas element to use */
  canvasId: string
  /** Background color as 24-bit hexadecimal RGB number (e.g., 0x000000) */
  background?: number
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'default',
  url: undefined,
  wait: 10,
  background: undefined
})

// Initialize the CAD viewer with the specified canvas ID
initializeCadViewer(props.canvasId)

const { t } = useI18n()
const { effectiveLocale, elementPlusLocale } = useLocale(props.locale)

/**
 * Handles file read events from the file reader component
 * Opens the file content using the document manager
 *
 * @param fileName - Name of the uploaded file
 * @param fileContent - File content as string or ArrayBuffer
 */
const handleFileRead = async (
  fileName: string,
  fileContent: string | ArrayBuffer
) => {
  const options: AcDbOpenDatabaseOptions = { minimumChunkSize: 1000 }
  await AcApDocManager.instance.openDocument(fileName, fileContent, options)
  store.fileName = fileName
}

/**
 * Fetches and opens a CAD file from a remote URL
 * Used when the url prop is provided to automatically load files
 *
 * @param url - Remote URL to the CAD file
 */
const openFileFromUrl = async (url: string) => {
  try {
    const options: AcDbOpenDatabaseOptions = { minimumChunkSize: 1000 }
    await AcApDocManager.instance.openUrl(url, options)

    // Extract filename from URL for display
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

// Watch for URL changes and automatically open new files
// This allows dynamic loading of different CAD files without component remounting
watch(
  () => props.url,
  async newUrl => {
    if (newUrl) {
      openFileFromUrl(newUrl)
    }
  }
)

// Watch for background color changes and apply to the view
watch(
  () => props.background,
  newBg => {
    if (newBg != null) {
      AcApDocManager.instance.curView.backgroundColor = newBg
    }
  }
)

// Component lifecycle: Initialize and load initial file if URL is provided
onMounted(async () => {
  // If URL prop is provided, automatically load the file on mount
  if (props.url) {
    openFileFromUrl(props.url)
  }

  // Apply initial background color if provided
  if (props.background != null) {
    AcApDocManager.instance.curView.backgroundColor = props.background
  }
})

// Set up global event listeners for various CAD operations and notifications
// These events are emitted by the underlying CAD engine and other components

// Handle general messages from the CAD system (info, warnings, errors)
eventBus.on('message', params => {
  ElMessage({
    message: params.message,
    grouping: true,
    type: params.type,
    showClose: true
  })
})

// Handle font loading failures - important for proper text rendering
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

// Handle failures when trying to get available fonts from the system
eventBus.on('failed-to-get-avaiable-fonts', params => {
  ElMessage({
    message: t('main.message.failedToGetAvaiableFonts', { url: params.url }),
    grouping: true,
    type: 'error',
    showClose: true
  })
})

// Handle file opening failures with user-friendly error messages
eventBus.on('failed-to-open-file', params => {
  ElMessage({
    message: t('main.message.failedToOpenFile', { fileName: params.fileName }),
    grouping: true,
    type: 'error',
    showClose: true
  })
})

registerDialogs()
</script>

<template>
  <!-- Main CAD viewer container with complete UI layout -->
  <div>
    <!-- Element Plus configuration provider for internationalization -->
    <el-config-provider :locale="elementPlusLocale">
      <!-- Header section with main menu and language selector -->
      <header>
        <ml-main-menu />
        <ml-language-selector :current-locale="effectiveLocale" />
      </header>

      <!-- Main content area with CAD viewing tools and controls -->
      <main>
        <!-- Display current filename at the top center -->
        <div class="ml-file-name">{{ store.fileName }}</div>

        <!-- Toolbar with common CAD operations (zoom, pan, select, etc.) -->
        <ml-tool-bars />

        <!-- Layer manager for controlling entity visibility and properties -->
        <ml-layer-manager :editor="AcApDocManager.instance" />

        <!-- Dialog manager for modal dialogs and settings -->
        <ml-dialog-manager />
      </main>

      <!-- Footer section with command line and status information -->
      <footer>
        <!-- Command line for text-based CAD commands -->
        <ml-command-line />

        <!-- Status bar with progress, settings, and theme controls -->
        <ml-status-bar />
      </footer>

      <!-- Hidden components for file handling and entity information -->
      <!-- File reader for local file uploads -->
      <ml-file-reader @file-read="handleFileRead" />

      <!-- Entity info panel for displaying object properties -->
      <ml-entity-info />
    </el-config-provider>
  </div>
</template>

<!-- Component-specific styles -->
<style>
/* Position the filename display at the top center of the viewer */
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
