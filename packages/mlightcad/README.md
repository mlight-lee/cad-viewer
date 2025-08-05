# CAD Viewer Component

CAD Viewer is one Vue 3 component for viewing and editing CAD files (DXF, DWG) in web applications. It provides a modern user interface, state management, and seamless integration with rendering engines for browser-based CAD workflows.

## Key Features

- Modern UI for CAD editing and viewing
- State management for layers, entities, and settings
- Integration with SVG and THREE.js renderers
- Dialogs, toolbars, and command line interface
- Vue 3 component for embedding CAD viewers in your own apps

## Directory Structure (partial)

- `src/app/` – Application entry, store, and main logic
- `src/component/` – UI components (dialogs, toolbars, status bar, etc.)
- `src/composable/` – Vue composables for state and logic
- `src/locale/` – Internationalization files
- `src/style/` – Stylesheets
- `src/svg/` – SVG assets

## Installation

```bash
npm install @mlightcad/cad-viewer
```

## Usage

### Basic Usage

```vue
<template>
  <div>
    <MlApp />
  </div>
</template>

<script setup lang="ts">
import { MlApp } from '@mlightcad/cad-viewer'
import '@mlightcad/cad-viewer/style'
</script>
```

### Advanced Usage

```vue
<template>
  <div>
    <MlApp />
  </div>
</template>

<script setup lang="ts">
import { createApp } from 'vue'
import { MlApp } from '@mlightcad/cad-viewer'
import { i18n } from '@mlightcad/cad-viewer/locale'
import { useDialogManager } from '@mlightcad/cad-viewer/composable'
import { markRaw } from 'vue'

// Import components and commands
import {
  AcApLayerStateCmd,
  AcApLogCmd,
  AcApMissedDataCmd,
  AcApPointStyleCmd
} from '@mlightcad/cad-viewer/command'
import { MlPointStyleDlg, MlReplacementDlg } from '@mlightcad/cad-viewer/component'

// Import required dependencies
import {
  AcDbDatabaseConverterManager,
  AcDbFileType
} from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'
import { AcApDocManager, AcEdCommandStack } from '@mlightcad/viewer'

const { registerDialog } = useDialogManager()

// Register commands
const registerCmds = () => {
  AcEdCommandStack.instance.addCommand(
    AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
    'log',
    'log',
    new AcApLogCmd()
  )
  // ... register other commands
}

// Register dialogs
const registerDialogs = () => {
  registerDialog({
    name: 'ReplacementDlg',
    component: markRaw(MlReplacementDlg),
    props: {}
  })
  // ... register other dialogs
}

// Initialize the application
const initApp = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  AcApDocManager.createInstance(canvas)
  registerCmds()
  registerDialogs()
}

initApp()
</script>
```

## Available Exports

### Main Component

- `MlApp` - The main CAD viewer component

### Commands

- `AcApLayerStateCmd` - Layer state command
- `AcApLogCmd` - Log command
- `AcApMissedDataCmd` - Missed data command
- `AcApPointStyleCmd` - Point style command

### Components

- `MlPointStyleDlg` - Point style dialog
- `MlReplacementDlg` - Replacement dialog
- Various layout and UI components

### Composables

- `useCommands` - Command management
- `useCurrentPos` - Current position tracking
- `useDark` - Dark mode support
- `useDialogManager` - Dialog management
- `useFileTypes` - File type utilities
- `useLayers` - Layer management
- `useLayouts` - Layout management
- `useMissedData` - Missed data handling
- `useSettings` - Settings management
- `useSystemVars` - System variables

### Locale

- `i18n` - Internationalization instance
- Language files for English and Chinese

### Styles

- CSS and SCSS files for styling
- Dark mode support
- Element Plus integration

## Dependencies

This component library requires the following peer dependencies:

- `vue` ^3.4.0
- `@mlightcad/data-model`
- `@mlightcad/libredwg-converter`
- `@mlightcad/libredwg-web`
- `@mlightcad/svg-renderer`
- `@mlightcad/three-renderer`
- `@mlightcad/viewer`
- `element-plus`
- `vue-i18n`
- And others as specified in package.json

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the library
pnpm build

# Preview the build
pnpm preview
```

## License

MIT