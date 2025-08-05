import { AcDbObjectId, AcGeBox2d, AcGeBox3d } from '@mlightcad/data-model'
import { AcTrEntity, AcTrObject } from '@mlightcad/three-renderer'
import RBush from 'rbush'
import * as THREE from 'three'

import { AcEdSpatialQueryResultItem } from '../editor'
import { AcTrLayer, AcTrLayerStats } from './AcTrLayer'

export interface AcTrLayoutStats {
  layers: AcTrLayerStats[]
  summary: {
    entityCount: number
    totalSize: {
      line: number
      mesh: number
      point: number
      geometry: number
      mapping: number
    }
  }
}

/**
 * This class represents objects contained in one AuotCAD layout (model space or paper space).
 */
export class AcTrLayout {
  // The group that contains all entities in this layout
  private _group: THREE.Group
  private _indexTree: RBush<AcEdSpatialQueryResultItem>
  private _box: THREE.Box3
  private _layers: Map<string, AcTrLayer>
  private _snapPointsObject?: AcTrObject

  constructor() {
    this._group = new THREE.Group()
    this._indexTree = new RBush()
    this._box = new THREE.Box3()
    this._layers = new Map()
  }

  /**
   * The internal THREE.js object to use by scene. This is internally used only. Try to avoid using it.
   * @internal
   */
  get internalObject() {
    return this._group
  }

  get layers() {
    return this._layers
  }

  get box() {
    return this._box
  }

  /**
   * The visibility of this layout
   */
  get visible() {
    return this._group.visible
  }
  set visible(value: boolean) {
    this._group.visible = value
  }

  /**
   * The number of entities stored in this layer
   */
  get entityCount() {
    let count = 0
    this._layers.forEach(layer => (count += layer.entityCount))
    return count
  }

  /**
   * The statistics of this layout
   */
  get stats() {
    const layers: AcTrLayerStats[] = []
    let totalGeometrySize = 0
    let totalMappingSize = 0
    let lineTotalSize = 0
    let meshTotalSize = 0
    let pointTotalSize = 0
    this._layers.forEach(layer => {
      const stats = layer.stats
      layers.push(stats)
      lineTotalSize +=
        stats.line.indexed.geometrySize + stats.line.nonIndexed.geometrySize
      meshTotalSize +=
        stats.mesh.indexed.geometrySize + stats.mesh.nonIndexed.geometrySize
      pointTotalSize +=
        stats.point.indexed.geometrySize + stats.point.nonIndexed.geometrySize
      totalGeometrySize += stats.summary.totalGeometrySize
      totalMappingSize += stats.summary.totalMappingSize
    })
    return {
      layers,
      summary: {
        entityCount: this.entityCount,
        totalSize: {
          line: lineTotalSize,
          mesh: meshTotalSize,
          point: pointTotalSize,
          geometry: totalGeometrySize,
          mapping: totalMappingSize
        }
      }
    } as AcTrLayoutStats
  }

  clear() {
    this._layers.forEach(layer => {
      this._group.remove(layer.internalObject)
    })
    this._layers.clear()
    this._box.makeEmpty()
    this._indexTree.clear()
    return this
  }

  /**
   * Re-render points with latest point style settings
   * @param displayMode Input display mode of points
   */
  rerenderPoints(displayMode: number) {
    this._layers.forEach(layer => {
      layer.rerenderPoints(displayMode)
    })
  }

  /**
   * Return true if the object with the specified object id is intersected with the ray by using raycast.
   * @param objectId  Input object id of object to check for intersection with the ray.
   * @param raycaster Input raycaster to check intersection
   */
  isIntersectWith(objectId: string, raycaster: THREE.Raycaster) {
    const layer = this.getLayerByObjectId(objectId)
    return layer && layer.isIntersectWith(objectId, raycaster)
  }

  /**
   * Add one AutoCAD entity into this layout. If layer group referenced by the entity doesn't exist, create one
   * layer group and add this entity this group.
   * @param entity Input AutoCAD entity to be added into this layout.
   * @param extendBbox Input the flag whether to extend the bounding box of the scene by union the bounding box
   * of the specified entity.
   */
  addEntity(entity: AcTrEntity, extendBbox: boolean = true) {
    if (!entity.objectId) {
      throw new Error('[AcTrEntity] Object id is required to add one entity!')
    }
    if (!entity.layerName) {
      throw new Error('[AcTrEntity] Layer name is required to add one entity!')
    }

    const layer = this.getLayer(entity.layerName, true)
    if (layer) {
      layer.addEntity(entity)

      const box = entity.box
      // For infinitive line such as ray and xline
      if (extendBbox) this._box.union(box)

      this._indexTree.insert({
        minX: box.min.x,
        minY: box.min.y,
        maxX: box.max.x,
        maxY: box.max.y,
        id: entity.objectId
      })
    }
    return this
  }

  /**
   * Remove the specified entity from this layout.
   * @param objectId Input the object id of the entity to remove
   * @returns Return true if remove the specified entity successfully. Otherwise, return false.
   */
  remove(objectId: AcDbObjectId) {
    for (const [_, layer] of this._layers) {
      if (layer.remove(objectId)) return true
    }
    return false
  }

  /**
   * Update the specified entity in this layout.
   * @param objectId Input the entity to update
   * @returns Return true if update the specified entity successfully. Otherwise, return false.
   */
  update(entity: AcTrEntity) {
    for (const [_, layer] of this._layers) {
      if (layer.update(entity)) return true
    }
    return false
  }

  /**
   * Hover the specified entities
   */
  hover(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      const layer = this.getLayerByObjectId(id)
      if (layer) {
        layer.hover([id])
      }
    })
  }

  /**
   * Unhover the specified entities
   */
  unhover(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      const layer = this.getLayerByObjectId(id)
      if (layer) {
        layer.unhover([id])
      }
    })
  }

  /**
   * Select the specified entities
   */
  select(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      const layer = this.getLayerByObjectId(id)
      if (layer) {
        layer.select([id])
      }
    })
  }

  /**
   * Unselect the specified entities
   */
  unselect(ids: AcDbObjectId[]) {
    ids.forEach(id => {
      const layer = this.getLayerByObjectId(id)
      if (layer) {
        layer.unselect([id])
      }
    })
  }

  setSnapObject(object: AcTrObject) {
    if (this._snapPointsObject) {
      this._group.remove(this._snapPointsObject)
    }
    this._snapPointsObject = object
    this._group.add(object)
  }

  /**
   * Search entities intersected or contained in the specified bounding box.
   * @param box Input the query bounding box
   * @returns Return query results
   */
  search(box: AcGeBox2d | AcGeBox3d) {
    const results = this._indexTree.search({
      minX: box.min.x,
      minY: box.min.y,
      maxX: box.max.x,
      maxY: box.max.y
    })
    return results
  }

  private getLayerByObjectId(objectId: AcDbObjectId) {
    for (const [_, layer] of this._layers) {
      if (layer.hasEntity(objectId)) return layer
    }
    return undefined
  }

  /**
   * Get layer group by name. If the layer doesn't exist, create one layer group into this layout.
   * @param name Input layer name
   * @param createIfNotExist Input one flag to indicate whether to create layer group if it doesn't exist in
   * this layout.
   * @returns Return matched layer
   */
  private getLayer(name: string, createIfNotExist: boolean = true) {
    let layer = this._layers.get(name)
    if (layer === undefined && createIfNotExist) {
      layer = new AcTrLayer(name)
      this._layers.set(name, layer)
      this._group.add(layer.internalObject)
    }
    return layer
  }
}
