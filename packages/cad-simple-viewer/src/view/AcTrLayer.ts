import { AcDbObjectId } from '@mlightcad/data-model'
import {
  AcTrBatchedGroup,
  AcTrBatchedGroupStats,
  AcTrEntity
} from '@mlightcad/three-renderer'
import * as THREE from 'three'

/**
 * Statistics for a CAD layer including name and batched rendering metrics.
 * 
 * Extends the standard batched group statistics with layer-specific information.
 */
export type AcTrLayerStats = AcTrBatchedGroupStats & {
  /** The name of the layer */
  name: string
}

/**
 * Represents a CAD layer for organizing and rendering entities in Three.js.
 * 
 * This class manages a collection of CAD entities that belong to the same logical layer.
 * It provides:
 * - Entity organization and grouping
 * - Layer visibility control
 * - Efficient batched rendering through Three.js groups
 * - Performance monitoring and statistics
 * 
 * ## Technical Notes
 * Unlike Three.js built-in layers (which only support 32 layers), this implementation
 * uses Three.js groups to represent AutoCAD layers, allowing unlimited layer support.
 * Each AutoCAD layer corresponds to one Three.js group containing all entities.
 * 
 * ## Performance Benefits
 * - Batched rendering reduces draw calls
 * - Efficient visibility toggling for entire layers
 * - Optimized entity grouping for better GPU performance
 * 
 * @example
 * ```typescript
 * // Create a new layer
 * const layer = new AcTrLayer('Dimensions');
 * 
 * // Add entities to the layer
 * const line = new AcTrLine(startPoint, endPoint);
 * layer.add(line);
 * 
 * // Control layer visibility
 * layer.visible = false; // Hide all entities in this layer
 * 
 * // Get layer statistics
 * const stats = layer.stats;
 * console.log(`Layer ${stats.name} has ${stats.entityCount} entities`);
 * ```
 */
export class AcTrLayer {
  /**
   * Layer name
   */
  private _name: string
  /**
   * This group contains all entities in this layer
   */
  private _group: AcTrBatchedGroup

  /**
   * Construct one instance of this class
   * @param name Input layer name
   */
  constructor(name: string) {
    this._group = new AcTrBatchedGroup()
    this._name = name
  }

  /**
   * Layer name
   */
  get name() {
    return this._name
  }
  set name(value: string) {
    this._name = value
  }

  get visible() {
    return this._group.visible
  }
  set visible(value: boolean) {
    this._group.visible = value
  }

  get internalObject() {
    return this._group
  }

  /**
   * The statistics of this layer
   */
  get stats() {
    const batchedGroupStats = this._group.stats
    return {
      name: this._name,
      ...batchedGroupStats
    } as AcTrLayerStats
  }

  /**
   * The number of entities stored in this layer
   */
  get entityCount() {
    return this._group.entityCount
  }

  /**
   * Re-render points with latest point style settings
   * @param displayMode Input display mode of points
   */
  rerenderPoints(displayMode: number) {
    this._group.rerenderPoints(displayMode)
  }

  /**
   * Return true if this layer contains the entity with the specified object id. Otherwise, return false.
   * @param objectId Input the object id of one entity
   * @returns Return true if this layer contains the entity with the specified object id. Otherwise,
   * return false.
   */
  hasEntity(objectId: AcDbObjectId) {
    return this._group.hasEntity(objectId)
  }

  /**
   * Add one AutoCAD entity into this layer.
   * @param entity Input AutoCAD entity to be added into this layer.
   */
  addEntity(entity: AcTrEntity) {
    this._group.addEntity(entity)
  }

  /**
   * Return true if the object with the specified object id is intersected with the ray by using raycast.
   * @param objectId  Input object id of object to check for intersection with the ray.
   * @param raycaster Input raycaster to check intersection
   */
  isIntersectWith(objectId: string, raycaster: THREE.Raycaster) {
    return this._group.isIntersectWith(objectId, raycaster)
  }

  /**
   * Remove the specified entity from this layer.
   * @param objectId Input the object id of the entity to remove
   * @returns Return true if remove the specified entity successfully. Otherwise, return false.
   */
  remove(_objectId: AcDbObjectId): boolean {
    // TODO: Finish it
    throw new Error('Not implemented yet!')
  }

  /**
   * Update the specified entity in this layer.
   * @param entity Input the entity to update
   * @returns Return true if update the specified entity successfully. Otherwise, return false.
   */
  update(entity: AcTrEntity): boolean {
    // TODO: Finish it
    this._group.add(entity)
    return true
  }

  /**
   * Hover the specified entities
   */
  hover(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      this._group.hover(id)
    })
  }

  /**
   * Unhover the specified entities
   */
  unhover(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      this._group.unhover(id)
    })
  }

  /**
   * Select the specified entities
   */
  select(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      this._group.select(id)
    })
  }

  /**
   * Unselect the specified entities
   */
  unselect(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      this._group.unselect(id)
    })
  }
}
