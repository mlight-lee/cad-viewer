import {
  AcDbConversionStage,
  AcDbConversionStageStatus
} from '@mlightcad/data-model'
import mitt, { type Emitter } from 'mitt'

/**
 * Message type
 */
export type AcEdMessageType = 'success' | 'warning' | 'info' | 'error'

export type AcEdEvents = {
  'open-file': {}
  'open-file-progress': {
    percentage: number
    stage: AcDbConversionStage
    stageStatus: AcDbConversionStageStatus
  }
  message: { message: string; type: AcEdMessageType }
  'font-not-loaded': { fontName: string; url: string }
  'failed-to-get-avaiable-fonts': { url: string }
  'failed-to-open-file': { fileName: string }
  'font-not-found': { fontName: string; count: number }
}

export const eventBus: Emitter<AcEdEvents> = mitt<AcEdEvents>()
