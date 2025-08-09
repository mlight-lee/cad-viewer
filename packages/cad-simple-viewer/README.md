# CAD Simple Viewer

This package provides the **high-performance** core components of a CAD viewer such as document management, command handling, and collaboration between the UI and rendering engines. It's designed for optimal performance when handling large CAD files.

This module doesn't depend on any UI framework and doesn't provide any UI except canvas. If you want to integrate a high-performance CAD viewer into a web application with your own UI, this module is the correct choice.

## Key Features
- Document management optimized for large files
- Efficient command stack and undo/redo operations
- Optimized integration with rendering engines
- Performance-focused settings and context management
- Framework-agnostic design for maximum flexibility

## When Should You Choose cad-simple-viewer?

Use `cad-simple-viewer` if you need **core CAD logic only** (document management, command stack, rendering engine integration) without any UI framework dependencies. This package is ideal if:

- You want to build your **own custom UI** or integrate CAD functionality into a non-Vue or non-web environment.
- You require maximum flexibility and performance for handling large CAD files, and plan to connect the logic to your own rendering or UI layer.
- You want a framework-agnostic solution that provides only the essential CAD operations and canvas rendering.

**Recommended for:** Custom integrations, headless CAD processing, or advanced users building highly tailored CAD solutions.

## Directory Structure (partial)
- `src/app/` – Document/context management, settings
- `src/command/` – Command implementations (open, zoom, select, etc.)
- `src/editor/` – Command stack, input handling, global functions
- `src/view/` – Layout and scene management
- `src/util/` – Utilities

## Installation

```bash
npm install @mlightcad/cad-simple-viewer
```

## Usage

Please refer to sub-package `cad-simple-viewer-example` as one example.

### Basic Usage

Firstly, add the following dependencies into your package.json.

- @mlightcad/cad-simple-viewer
- @mlightcad/data-model
- @mlightcad/libredwg-converter
- @mlightcad/libredwg-web

Secondly, add one canvas element in your html.

```html
<body>
  <canvas id="canvas"></canvas>
</body>
```

Thirdly, add the following code in the entry point of cad-simple-viewer integration page.

```typescript
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbDatabaseConverterManager, AcDbFileType } from '@mlightcad/data-model'

// Get canvas DOM element by its id
const canvas = document.getElementById('canvas') as HTMLCanvasElement
AcApDocManager.createInstance(canvas)

// Although it is optional, it is better to call this method to load the default fonts.
// The default fonts are used if fonts used in drawing are not found.
await AcApDocManager.instance.loadDefaultFonts()

// Read the file content
const fileContent = await this.readFile(file)

// Set database options
const options: AcDbOpenDatabaseOptions = {
  minimumChunkSize: 1000,
  readOnly: true
}

// Open the document
const success = await AcApDocManager.instance.openDocument(
  file.name,
  fileContent,
  options
)

// Your application logic here...
......
```

### Register DWG Converter to Display Drawings in DWG Format

By default, cad-simple-viewer registers DXF converter only and can view DXF file only. If you want to view DWG file, you need to register DWG converter. The following example code shows how to register DWG converter.

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

However, the code above works in production mode only even if removing check on 'isDev'. So you still need to make additional changes in order to make it work in Vite dev mode.

Firstly, update `vite.config.ts` to copy `libredwg-web.js` to folder `assets` using `vite-plugin-static-copy`. Do remember adding `vite-plugin-static-copy` as your package devDependencies.

```typescript
import { resolve } from 'path'
import { defineConfig, type ConfigEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command }: ConfigEnv) => {
  return {
    server: {
      port: 3000
    },
    build: {
      target: 'es2020',
      modulePreload: false,
      rollupOptions: {
        // Main entry point for the app
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: id => {
            if (id.includes('@mlightcad/libredwg-web')) {
              return 'libredwg-web'
            }
          }
        }
      }
    },
    plugins: [
      command === 'serve' ? viteStaticCopy({
        targets: [
          {
            src: './node_modules/@mlightcad/libredwg-web/dist/libredwg-web.js',
            dest: 'assets'
          }
        ]
      }) : undefined
    ]
  }
})
```

Secondly, add the following code in your html page such as `index.html` to dynamically import `libredwg-web` and trigger one event `libredwg-ready` after loaded.

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

Thirdly, listen event `libredwg-ready` to register DWG converter `AcDbLibreDwgConverter` after `libredwg-ready` loaded.

```typescript
// This is for development mode only. In production mode, the library is bundled
window.addEventListener('libredwg-ready', event => {
  // @ts-expect-error this is one custom event and you can get details in index.html
  const instance = event.detail as LibreDwgEx
  const converter = new AcDbLibreDwgConverter(instance)
  AcDbDatabaseConverterManager.instance.register(AcDbFileType.DWG, converter)
})
```

### Beyond a Viewer

While `cad-simple-viewer` doesn't support saving drawings to DWG/DXF files, it provides comprehensive support for **modifying drawings in real-time**. You can add, edit, and delete entities within the drawing, and the viewer will automatically update to reflect these changes.

When you modify entities, you're working directly with the underlying drawing database. The viewer automatically detects these changes and updates the display accordingly. This real-time synchronization ensures that:

- All modifications are immediately visible
- The command stack properly tracks changes for undo/redo operations. This will be implemented soon.

This capability makes `cad-simple-viewer` suitable for applications that need to not only display CAD files but also allow users to interact with and modify the drawing content.

**Important Note**: The usage patterns in `cad-simple-viewer` are **very similar to AutoCAD RealDWG**. If you're familiar with AutoCAD RealDWG development, you'll find the API structure and workflow nearly identical. The main difference is that we use the [**realdwg-web API**](https://mlight-lee.github.io/realdwg-web/) instead of the native RealDWG libraries.

#### Example: Adding Entities

The following code demonstrates how to add entities, following the same pattern you'd use in AutoCAD RealDWG:

```typescript
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbLine, AcDbCircle, AcDbText, AcGePoint3d, AcGeVector3d } from '@mlightcad/data-model'

// Get the current document (same as RealDWG)
const doc = AcApDocManager.instance.activeDocument
if (!doc) return

// Get the model space (identical to RealDWG pattern)
const modelSpace = doc.database.modelSpace

// Add a line (same constructor and property setting as RealDWG)
const startPoint = new AcGePoint3d(0, 0, 0)
const endPoint = new AcGePoint3d(100, 100, 0)
const line = new AcDbLine(startPoint, endPoint)
line.layer = '0' // Set layer (same property name as RealDWG)
line.color = 1 // Red color (same color index as RealDWG)
modelSpace.appendEntity(line)

// Add a circle (identical API to RealDWG)
const centerPoint = new AcGePoint3d(50, 50, 0)
const radius = 25
const circle = new AcDbCircle(centerPoint, radius)
circle.layer = '0'
circle.color = 2 // Yellow color
modelSpace.appendEntity(circle)

// Add text (same constructor pattern as RealDWG)
const textPoint = new AcGePoint3d(0, -50, 0)
const text = new AcDbText(textPoint, 'Sample Text', 10) // position, text, height
text.layer = '0'
text.color = 3 // Green color
modelSpace.appendEntity(text)
```

#### Example: Editing Entities

TBD

#### Example: Deleting Entities

TBD

#### Example: Working with Layers

TBD

## Available Exports

### Core Classes

- `AcApContext` - Main application context
- `AcApDocManager` - Document management
- `AcApDocument` - Individual document handling
- `AcApSettingManager` - Settings management

### Commands

- `AcApOpenCmd` - Open file command
- `AcApZoomCmd` - Zoom command
- `AcApPanCmd` - Pan command
- `AcApSelectCmd` - Selection command
- `AcApConvertToSvgCmd` - SVG conversion command

### Editor Components

- `AcEditor` - Main editor class
- `AcEdCommandStack` - Command stack management
- `AcEdSelectionSet` - Selection handling
- `AcEdInputPoint` - Input point management

### View Components

- `AcTrScene` - Scene management
- `AcTrLayoutView` - Layout view handling
- `AcTrView2d` - 2D view management

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

## Role in MLightCAD
This package acts as the core logic layer, connecting the frontend UI with the rendering engines and managing all document-related operations.

## License

MIT