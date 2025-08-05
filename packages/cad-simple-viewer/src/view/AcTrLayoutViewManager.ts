import { AcTrLayoutView } from './AcTrLayoutView'
import { AcTrScene } from './AcTrScene'

export class AcTrLayoutViewManager {
  private _activeLayoutBtrId: string
  private _layoutViews: Map<string, AcTrLayoutView>

  constructor() {
    this._activeLayoutBtrId = ''
    this._layoutViews = new Map()
  }

  /**
   * The block table record id associated with the active layout
   */
  get activeLayoutBtrId() {
    return this._activeLayoutBtrId
  }
  set activeLayoutBtrId(value: string) {
    this._activeLayoutBtrId = value
    this._layoutViews.forEach(layoutView => {
      layoutView.enabled = layoutView.layoutBtrId == value
    })
  }

  /**
   * The active layout view.
   */
  get activeLayoutView() {
    return this._layoutViews.get(this._activeLayoutBtrId)
  }

  /**
   * Return true if the layout view manager contains one layout view associated with the sepcified block
   * table record id. Otherwise it returns false.
   * @param name Input the block table record id associated with the layout view
   * @returns Return true if the layout view manager contains one layout view associated with the sepcified
   * block table record id. Otherwise it returns false.
   */
  has(layoutBtrId: string) {
    return this._layoutViews.has(layoutBtrId)
  }

  /**
   * Get the layout view by the block table record id associated with the layout
   * @param layoutBtrId Input the id of the block table record associated the layout
   * @returns Return the layout view by the block table record id associated with the layout
   */
  getAt(layoutBtrId: string) {
    return this._layoutViews.get(layoutBtrId)
  }

  /**
   * Resize all of layout views managed by layout view manager
   * @param width Input new width of the layout view
   * @param height Input new height of the layout view
   */
  resize(width: number, height: number) {
    this._layoutViews.forEach(layoutView => {
      layoutView.resize(width, height)
    })
  }

  add(layoutView: AcTrLayoutView) {
    this._layoutViews.set(layoutView.layoutBtrId, layoutView)
  }

  /**
   * Render the specified scene in the current layout view
   * @param scene Input the scene to render
   */
  render(scene: AcTrScene) {
    this.activeLayoutView?.render(scene)
  }
}
