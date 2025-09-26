import * as THREE from 'three'

import { AcTrStyleManager } from '../style/AcTrStyleManager'

/**
 * Base class for all drawable object
 */
export class AcTrObject extends THREE.Object3D {
  private _styleManager: AcTrStyleManager

  constructor(styleManager: AcTrStyleManager) {
    super()
    this._styleManager = styleManager
  }

  get styleManager() {
    return this._styleManager
  }

  /**
   * @inheritdoc
   */
  copy(object: AcTrObject, recursive?: boolean) {
    this._styleManager = object._styleManager
    return super.copy(object, recursive)
  }
}
