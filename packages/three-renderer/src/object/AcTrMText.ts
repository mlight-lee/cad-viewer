import { AcGiMTextData, AcGiTextStyle } from '@mlightcad/data-model'
import { MTextObject } from '@mlightcad/mtext-renderer'
import * as THREE from 'three'

import { AcTrMTextRenderer } from '../renderer'
import { AcTrStyleManager } from '../style/AcTrStyleManager'
import { AcTrEntity } from './AcTrEntity'

export class AcTrMText extends AcTrEntity {
  private _mtext?: MTextObject
  private _text: AcGiMTextData
  private _style: AcGiTextStyle

  constructor(
    text: AcGiMTextData,
    style: AcGiTextStyle,
    styleManager: AcTrStyleManager
  ) {
    super(styleManager)
    this._text = text
    this._style = style
  }

  async draw() {
    const mtextRenderer = AcTrMTextRenderer.getInstance()
    if (!mtextRenderer) return

    try {
      const style = this._style

      // @ts-expect-error AcGiTextData and MTextData are compatible
      this._mtext = await mtextRenderer.renderMText(this._text, style, {
        byLayerColor: style.byLayerColor,
        byBlockColor: style.byBlockColor
      })
      if (this._mtext) {
        this.add(this._mtext)
        this.flatten()
        this.traverse(object => {
          // Add the flag to check intersection using bounding box of the mesh
          object.userData.bboxIntersectionCheck = true
        })
      }
    } catch (error) {
      console.log(
        `Failed to render mtext '${this._text.text}' with the following error:\n`,
        error
      )
    }
  }

  /**
   * Get intersections between a casted ray and this object. Override this method
   * to calculate intersection using the bounding box of texts.
   */
  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
    this._mtext?.raycast(raycaster, intersects)
  }

  protected getTextEncoding(style: AcGiTextStyle) {
    const bigFontFile = style?.bigFont
    if (!bigFontFile) {
      return 'utf8'
    }
    if (style.bigFont.toUpperCase().startsWith('GB')) {
      return 'gbk'
    } else {
      //TODO:
      return 'utf8'
    }
  }
}
