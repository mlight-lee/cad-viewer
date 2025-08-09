import { AcDbObjectId, AcGeBox2d, AcGeBox3d } from '@mlightcad/data-model'
import { AcTrEntity, AcTrObject } from '@mlightcad/three-renderer'
import * as THREE from 'three'

import { AcTrLayout, AcTrLayoutStats } from './AcTrLayout'

/**
 * Three.js scene manager for CAD drawings with hierarchical organization.
 * 
 * The scene manages the complete visual representation of a CAD drawing using
 * a hierarchical structure that mirrors CAD data organization:
 * 
 * ```
 * Scene
 * └── Layout (AcTrLayout) - Paper space or model space
 *     └── Layer (AcTrLayer) - Drawing layers for organization
 *         └── Entity (AcTrEntity) - Individual CAD entities (lines, arcs, etc.)
 * ```
 * 
 * ## Key Responsibilities
 * - **Layout Management**: Handles multiple layouts (model space and paper spaces)
 * - **Layer Organization**: Manages layer visibility and entity grouping
 * - **Entity Rendering**: Provides access to all renderable CAD entities
 * - **Spatial Queries**: Calculates bounding boxes and spatial relationships
 * - **Three.js Integration**: Maintains the underlying Three.js scene
 * 
 * The scene automatically manages the active layout and provides efficient
 * access to entities for rendering, selection, and spatial operations.
 * 
 * @example
 * ```typescript
 * const scene = new AcTrScene();
 * 
 * // Set up model space
 * scene.modelSpaceBtrId = modelSpaceId;
 * 
 * // Add entities to layers
 * const entity = new AcTrLine(...);
 * scene.addEntity(entity, layerName);
 * 
 * // Get all visible entities for rendering
 * const entities = scene.getAllEntities();
 * 
 * // Get scene bounds for zoom operations
 * const bounds = scene.box;
 * ```
 */
export class AcTrScene {
  /** The underlying Three.js scene object */
  private _scene: THREE.Scene
  /** Map of layout ID to layout object */
  private _layouts: Map<AcDbObjectId, AcTrLayout>
  /** ID of the currently active layout */
  private _activeLayoutBtrId: AcDbObjectId
  /** ID of the model space layout */
  private _modelSpaceBtrId: AcDbObjectId

  /**
   * Creates a new CAD scene instance.
   * 
   * Initializes the Three.js scene and layout management structures.
   */
  constructor() {
    this._scene = new THREE.Scene()
    this._layouts = new Map()
    this._activeLayoutBtrId = ''
    this._modelSpaceBtrId = ''
  }

  /**
   * The layouts in this scene
   */
  get layouts() {
    return this._layouts
  }

  /**
   * The bounding box of the visibile objects in this secene
   */
  get box() {
    return this.activeLayout?.box
  }

  /**
   * The scene object of THREE.js. This is internally used only. Try to avoid using it.
   */
  get internalScene() {
    return this._scene
  }

  /**
   * The block table record id of the model space
   */
  get modelSpaceBtrId() {
    return this._modelSpaceBtrId
  }
  set modelSpaceBtrId(value: AcDbObjectId) {
    this._modelSpaceBtrId = value
    if (!this._layouts.has(value)) {
      throw new Error(
        `[AcTrScene] No layout assiciated with the specified block table record id '${value}'!`
      )
    }
  }

  /**
   * The block table record id associated with the current active layout
   */
  get activeLayoutBtrId() {
    return this._activeLayoutBtrId
  }
  set activeLayoutBtrId(value: string) {
    this._activeLayoutBtrId = value
    this._layouts.forEach((layout, key) => {
      layout.visible = value == key
    })
  }

  /**
   * Get active layout
   */
  get activeLayout() {
    if (this._activeLayoutBtrId && this._layouts.has(this._activeLayoutBtrId)) {
      return this._layouts.get(this._activeLayoutBtrId)!
    }
    return undefined
  }

  /**
   * Get the layout of the model space
   */
  get modelSpaceLayout() {
    if (this._modelSpaceBtrId && this._layouts.has(this._modelSpaceBtrId)) {
      return this._layouts.get(this._modelSpaceBtrId)!
    }
    return undefined
  }

  /**
   * The statistics of this scene
   */
  get stats() {
    const layouts: AcTrLayoutStats[] = []
    this._layouts.forEach(layout => layouts.push(layout.stats))
    return {
      layouts
    }
  }

  /**
   * Add one empty layout with the specified block table record id as the its key
   * @param ownerId Input the block table record id associated with this layout
   * @returns Return the newly created empty layout
   */
  addEmptyLayout(ownerId: AcDbObjectId) {
    const layout = new AcTrLayout()
    this._layouts.set(ownerId, layout)
    this._scene.add(layout.internalObject)
    layout.visible = ownerId == this._activeLayoutBtrId
    return layout
  }

  /**
   * Clear scene
   * @returns Return this scene
   */
  clear() {
    this._layouts.forEach(layout => {
      this._scene.remove(layout.internalObject)
      layout.clear()
    })
    this._layouts.clear()
    this._scene.clear()
    return this
  }

  /**
   * Set layer's visibility
   * @param layerName Input layer name
   * @param visible Input visibility of the layer
   */
  setLayerVisibility(layerName: string, visible: boolean) {
    let isDirty = false
    this.activeLayout?.layers.forEach(layer => {
      if (layer.name === layerName) {
        layer.visible = visible
        isDirty = true
      }
    })
    return isDirty
  }

  /**
   * Hover the specified entities
   */
  hover(ids: AcDbObjectId[]) {
    const activeLayout = this.activeLayout
    if (activeLayout) {
      this.activeLayout.hover(ids)
      return true
    }
    return false
  }

  /**
   * Unhover the specified entities
   */
  unhover(ids: AcDbObjectId[]) {
    const activeLayout = this.activeLayout
    if (activeLayout) {
      this.activeLayout.unhover(ids)
      return true
    }
    return false
  }

  /**
   * Select the specified entities
   */
  select(ids: AcDbObjectId[]) {
    const activeLayout = this.activeLayout
    if (activeLayout) {
      this.activeLayout.select(ids)
      return true
    }
    return false
  }

  /**
   * Unselect the specified entities
   */
  unselect(ids: AcDbObjectId[]) {
    const activeLayout = this.activeLayout
    if (activeLayout) {
      this.activeLayout.unselect(ids)
      return true
    }
    return false
  }

  /**
   * Search entities intersected or contained in the specified bounding box.
   * @param box Input the query bounding box
   * @returns Return query results
   */
  search(box: AcGeBox2d | AcGeBox3d) {
    const activeLayout = this.activeLayout
    return activeLayout ? activeLayout?.search(box) : []
  }

  /**
   * Add one AutoCAD entity into this scene. If the layout associated with this entity doesn't exist,
   * then create one layout, add this layout into this scene, and add the entity into the layout.
   * @param entity Input AutoCAD entity to be added into scene.
   * @param extendBbox Input the flag whether to extend the bounding box of this scene by union the bounding box
   * of the specified entity.
   * @returns Return this scene
   */
  addEntity(entity: AcTrEntity, extendBbox: boolean = true) {
    const ownerId = entity.ownerId
    if (ownerId) {
      let layout = this._layouts.get(ownerId)
      if (!layout) {
        layout = this.addEmptyLayout(ownerId)
      }
      layout.addEntity(entity, extendBbox)
    } else {
      console.warn('[AcTrSecene] The owner id of one entity cannot be empty!')
    }

    return this
  }

  /**
   * Remove the specified entity from this scene.
   * @param objectId Input the object id of the entity to remove
   * @returns Return true if remove the specified entity successfully. Otherwise, return false.
   */
  remove(objectId: AcDbObjectId) {
    for (const [_, layout] of this._layouts) {
      if (layout.remove(objectId)) return true
    }
    return false
  }

  /**
   * Update the specified entity in this scene.
   * @param objectId Input the entity to update
   * @returns Return true if update the specified entity successfully. Otherwise, return false.
   */
  update(entity: AcTrEntity) {
    for (const [_, layout] of this._layouts) {
      if (layout.update(entity)) return true
    }
    return false
  }

  setSnapObject(object: AcTrObject) {
    this._layouts.forEach(layout => {
      layout.setSnapObject(object)
    })
    return this
  }
}
