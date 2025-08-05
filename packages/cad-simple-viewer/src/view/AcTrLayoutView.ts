import {
  AcTrBaseView,
  AcTrRenderer,
  AcTrViewportView
} from '@mlightcad/three-renderer'
import { AxesGizmo, ObjectPosition } from '@mlightcad/three-viewcube'
import * as THREE from 'three'

import { AcEdViewMode } from '../editor/view/AcEdBaseView'
import { AcTrScene } from './AcTrScene'

export interface AcDbEntityEventArgs {
  view: AcTrLayoutView
}

/**
 * Each layout has its own camera and camera control. This class represents view associated with one layout.
 */
export class AcTrLayoutView extends AcTrBaseView {
  private _layoutBtrId: string
  private _axesGizmo: AxesGizmo
  private _mode: AcEdViewMode
  private _viewportViews: Map<string, AcTrViewportView>

  /**
   * Construct one instance of this class
   * @param layoutBtrId Input the id of the block table record associated the layout
   * @param renderer Input renderer
   * @param width Input width of this view
   * @param height Input height of this view
   */
  constructor(
    renderer: AcTrRenderer,
    layoutBtrId: string,
    width: number,
    height: number
  ) {
    super(renderer, width, height)
    this._layoutBtrId = layoutBtrId
    this._mode = AcEdViewMode.SELECTION
    this._axesGizmo = this.createAxesGizmo()
    this._viewportViews = new Map()
  }

  get layoutBtrId() {
    return this._layoutBtrId
  }

  /**
   * The view mode of the current layout view
   */
  get mode() {
    return this._mode
  }
  set mode(value: AcEdViewMode) {
    if (value == AcEdViewMode.SELECTION) {
      this._cameraControls.mouseButtons = {
        MIDDLE: THREE.MOUSE.PAN
      }
    } else if (value == AcEdViewMode.PAN) {
      this._cameraControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN
      }
    }
    this._cameraControls.update()
    this._mode = value
  }

  /**
   * The number of viewports in this layout view
   */
  get viewportCount() {
    return this._viewportViews.size
  }

  /**
   * Add one viewport view instance to this layout view
   * @param viewportView Input one viewport instance
   */
  addViewport(viewportView: AcTrViewportView) {
    this._viewportViews.set(viewportView.viewport.id, viewportView)
  }

  /**
   * Remove the specified viewport view by its id from this layout view
   * @param id Input the id of one viewport instance
   */
  removeViewport(id: string) {
    this._viewportViews.delete(id)
  }

  /**
   * Resize this layout view
   * @param width Input new width of the layout view
   * @param height Input new height of the layout view
   */
  resize(width: number, height: number) {
    this._height = height
    this._width = width
    this.updateCameraFrustum()
    this._viewportViews.forEach(viewportView => {
      viewportView.update()
    })
  }

  render(scene: AcTrScene) {
    this._renderer.clear()
    this._renderer.render(scene.internalScene, this._camera)
    const modelSpaceLayout = scene.modelSpaceLayout
    if (modelSpaceLayout) {
      this.drawViewports(modelSpaceLayout.internalObject)
    }
    this._axesGizmo?.update()
  }

  private createAxesGizmo() {
    const axesGizmo = new AxesGizmo(
      this._camera.internalCamera,
      this._renderer.internalRenderer,
      {
        hasZAxis: false,
        pos: ObjectPosition.LEFT_BOTTOM
      }
    )
    return axesGizmo
  }

  /**
   * Draw viewports
   * @param scene Input the scene to draw
   */
  private drawViewports(scene: THREE.Object3D) {
    if (this._viewportViews.size > 0) {
      // Store autoClear flag value
      const autoClear = this._renderer.autoClear
      this._renderer.autoClear = false

      const oldViewport = new THREE.Vector4()
      this._renderer.getViewport(oldViewport)
      this._renderer.clearDepth()

      const visibility = scene.visible
      scene.visible = true
      this._viewportViews.forEach(viewportView => {
        viewportView.render(scene)
      })
      scene.visible = visibility

      this._renderer.setViewport(
        oldViewport.x,
        oldViewport.y,
        oldViewport.z,
        oldViewport.w
      )

      // Restore autoClear flag vlaue
      this._renderer.autoClear = autoClear
    }
  }
}
