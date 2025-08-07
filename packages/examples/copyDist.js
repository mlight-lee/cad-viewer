#!/usr/bin/env node
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const rootDir = path.dirname(__filename)
const cadViewerExampleDist = path.resolve(rootDir, '../cad-viewer-example/dist')
const cadViewer = path.resolve(rootDir, './public/cad-viewer/')
const cadSimpleViewerExampleDist = path.resolve(
  rootDir,
  '../cad-simple-viewer-example/dist'
)
const cadSimpleViewer = path.resolve(rootDir, './public/cad-simple-viewer/')

export async function copyDist() {
  await fs.ensureDir(cadViewer)
  await fs.ensureDir(cadSimpleViewer)
  await fs.copy(cadViewerExampleDist, cadViewer, { overwrite: true })
  await fs.copy(cadSimpleViewerExampleDist, cadSimpleViewer, {
    overwrite: true
  })
}

// if (import.meta.url === `file://${process.argv[1]}`) {
//   copyDist();
// }
copyDist()
