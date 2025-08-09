# CAD Viewer Component

CAD Viewer is a **high-performance** Vue 3 component for viewing and editing CAD files (DXF, DWG) **entirely in the browser without requiring any backend server**. It provides a modern user interface, state management, and seamless integration with optimized rendering engines for smooth browser-based CAD workflows with exceptional performance.

## Key Features

- **High-performance** CAD editing and viewing with smooth 60+ FPS rendering
- **No backend required** - Files are parsed and processed entirely in the browser
- **Enhanced data security** - Files never leave your device, ensuring complete privacy
- **Easy integration** - No server setup or backend infrastructure needed for third-party integration
- Modern UI optimized for large CAD file handling
- State management for layers, entities, and settings
- Integration with optimized SVG and THREE.js renderers
- Dialogs, toolbars, and command line interface
- Vue 3 component for embedding high-performance CAD viewers in your own apps

## When Should You Choose cad-viewer?

Use `cad-viewer` if you want a **ready-to-use Vue 3 component** for viewing and editing CAD files with a modern UI, dialogs, toolbars, and state management. This package is ideal if:

- You want to quickly embed a high-performance CAD viewer/editor into your Vue application with minimal setup.
- You need a solution that handles file loading, rendering, layer/entity management, and user interactions out of the box.
- You want seamless integration with optimized SVG and THREE.js renderers, internationalization, and theming.
- You do **not** want to build your own UI from scratch.

**Recommended for:** Most web applications, dashboards, or platforms that need to display CAD files with a polished user interface.

## Browser-Only Architecture

This Vue 3 component operates entirely in the browser with **no backend dependencies**. DWG/DXF files are parsed and processed locally using WebAssembly and JavaScript, providing:

- **Zero server requirements** - Deploy the component anywhere with just static file hosting
- **Complete data privacy** - CAD files never leave the user's device
- **Instant integration** - No complex backend setup or API configuration needed
- **Offline capability** - Works without internet connectivity once loaded
- **Third-party friendly** - Easy to embed in any Vue 3 application without server-side concerns

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

Please refer to sub-package `cad-viewer-example` as one example.

### Basic Usage

Firstly, add the following dependencies into your package.json.

- @element-plus/icons-vue
- @mlightcad/cad-simple-viewer
- @mlightcad/cad-viewer
- @mlightcad/data-model
- @mlightcad/libredwg-converter
- @mlightcad/libredwg-web
- @vueuse/core
- element-plus
- vue
- vue-i18n

Then create one vue component as follows.

```vue
<template>
  <div>
    <MlCADViewer />
  </div>
</template>

<script setup lang="ts">
import 'uno.css'
import 'element-plus/dist/index.css'
import 'element-plus/dist/index.css'

import {
  i18n,
  initializeCadViewer,
  MlCadViewer,
  registerCommponents
} from '@mlightcad/cad-viewer'
import ElementPlus from 'element-plus'
import { createApp } from 'vue'

const initApp = () => {
  initializeCadViewer('canvas')

  const app = createApp(MlCadViewer)
  app.use(i18n)
  app.use(ElementPlus)
  app.mount('#app')

  registerCommponents()
}

initApp()
</script>
```

### Advanced Usage

Please refer to [readme of cad-simple-viewer](../cad-simple-viewer/README.md) to learn the following advanced usage.

- Register DWG converter to display drawings in DWG format
- Define your own font loader to load fonts from your own server
- Create drawing or modify drawing

## Available Exports

### Main Component

- `MlCADViewer` - The main CAD viewer component

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