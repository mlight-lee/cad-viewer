import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbDatabase } from '@mlightcad/data-model'
import { find } from 'lodash-es'
import { reactive } from 'vue'

export interface LayerInfo {
  name: string
  color: string
  isLocked: boolean
  isHidden: boolean
  isInUse: boolean
  isOn: boolean
  isPlottable: boolean
  transparency: number
  linetype: string
  lineWeight: number
}

export function useLayers(editor: AcApDocManager) {
  const reactiveLayers = reactive<LayerInfo[]>([])
  const doc = editor.curDocument

  const reset = (doc: AcDbDatabase) => {
    const layers = doc.tables.layerTable.newIterator()
    for (const layer of layers) {
      reactiveLayers.push({
        name: layer.name,
        color: layer.color.cssColor,
        isLocked: layer.isLocked,
        isHidden: layer.isHidden,
        isInUse: layer.isInUse,
        isOn: !layer.isOff,
        isPlottable: layer.isPlottable,
        transparency: layer.transparency,
        linetype: layer.linetype,
        lineWeight: layer.lineWeight
      })
    }
  }
  reset(doc.database)

  doc.database.events.layerModified.addEventListener(args => {
    let layer: LayerInfo | undefined = find(
      reactiveLayers.values,
      (layer: LayerInfo) => layer.name == args.layer.name
    )
    if (layer) {
      layer = layer as LayerInfo
      const changes = args.changes
      if (changes.color != null) layer.color = changes.color.cssColor
      if (changes.isLocoked != null) layer.isLocked = changes.isLocked
      if (changes.isHidden != null) layer.isHidden = changes.isHidden
      if (changes.isInUse != null) layer.isInUse = changes.isInUse
      if (changes.isOff != null) layer.isOn = !changes.isOff
      if (changes.isPlottable != null) layer.isPlottable = changes.isPlottable
      if (changes.transparency != null)
        layer.transparency = changes.transparency
      if (changes.linetype != null) layer.linetype = changes.linetype
      if (changes.lineWeight != null) layer.lineWeight = changes.lineWeight
    }
  })

  editor.events.documentActivated.addEventListener(args => {
    reactiveLayers.length = 0
    reset(args.doc.database)
  })

  return reactiveLayers
}
