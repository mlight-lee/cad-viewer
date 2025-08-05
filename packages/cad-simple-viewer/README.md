# CAD Simple Viewer

This package provides the core components of one cad viewer such as document management, command handling, and collaberation between the UI and rendering engines.

This module doesn't depends on any UI framework and doesn't provide any UI except canvas. If you want to integrate cad viewer into one web application with your own UI, this module is the correct choice.

## Key Features
- Document management (open, create, save)
- Command stack and undo/redo
- Integration with rendering engines
- Settings and context management

## Directory Structure (partial)
- `src/app/` – Document/context management, settings
- `src/command/` – Command implementations (open, zoom, select, etc.)
- `src/editor/` – Command stack, input handling, global functions
- `src/view/` – Layout and scene management
- `src/util/` – Utilities

## Usage
Entry point: `src/app/index.ts`. Used by the main application to manage documents and commands.

## Role in MLightCAD
This package acts as the core logic layer, connecting the frontend UI with the rendering engines and managing all document-related operations.