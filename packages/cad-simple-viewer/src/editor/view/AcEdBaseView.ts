import {
  AcCmEventManager,
  AcDbEntity,
  AcDbObjectId,
  AcGeBox2d,
  AcGeBox3d,
  AcGePoint2d,
  AcGePoint2dLike
} from '@mlightcad/data-model'

import { AcEdCorsorType, AcEdSelectionSet } from '../input'
import { AcEditor } from '../input/AcEditor'

/**
 * Item returned by spatial query
 */
export interface AcEdSpatialQueryResultItem {
  minX: number
  minY: number
  maxX: number
  maxY: number
  id: AcDbObjectId
}

/**
 * Interface to define arguments of mouse event events.
 */
export interface AcEdMouseEventArgs {
  /**
   * X coordinate value of current mouse in the world coordinate system
   */
  x: number
  /**
   * Y coordinate value of current mouse in the world coordinate system
   */
  y: number
}

/**
 * Interface to define arguments of view resized events.
 */
export interface AcEdViewResizedEventArgs {
  /**
   * New width of the resized view.
   */
  width: number
  /**
   * New height of the resized view.
   */
  height: number
}

/**
 * Interface to define arguments of hover events.
 */
export interface AcEdViewHoverEventArgs {
  /**
   * X coordinate value of current mouse in the screen coordinate system
   */
  x: number
  /**
   * Y coordinate value of current mouse in the screen coordinate system
   */
  y: number
  /**
   * Object id of the hovered entity
   */
  id: AcDbObjectId
}

/**
 * View mode
 */
export enum AcEdViewMode {
  /**
   * Click to select
   */
  SELECTION = 0,
  /**
   * Click to move
   */
  PAN = 1
}

/**
 * Represents missed data when rendering entities in the drawing
 */
export interface AcEdMissedData {
  fonts: Record<string, number>
  images: Map<string, string>
}

/**
 * Type of callback function used to calculate size of canvas when window resized
 */
export type AcEdCalculateSizeCallback = () => { width: number; height: number }

export abstract class AcEdBaseView {
  private _width: number
  private _height: number
  private _calculateSizeCallback?: AcEdCalculateSizeCallback
  private _bbox: AcGeBox3d
  private _curPos: AcGePoint2d
  private _curScreenPos: AcGePoint2d
  private _selectionSet: AcEdSelectionSet
  private _editor: AcEditor
  private _selectionBoxSize: number

  // Private propertie for hover/unhover handler
  private _hoverTimer: NodeJS.Timeout | null
  private _pauseTimer: NodeJS.Timeout | null
  private _hoveredObjectId: AcDbObjectId | null

  protected _canvas: HTMLCanvasElement

  public readonly events = {
    mouseMove: new AcCmEventManager<AcEdMouseEventArgs>(),
    viewResize: new AcCmEventManager<AcEdViewResizedEventArgs>(),
    hover: new AcCmEventManager<AcEdViewHoverEventArgs>(),
    unhover: new AcCmEventManager<AcEdViewHoverEventArgs>()
  }

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    const rect = canvas.getBoundingClientRect()
    this._bbox = new AcGeBox3d()
    this._width = rect.width
    this._height = rect.height
    this._curPos = new AcGePoint2d()
    this._curScreenPos = new AcGePoint2d()
    this._selectionSet = new AcEdSelectionSet()
    this._editor = new AcEditor(this)
    this._canvas.addEventListener('mousemove', event => this.onMouseMove(event))
    this._canvas.addEventListener('mousedown', event => {
      if (event.button === 1) {
        // Middle mouse button (button === 1)
        this._editor.setCursor(AcEdCorsorType.Grab)
      }
    })
    this._canvas.addEventListener('mouseup', event => {
      if (event.button === 1) {
        // Middle mouse button (button === 1)
        this._editor.restoreCursor()
      }
    })
    window.addEventListener('resize', this.onWindowResize.bind(this))
    this._selectionBoxSize = 4

    // Initialize hover/unhover handler
    this._hoverTimer = null
    this._pauseTimer = null
    this._hoveredObjectId = null
  }

  /**
   * The input manager
   */
  get editor() {
    return this._editor
  }

  /**
   * The size of selection box in pixel unit
   */
  get selectionBoxSize() {
    return this._selectionBoxSize
  }
  set selectionBoxSize(value: number) {
    this._selectionBoxSize = value
  }

  /**
   * The missed data such as fonts, images, and xrefs.
   */
  abstract get missedData(): AcEdMissedData

  /**
   * The view mode of the current view
   */
  abstract get mode(): AcEdViewMode
  abstract set mode(value: AcEdViewMode)

  /**
   * The center point of the current view
   */
  abstract get center(): AcGePoint2d
  abstract set center(value: AcGePoint2d)

  /**
   * Convert point cooridinate from the client window coordinate system to the world coordinate system.
   * The origin of the client window coordinate system is the left-top corner of the client window.
   * @param point Input point to convert
   * @returns Return point coordinate in the world coordinate system
   */
  abstract cwcs2Wcs(point: AcGePoint2dLike): AcGePoint2d
  /**
   * Convert point cooridinate from the world coordinate system to the client window coordinate system.
   * The origin of the client window coordinate system is the left-top corner of the client window.
   * @param point Input point to convert
   * @returns Return point coordinate in the client window coordinate system
   */
  abstract wcs2Cwcs(point: AcGePoint2dLike): AcGePoint2d

  abstract zoomTo(box: AcGeBox2d, margin: number): void
  abstract zoomToFit(): void

  /**
   * Search entities intersected or contained in the specified bounding box.
   * @param box Input the query bounding box
   * @returns Return query results
   */
  abstract search(box: AcGeBox2d | AcGeBox3d): AcEdSpatialQueryResultItem[]

  /**
   * Pick entities intersected with the specified point in the world coordinate
   * system.
   * @param point Input the point to pick objects. If not provided, the position
   * of current cursor is used.
   * @returns Return ids of entities intersected with the specified point
   */
  abstract pick(point?: AcGePoint2dLike): AcDbObjectId[]

  /**
   * Select entities intersected with the specified bounding box in the world
   * coordinate system, add them to the current selection set, and highlight
   * them.
   * @param box Input one bounding box in the world coordinate system.
   */
  abstract selectByBox(box: AcGeBox2d): void

  /**
   * Select entities intersected with the specified point in the world coordinate
   * system, add them to the current selection set, and highlight them.
   * @param box Input one point in the world coordinate system.
   */
  abstract select(point?: AcGePoint2dLike): void

  /**
   * Clear the scene
   */
  abstract clear(): void

  /**
   * Add the specified entity in drawing database into the current scene and draw it
   * @param entity Input the entity to add into the current scene
   */
  abstract addEntity(entity: AcDbEntity): void

  /**
   * Update the specified entity
   * @param entity Input the entity to update
   */
  abstract updateEntity(entity: AcDbEntity): void

  /**
   * Select the specified entities
   */
  abstract highlight(ids: AcDbObjectId[]): void
  /**
   * Unhighlight the specified entities
   */
  abstract unhighlight(ids: AcDbObjectId[]): void

  /**
   * Set layer's visibility
   * @param layerName Input layer name
   * @param visible Input visibility of the layer
   */
  abstract setLayerVisibility(layerName: string, visible: boolean): void

  /**
   * Called when hovering the specified entity
   */
  protected abstract onHover(id: AcDbObjectId): void

  /**
   * Called when unhovering the specified entity
   */
  protected abstract onUnhover(id: AcDbObjectId): void

  /**
   * Set cursor type of this view
   * @param cursorType Input cursor type
   */
  setCursor(cursorType: AcEdCorsorType) {
    this._editor.setCursor(cursorType)
  }

  /**
   * Set callback function used to calculate size of canvas when window resized
   * @param value Input callback function
   */
  setCalculateSizeCallback(value: AcEdCalculateSizeCallback) {
    this._calculateSizeCallback = value
  }

  /**
   * Width of canvas (not width of window) in pixel
   */
  get width() {
    return this._width
  }
  set width(value: number) {
    this._width = value
  }

  /**
   * Height of canvas (not height of window) in pixel
   */
  get height() {
    return this._height
  }
  set height(value: number) {
    this._height = value
  }

  /**
   * The bounding box to include all entities in this viewer
   */
  get bbox() {
    return this._bbox
  }

  /**
   * The canvas HTML element used by this view
   */
  get canvas() {
    return this._canvas
  }

  get aspect() {
    return this._width / this._height
  }

  /**
   * Postion of current mouse in world coordinate system
   */
  get curPos() {
    return this._curPos
  }

  /**
   * Postion of current mouse in screen coordinate system
   */
  get curScreenPos() {
    return this._curScreenPos
  }

  /**
   * The selection set in current view.
   */
  get selectionSet() {
    return this._selectionSet
  }

  protected onWindowResize() {
    if (this._calculateSizeCallback) {
      const { width, height } = this._calculateSizeCallback()
      this._width = width
      this._height = height
    } else {
      this._width = this._canvas.clientWidth
      this._height = this._canvas.clientHeight
    }
    this.events.viewResize.dispatch({
      width: this._width,
      height: this._height
    })
  }

  /**
   * Mouse move event handler.
   * @param event Input mouse event argument
   */
  private onMouseMove(event: MouseEvent) {
    this._curScreenPos = new AcGePoint2d(event.clientX, event.clientY)
    const wcsPos = this.cwcs2Wcs(this._curScreenPos)
    this._curPos.copy(wcsPos)
    this.events.mouseMove.dispatch({ x: wcsPos.x, y: wcsPos.y })

    // Hover handler
    if (this.mode == AcEdViewMode.SELECTION) {
      this.startHoverTimer(wcsPos.x, wcsPos.y)
    }
  }

  private setHoveredObjectId(newId: string | null) {
    if (this._hoveredObjectId) {
      this.events.unhover.dispatch({
        id: this._hoveredObjectId,
        x: this.curScreenPos.x,
        y: this.curScreenPos.y
      })
      this.onUnhover(this._hoveredObjectId)
    }
    this._hoveredObjectId = newId
    if (newId) {
      this.startPauseTimer(newId)
      this.onHover(newId)
    }
  }

  private hoverAt(x: number, y: number) {
    const results = this.pick({ x, y })
    if (results.length > 0) {
      this.setHoveredObjectId(results[0])
    } else {
      this.setHoveredObjectId(null)
      this.clearPauseTimer()
    }
  }

  private clearHoverTimer() {
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer)
    }
  }

  private clearPauseTimer() {
    if (this._pauseTimer) {
      clearTimeout(this._pauseTimer)
    }
  }

  private startHoverTimer(x: number, y: number) {
    this.clearHoverTimer()
    this._hoverTimer = setTimeout(() => {
      this.hoverAt(x, y)
    }, 50)
  }

  private startPauseTimer(id: AcDbObjectId) {
    this._pauseTimer = setTimeout(() => {
      this.events.hover.dispatch({
        id: id,
        x: this.curScreenPos.x,
        y: this.curScreenPos.y
      })
    }, 500)
  }
}
