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

Secondly, add one canvas element in your html.

```html
<body>
  <canvas id="canvas"></canvas>
</body>
```

Thirdly, add the following code in the entry point of cad-simple-viewer integration page.

```typescript
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbDatabaseConverterManager, AcDbFileType, registerWorkers } from '@mlightcad/data-model'

// Initializes background workers used by the viewer runtime.
registerWorkers()

// Get canvas DOM element by its id
const canvas = document.getElementById('canvas') as HTMLCanvasElement
AcApDocManager.createInstance(canvas)

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

Finally, copy web worker javascript files to `dist/assets` folder.

Web worker are used to parser dxf/dwg file and render mtext entities so that UI not blocked. You can copy the following web worker files to folder `dist/assets` manually.

- `./node_modules/@mlightcad/data-model/dist/dxf-parser-worker.js`
- `./node_modules/@mlightcad/cad-simple-viewer/dist/libredwg-parser-worker.js`
- `./node_modules/@mlightcad/cad-simple-viewer/dist/mtext-renderer-worker.js`

However, `vite-plugin-static-copy` is recommended to make your life easier.

```typescript
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      modulePreload: false,
      rollupOptions: {
        // Main entry point for the app
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: './node_modules/@mlightcad/data-model/dist/dxf-parser-worker.js',
            dest: 'assets'
          },
          {
            src: './node_modules/@mlightcad/cad-simple-viewer/dist/libredwg-parser-worker.js',
            dest: 'assets'
          },
          {
            src: './node_modules/@mlightcad/cad-simple-viewer/dist/mtext-renderer-worker.js',
            dest: 'assets'
          }
        ]
      })
    ]
  }
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