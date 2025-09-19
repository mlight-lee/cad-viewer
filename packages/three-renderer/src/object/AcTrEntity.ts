import { AcGeMatrix3d, AcGiEntity } from '@mlightcad/data-model'
import * as THREE from 'three'

import { AcTrStyleManager } from '../style/AcTrStyleManager'
import { AcTrMaterialUtil } from '../util/AcTrMaterialUtil'
import { AcTrObject } from './AcTrObject'

/**
 * Represent the display object of one drawing entity.
 */
export class AcTrEntity extends AcTrObject implements AcGiEntity {
  private _ownerId: string
  private _objectId: string
  private _layerName: string
  protected _box: THREE.Box3

  constructor(styleManager: AcTrStyleManager) {
    super(styleManager)
    this._objectId = ''
    this._ownerId = ''
    this._layerName = ''
    this._box = new THREE.Box3()
  }

  /**
   * The bounding box without considering transformation matrix applied on this object.
   * If you want to get bounding box with transformation matrix, please call `applyMatrix4`
   * for this box.
   */
  get box() {
    return this._box
  }
  set box(box: THREE.Box3) {
    this._box.copy(box)
  }

  /**
   * @inheritdoc
   */
  get objectId() {
    return this._objectId
  }
  set objectId(value: string) {
    this._objectId = value
  }

  /**
   * @inheritdoc
   */
  get ownerId() {
    return this._ownerId
  }
  set ownerId(value: string) {
    this._ownerId = value
  }

  /**
   * @inheritdoc
   */
  get layerName() {
    return this._layerName
  }
  set layerName(value: string) {
    this._layerName = value
  }

  async draw() {
    // Do nothing for now
  }

  /**
   * @inheritdoc
   */
  applyMatrix(matrix: AcGeMatrix3d) {
    const elements = matrix.elements
    const threeMatrix = new THREE.Matrix4(
      elements[0],
      elements[4],
      elements[8],
      elements[12],
      elements[1],
      elements[5],
      elements[9],
      elements[13],
      elements[2],
      elements[6],
      elements[10],
      elements[14],
      elements[3],
      elements[7],
      elements[11],
      elements[15]
    )
    this.applyMatrix4(threeMatrix)
    this.updateMatrixWorld(true)
    this._box.applyMatrix4(threeMatrix)
  }

  /**
   * @inheritdoc
   */
  highlight() {
    this.highlightObject(this)
  }

  /**
   * Highlight the specified object.
   */
  protected highlightObject(object: THREE.Object3D) {
    if ('material' in object) {
      const material = object.material as THREE.Material | THREE.Material[]
      // If 'originalMaterial' isn't null, this object is already highlighted
      if (object.userData.originalMaterial == null) {
        const clonedMaterial = AcTrMaterialUtil.cloneMaterial(material)
        AcTrMaterialUtil.setMaterialColor(clonedMaterial)
        object.userData.originalMaterial = object.material
        object.material = clonedMaterial
      }
    } else if (object.children.length > 0) {
      object.children.forEach(child => {
        this.highlightObject(child)
      })
    }
  }

  /**
   * @inheritdoc
   */
  unhighlight() {
    this.unhighlightObject(this)
  }

  /**
   * @inheritdoc
   */
  fastDeepClone() {
    const cloned = new AcTrEntity(this.styleManager)
    cloned.copy(this, false)
    this.copyGeometry(this, cloned)
    return cloned
  }

  /**
   * @inheritdoc
   */
  copy(object: AcTrEntity, recursive?: boolean) {
    this.objectId = object.objectId
    this.ownerId = object.ownerId
    this.layerName = object.layerName
    this.box = object.box
    return super.copy(object, recursive)
  }

  /**
   * Clone geometries in the source's direct children and copy them to the target
   * @param source Input the source entity
   * @param target Input the target entity
   */
  protected copyGeometry(source: AcTrEntity, target: AcTrEntity) {
    for (let i = 0; i < source.children.length; i++) {
      const child = source.children[i]
      const clonedChild = child.clone(false)
      if ('geometry' in clonedChild) {
        clonedChild.geometry = (
          clonedChild.geometry as THREE.BufferGeometry
        ).clone()
      }
      target.add(clonedChild)
    }
  }

  /**
   * Unhighlight the specified object
   */
  protected unhighlightObject(object: THREE.Object3D) {
    if ('material' in object) {
      const material = object.material as THREE.Material | THREE.Material[]
      object.material = object.userData.originalMaterial
      delete object.userData.originalMaterial

      // clean up
      if (Array.isArray(material)) {
        material.forEach(m => m.dispose())
      } else if (material instanceof THREE.Material) {
        material.dispose()
      }
    } else if (object.children.length > 0) {
      object.children.forEach(child => {
        this.unhighlightObject(child)
      })
    }
  }

  protected createColorArray(color: number, length: number) {
    const red = ((color >> 16) & 255) / 256
    const green = ((color >> 8) & 255) / 256
    const blue = (color & 255) / 256

    const colors = new Float32Array(length * 3)
    for (let i = 0, pos = 0; i < length; i++) {
      colors[pos] = red
      colors[pos + 1] = green
      colors[pos + 2] = blue
      pos += 3
    }
    return colors
  }
}
