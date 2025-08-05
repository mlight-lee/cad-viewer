# CAD-Viewer

[**🌐 Live Demo**](https://mlight-lee.github.io/cad-viewer/)

CAD-Viewer is a modern, web-based CAD editor inspired by AutoCAD. It enables users to view and edit DWG/DXF files directly in the browser, supporting both offline and online workflows. The project is modular and designed for seamless integration with other applications.

![CAD-Viewer](./assets/dwg-viewer.jpg)

## Features

- View DWG/DXF files in the browser
- Modular architecture for easy integration
- Offline and online editing workflows
- THREE.js 3D rendering engines
- Designed for extensibility and integration with platforms like CMS, Notion, and WeChat

## Roadmap

To achieve the final goal, the following milestones are defined:

- **DWG/DXF Viewer**: Create an offline web viewer for DWG/DXF files.
- **Integration**: Integrate the DWG/DXF viewer into other applications or frameworks (e.g., CMS, Notion, OpenLayers).
- **WeChat App**: Develop a WeChat app to display DWG/DXF files within WeChat.
- **Offline CAD Editor**: Build an offline CAD editor that allows users to modify DWG/DXF files in the browser and store changes locally.
- **Online CAD Editor**: Add backend support to enable users to store changes to DXF/DWG files in the cloud.

## Architecture

CAD-Viewer is organized into several subpackages, each responsible for a specific aspect of the system:

- **cad-viewer**: Main Vue 3 component and frontend application, including UI components, dialogs, toolbars, state management, and integration with rendering engines.
- **cad-simple-viewer**: Core logic for document management, command handling, and integration between UI and rendering engines. Framework-agnostic and UI-free (canvas only).
- **svg-renderer**: Renders DWG/DXF entities as SVG graphics for exporting and scalable 2D output.
- **three-renderer**: Uses THREE.js to render DWG/DXF entities as interactive 2D/3D graphics with advanced visualization and custom shaders.
- **cad-viewer-example**: Example application demonstrating how to use the `cad-viewer` component in a real project.

## Subpackages

- [`packages/cad-viewer/`](packages/cad-viewer/): Main Vue 3 component, UI, and integration logic.
- [`packages/cad-simple-viewer/`](packages/cad-simple-viewer/): Core document management and command logic, UI-agnostic.
- [`packages/svg-renderer/`](packages/svg-renderer/): SVG-based rendering engine for CAD entities.
- [`packages/three-renderer/`](packages/three-renderer/): THREE.js-based rendering engine for 2D/3D CAD entities.
- [`packages/cad-viewer-example/`](packages/cad-viewer-example/): Example app showing usage and integration.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or suggestions.

## License

[MIT](LICENSE)

