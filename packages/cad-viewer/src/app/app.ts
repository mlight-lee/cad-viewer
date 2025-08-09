import 'element-plus/dist/index.css'
import '../style/style.css'
import '../style/index.scss'

import { AcApDocManager, AcEdCommandStack } from '@mlightcad/cad-simple-viewer'
import { markRaw } from 'vue'

import {
  AcApLayerStateCmd,
  AcApLogCmd,
  AcApMissedDataCmd,
  AcApPointStyleCmd
} from '../command'
import { MlPointStyleDlg, MlReplacementDlg } from '../component'
import { useDialogManager } from '../composable'

const { registerDialog } = useDialogManager()

const registerCmds = () => {
  AcEdCommandStack.instance.addCommand(
    AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
    'log',
    'log',
    new AcApLogCmd()
  )
  AcEdCommandStack.instance.addCommand(
    AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
    'la',
    'la',
    new AcApLayerStateCmd()
  )
  AcEdCommandStack.instance.addCommand(
    AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
    'md',
    'md',
    new AcApMissedDataCmd()
  )
  AcEdCommandStack.instance.addCommand(
    AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
    'pttype',
    'pttype',
    new AcApPointStyleCmd()
  )
}

const registerDialogs = () => {
  registerDialog({
    name: 'ReplacementDlg',
    component: markRaw(MlReplacementDlg),
    props: {}
  })
  registerDialog({
    name: 'PointStyleDlg',
    component: markRaw(MlPointStyleDlg),
    props: {}
  })
}

export const initializeCadViewer = (elementId: string) => {
  const canvas = document.getElementById(elementId) as HTMLCanvasElement
  AcApDocManager.createInstance(canvas)
  AcApDocManager.instance.loadDefaultFonts()
}

export const registerCommponents = () => {
  registerCmds()
  registerDialogs()
}
