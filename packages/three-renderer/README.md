# three-renderer

This package implements the **high-performance** THREE.js-based rendering engine for MLightCAD. It renders DWG/DXF entities as interactive 2D/3D graphics using advanced THREE.js optimization techniques to deliver exceptional performance for large CAD files.

## Key Features
- **High-performance** rendering of CAD entities as THREE.js objects with 60+ FPS
- Advanced batch rendering for optimal GPU utilization
- Custom GPU-accelerated shaders for complex line types and hatch patterns
- Efficient geometry batching and material caching
- Optimized 2D and 3D views, layers, and styles
- Memory-efficient rendering for large CAD files

## Performance Optimizations

The THREE.js renderer employs cutting-edge rendering technologies for exceptional performance:

- **Custom Shader Materials**: GPU-accelerated shaders for complex line types and hatch fill patterns
- **Geometry Batching**: Merges points, lines, and areas with the same material to dramatically reduce draw calls
- **Instanced Rendering**: Optimizes rendering of repeated geometries through instancing techniques
- **Buffer Geometry Optimization**: Efficient memory management and geometry merging for reduced GPU overhead
- **Material Caching**: Reuses materials across similar entities to minimize state changes
- **WebGL Optimization**: Leverages modern WebGL features for hardware-accelerated rendering

## Directory Structure (partial)
- `src/AcTrRenderer.ts` – Main high-performance THREE.js renderer
- `src/batch/` – Advanced batched geometry and group rendering optimizations
- `src/geometry/` – Optimized geometry helpers (arrows, points, etc.)
- `src/object/` – Efficient THREE.js object wrappers for CAD entities
- `src/style/` – High-performance style and shader management
- `src/viewport/` – Optimized view and camera management
- `src/util/` – Performance-focused utility functions

## Usage
Import and use `AcTrRenderer` from `src/AcTrRenderer.ts` to render entities using optimized THREE.js rendering with exceptional performance.

## Role in MLightCAD
This package provides the **high-performance** 2D/3D rendering backend for the main application, enabling smooth interactive graphics and advanced visualization for large CAD files.