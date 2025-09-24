import 'element-plus/dist/index.css'
import '../style/style.css'
import '../style/index.scss'

import { AcApDocManager, registerWorkers } from '@mlightcad/cad-simple-viewer'

import { registerCmds } from './register'

export const initializeCadViewer = (canvas: HTMLCanvasElement) => {
  AcApDocManager.createInstance(canvas)
  registerWorkers()
  registerCmds()
  AcApDocManager.instance.loadDefaultFonts()
}
