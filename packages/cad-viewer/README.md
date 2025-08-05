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

Please refer to sub-package `cad-viewer-example` as one example.

### Basic Usage

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

By default, cad viewer registers DXF converter only and can view DXF file only. If you want to view DWG file, you need to register DWG converter. The following example code shows how to register DWG converter.

```typescript
import {
  AcDbDatabaseConverterManager,
  AcDbFileType
} from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'


const registerConverters = async () => {
  try {
    const isDev = import.meta.env.DEV
    if (!isDev) {
      // Production mode - use dynamic import with explicit chunk name
      const instance = await import(
        /* webpackChunkName: "libredwg-web" */ '@mlightcad/libredwg-web'
      )
      const converter = new AcDbLibreDwgConverter(await instance.createModule())
      AcDbDatabaseConverterManager.instance.register(
        AcDbFileType.DWG,
        converter
      )
    }
  } catch (error) {
    console.error('Failed to load libredwg-web: ', error)
  }
}
```

In order to make it work in Vite dev mode, you need to add the following code.

```typescript
// This is for development mode only. In production mode, the library is bundled
window.addEventListener('libredwg-ready', event => {
  // @ts-expect-error this is one custom event and you can get details in index.html
  const instance = event.detail as LibreDwgEx
  const converter = new AcDbLibreDwgConverter(instance)
  AcDbDatabaseConverterManager.instance.register(AcDbFileType.DWG, converter)
})
```

Copy `libredwg-web.js` to folder `public/assets` and update `index.html` by adding the following code.

```html
<script type="module" defer>
  if (import.meta.env.DEV) {
    (async () => {
      // Create a script element to load the module
      const script = document.createElement("script");
      script.type = "module";
      script.src = "/assets/libredwg-web.js";
      script.async = true;
      
      script.onload = async () => {
        // Import dynamically after script is loaded
        const actualModule = await import(/* @vite-ignore */script.src);
        const libredwg = await actualModule.createModule();
        window.dispatchEvent(new CustomEvent("libredwg-ready", { detail: libredwg }));
      };
  
      document.body.appendChild(script);
    })();
  }
</script>
```

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

## Dependencies

This component library requires the following peer dependencies:

- `vue` ^3.4.0
- `@mlightcad/data-model`
- `@mlightcad/libredwg-converter`
- `@mlightcad/libredwg-web`
- `@mlightcad/svg-renderer`
- `@mlightcad/three-renderer`
- `@mlightcad/cad-simple-viewer`
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