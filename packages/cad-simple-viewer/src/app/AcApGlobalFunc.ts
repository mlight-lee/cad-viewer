import {
  AcDbDatabaseConverterManager,
  AcDbDxfConverter,
  AcDbFileType
} from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'

/**
 * Registers file format converters for CAD file processing.
 *
 * This function initializes and registers both DXF and DWG converters with the
 * global database converter manager. Each converter is configured to use web workers
 * for improved performance during file parsing operations.
 *
 * The function handles registration errors gracefully by logging them to the console
 * without throwing exceptions, ensuring that the application can continue to function
 * even if one or more converters fail to register.
 *
 * @async
 * @function registerConverters
 * @returns {Promise<void>} A promise that resolves when all converters have been
 *                          registered (or failed to register)
 *
 * @example
 * ```typescript
 * // Register all available converters
 * await registerConverters();
 * ```
 */
export async function registerConverters() {
  // Register DXF converter
  try {
    const converter = new AcDbDxfConverter({
      useWorker: true,
      parserWorkerUrl: './assets/dxf-parser-worker.js'
    })
    AcDbDatabaseConverterManager.instance.register(AcDbFileType.DXF, converter)
  } catch (error) {
    console.error('Failed to register dxf converter: ', error)
  }

  // Register DWG converter
  try {
    const converter = new AcDbLibreDwgConverter({
      useWorker: true,
      parserWorkerUrl: './assets/libredwg-parser-worker.js'
    })
    AcDbDatabaseConverterManager.instance.register(AcDbFileType.DWG, converter)
  } catch (error) {
    console.error('Failed to register dwg converter: ', error)
  }
}
