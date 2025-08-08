# CAD-Viewer

[**🌐 Live Demo**](https://mlight-lee.github.io/cad-viewer/)

[**🌐 API Docs**](https://mlight-lee.github.io/cad-viewer/docs/)

CAD-Viewer is a **high-performance**, modern, web-based CAD editor inspired by AutoCAD. It enables users to view and edit DWG/DXF files **entirely in the browser without requiring any backend server**, providing exceptional rendering speed and smooth interactions. The project is modular and designed for seamless integration with other applications.

![CAD-Viewer](./assets/dwg-viewer.jpg)

## Features

- **High-performance** viewing of large DWG/DXF files with smooth 60+ FPS rendering
- **No backend required** - Files are parsed and processed entirely in the browser
- **Enhanced data security** - Files never leave your device, ensuring complete privacy
- **Easy integration** - No server setup or backend infrastructure needed
- Modular architecture for seamless third-party integration
- Offline and online editing workflows
- THREE.js 3D rendering engines with advanced optimization techniques
- Designed for extensibility and integration with platforms like CMS, Notion, and WeChat

## Performance

CAD-Viewer is engineered for **exceptional performance** and can handle very large DXF/DWG files while maintaining high frame rates. It employs multiple advanced rendering technologies to optimize performance:

- **Custom Shader Materials**: Uses GPU-accelerated shader materials to render complex line types and hatch fill patterns efficiently
- **Geometry Batching**: Merges points, lines, and areas with the same material to dramatically reduce draw calls
- **Instanced Rendering**: Optimizes rendering of repeated geometries through instancing techniques
- **Buffer Geometry Optimization**: Efficient memory management and geometry merging for reduced GPU overhead
- **Material Caching**: Reuses materials across similar entities to minimize state changes
- **WebGL Optimization**: Leverages modern WebGL features for hardware-accelerated rendering

These optimizations enable CAD-Viewer to smoothly render complex CAD drawings with thousands of entities while maintaining responsive user interactions.

## Roadmap

To achieve the final goal, the following milestones are defined:

- [x] **DWG/DXF Viewer**: Create an offline web viewer for DWG/DXF files.
- [ ] **Integration**: Integrate the DWG/DXF viewer into other applications or frameworks (e.g., CMS, Notion, OpenLayers).
- [ ] **WeChat App**: Develop a WeChat app to display DWG/DXF files within WeChat.
- [ ] **Offline CAD Editor**: Build an offline CAD editor that allows users to modify DWG/DXF files in the browser and store changes locally.
- [ ] **Online CAD Editor**: Add backend support to enable users to store changes to DXF/DWG files in the cloud.

## Browser-Only Architecture

CAD-Viewer operates entirely in the browser with **no backend dependencies**. DWG/DXF files are parsed and processed locally using WebAssembly and JavaScript, ensuring:

- **Zero server requirements** - Deploy anywhere with just static file hosting
- **Complete data privacy** - Files never leave the user's device
- **Instant integration** - No complex backend setup or API configuration
- **Offline capability** - Works without internet connectivity

CAD-Viewer is organized into several subpackages, each responsible for a specific aspect of the system:

- **cad-viewer**: Main Vue 3 component and frontend application, including UI components, dialogs, toolbars, state management, and integration with rendering engines.
- **cad-simple-viewer**: Core logic for document management, command handling, and integration between UI and rendering engines. Framework-agnostic and UI-free (canvas only).
- **svg-renderer**: Renders DWG/DXF entities as SVG graphics for exporting and scalable 2D output.
- **three-renderer**: Uses THREE.js to render DWG/DXF entities as interactive 2D/3D graphics with advanced visualization and custom shaders.

## Subpackages

- [`packages/cad-viewer/`](packages/cad-viewer/): Main Vue 3 component, UI, and integration logic.
- [`packages/cad-simple-viewer/`](packages/cad-simple-viewer/): Core document management and command logic, UI-agnostic.
- [`packages/svg-renderer/`](packages/svg-renderer/): SVG-based rendering engine for CAD entities.
- [`packages/three-renderer/`](packages/three-renderer/): THREE.js-based rendering engine for 2D/3D CAD entities.

## Which Viewer Should I Use?

Choosing between `cad-viewer` and `cad-simple-viewer` depends on your project requirements and desired level of integration:

### Use **cad-viewer** if:
- You want a **ready-to-use Vue 3 component** with a modern UI, dialogs, toolbars, and state management.
- You need to quickly embed a high-performance CAD viewer/editor into your Vue application with minimal setup.
- You prefer a solution that handles file loading, rendering, layer/entity management, and user interactions out of the box.
- You want seamless integration with optimized SVG and THREE.js renderers, internationalization, and theming.
- You do **not** want to build your own UI from scratch.

**Recommended for:** Most web applications, dashboards, or platforms that need to display CAD files with a polished user interface.

### Use **cad-simple-viewer** if:
- You need **core CAD logic only** (document management, command stack, rendering engine integration) without any UI framework dependencies.
- You want to build your **own custom UI** or integrate CAD functionality into a non-Vue or non-web environment.
- You require maximum flexibility and performance for handling large CAD files, and plan to connect the logic to your own rendering or UI layer.
- You want a framework-agnostic solution that provides only the essential CAD operations and canvas rendering.

**Recommended for:** Custom integrations, headless CAD processing, or advanced users building highly tailored CAD solutions.

**Summary Table:**

| Package             | UI Provided | Framework | Use Case                                      |
|---------------------|-------------|-----------|-----------------------------------------------|
| `cad-viewer`        | Yes         | Vue 3     | Turnkey CAD viewer/editor with modern UI       |
| `cad-simple-viewer` | No          | None      | Core CAD logic for custom or headless use      |

For more details, see the [cad-viewer README](packages/cad-viewer/README.md) and [cad-simple-viewer README](packages/cad-simple-viewer/README.md).

## Examples

- [`packages/cad-simple-viewer-example/`](packages/cad-simple-viewer-example/): Example application demonstrating how to use the `cad-simple-viewer` component in a real project.
- [`packages/cad-viewer-example/`](packages/cad-viewer-example/): Example application demonstrating how to use the `cad-viewer` component in a real project.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or suggestions.

## License

[MIT](LICENSE)

