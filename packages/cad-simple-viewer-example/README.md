# CAD Simple Viewer Example

A minimal web application demonstrating how to use the `@mlightcad/cad-simple-viewer` package to display DXF and DWG files in a web browser.

## Features

- 📁 **File Selection**: Click to browse or drag & drop DXF/DWG files
- 🖥️ **Canvas Rendering**: High-performance rendering using the CAD Simple Viewer
- 🔍 **Zoom Controls**: Zoom to fit and reset view functionality
- 📱 **Responsive Design**: Clean, modern interface that works on different screen sizes
- ⚡ **No Backend Required**: Files are processed entirely in the browser

## Getting Started

### Prerequisites

Make sure you have Node.js and pnpm installed. This project is part of a monorepo workspace.

### Installation

From the project root:

```bash
# Install dependencies
pnpm install

# Navigate to the example directory
cd packages/cad-simple-viewer-example

# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
pnpm build
```

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000` in your web browser
2. **Load a File**: 
   - Click the file input area to browse for a DXF or DWG file
   - Or drag and drop a file directly onto the input area
3. **View the Drawing**: The CAD file will be rendered on the canvas
4. **Use Controls**: 
   - Click "🔍 Fit" to zoom the drawing to fit the viewport
   - Click "🏠 Reset" to reset the view to the default position

## Supported File Formats

- **DXF**: AutoCAD Drawing Exchange Format
- **DWG**: AutoCAD Drawing Database (requires additional converter setup)

## Technical Details

This example demonstrates:

- Using `AcApDocManager` to manage CAD documents
- Loading files using `openDocument()` method with ArrayBuffer
- Setting up a canvas for rendering
- Basic view controls (zoom to fit, reset view)
- File drag & drop functionality
- Error handling and user feedback

## Code Structure

- `index.html`: Main HTML page with UI structure and styles
- `src/main.ts`: Main application logic and CAD viewer integration
- `package.json`: Project dependencies and scripts
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration

## Dependencies

- `@mlightcad/cad-simple-viewer`: Core CAD viewer functionality
- `@mlightcad/data-model`: CAD data model and database
- `@mlightcad/three-renderer`: 3D rendering engine
- `three`: 3D graphics library
- `vite`: Build tool and development server

## Notes

- This is a minimal example focusing on the core functionality
- For more advanced features, consider using the full `@mlightcad/cad-viewer` package
- DWG file support may require additional converter setup depending on your requirements
- The viewer uses WebGL for hardware-accelerated rendering

## License

MIT License - see the main project LICENSE file for details.