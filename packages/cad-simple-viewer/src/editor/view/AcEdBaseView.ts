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
 * Enumeration of view interaction modes.
 * 
 * The view mode determines how the view responds to user mouse interactions:
 * - In SELECTION mode, clicks select entities
 * - In PAN mode, clicks and drags pan the view
 * 
 * @example
 * ```typescript
 * // Set to selection mode for entity picking
 * view.mode = AcEdViewMode.SELECTION;
 * 
 * // Set to pan mode for view navigation  
 * view.mode = AcEdViewMode.PAN;
 * ```
 */
export enum AcEdViewMode {
  /**
   * Selection mode - mouse clicks select entities.
   * 
   * In this mode:
   * - Single clicks select individual entities
   * - Drag operations can create selection boxes
   * - Selected entities are highlighted with grip points
   */
  SELECTION = 0,
  /**
   * Pan mode - mouse interactions pan the view.
   * 
   * In this mode:
   * - Click and drag operations move the view
   * - The cursor typically changes to indicate pan mode
   * - Entity selection is disabled
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

/**
 * Abstract base class for all CAD view implementations.
 * 
 * This class provides the foundation for rendering and interacting with CAD drawings.
 * It manages:
 * - Canvas and viewport dimensions
 * - Mouse event handling and coordinate conversion
 * - Entity selection and highlighting
 * - View modes (selection, pan, etc.)
 * - Spatial queries for entity picking
 * - Hover/unhover detection with timing
 * 
 * Concrete implementations must provide specific rendering logic and coordinate
 * transformations appropriate for their rendering technology (e.g., Three.js, SVG).
 * 
 * ## Key Responsibilities
 * - **Input Management**: Handles mouse events and user interactions
 * - **Selection**: Manages selected entities and visual feedback
 * - **Coordinate Systems**: Converts between screen and world coordinates
 * - **Spatial Queries**: Finds entities at specific locations
 * - **View State**: Tracks current position, zoom, and view mode
 * 
 * @example
 * ```typescript
 * class MyView extends AcEdBaseView {
 *   // Implement required abstract methods
 *   get missedData() { return { fonts: {}, images: new Map() }; }
 *   get mode() { return this._mode; }
 *   set mode(value) { this._mode = value; }
 *   // ... other abstract methods
 * }
 * 
 * const view = new MyView(canvasElement);
 * view.events.mouseMove.addEventListener(args => {
 *   console.log('Mouse at world coords:', args.x, args.y);
 * });
 * ```
 */
export abstract class AcEdBaseView {
  /** Current viewport width in pixels */
  private _width: number
  /** Current viewport height in pixels */
  private _height: number
  /** Optional callback to calculate canvas size on resize */
  private _calculateSizeCallback?: AcEdCalculateSizeCallback
  /** Bounding box of all entities in the view */
  private _bbox: AcGeBox3d
  /** Current mouse position in world coordinates */
  private _curPos: AcGePoint2d
  /** Current mouse position in screen coordinates */
  private _curScreenPos: AcGePoint2d
  /** Set of currently selected entities */
  private _selectionSet: AcEdSelectionSet
  /** Input manager for handling user interactions */
  private _editor: AcEditor
  /** Size of selection box in pixels for entity picking */
  private _selectionBoxSize: number

  /** Timer for hover detection delay */
  private _hoverTimer: NodeJS.Timeout | null
  /** Timer for hover pause detection */
  private _pauseTimer: NodeJS.Timeout | null
  /** ID of currently hovered entity */
  private _hoveredObjectId: AcDbObjectId | null

  /** The HTML canvas element for rendering */
  protected _canvas: HTMLCanvasElement

  /** Events fired by the view for various interactions */
  public readonly events = {
    /** Fired when mouse moves over the view */
    mouseMove: new AcCmEventManager<AcEdMouseEventArgs>(),
    /** Fired when the view is resized */
    viewResize: new AcCmEventManager<AcEdViewResizedEventArgs>(),
    /** Fired when mouse hovers over an entity */
    hover: new AcCmEventManager<AcEdViewHoverEventArgs>(),
    /** Fired when mouse stops hovering over an entity */
    unhover: new AcCmEventManager<AcEdViewHoverEventArgs>()
  }

  /**
   * Creates a new base view instance.
   * 
   * Sets up the canvas, initializes internal state, and registers event listeners
   * for mouse interactions and window resize events.
   * 
   * @param canvas - The HTML canvas element to render into
   */
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
   * Gets the input manager for handling user interactions.
   * 
   * The editor provides high-level methods for getting user input like
   * point selection, entity selection, and cursor management.
   * 
   * @returns The editor instance
   */
  get editor() {
    return this._editor
  }

  /**
   * Gets the size of the selection box used for entity picking.
   * 
   * This determines how close the mouse needs to be to an entity
   * to select it, measured in screen pixels.
   * 
   * @returns Selection box size in pixels
   */
  get selectionBoxSize() {
    return this._selectionBoxSize
  }
  
  /**
   * Sets the size of the selection box used for entity picking.
   * 
   * @param value - Selection box size in pixels
   */
  set selectionBoxSize(value: number) {
    this._selectionBoxSize = value
  }

  /**
   * Gets information about missing data during rendering.
   * 
   * This includes fonts that couldn't be loaded and images that are
   * missing or inaccessible. Implementations should track and report
   * this information to help users understand rendering issues.
   * 
   * @returns Object containing missing fonts and images
   */
  abstract get missedData(): AcEdMissedData

  /**
   * Gets the current view mode.
   * 
   * The view mode determines how the view responds to user interactions:
   * - SELECTION: Click to select entities
   * - PAN: Click and drag to pan the view
   * 
   * @returns The current view mode
   */
  abstract get mode(): AcEdViewMode
  
  /**
   * Sets the current view mode.
   * 
   * @param value - The view mode to set
   */
  abstract set mode(value: AcEdViewMode)

  /**
   * Gets the center point of the current view in world coordinates.
   * 
   * @returns The view center point
   */
  abstract get center(): AcGePoint2d
  
  /**
   * Sets the center point of the current view in world coordinates.
   * 
   * @param value - The new center point
   */
  abstract set center(value: AcGePoint2d)

  /**
   * Converts a point from client window coordinates to world coordinates.
   * 
   * The client window coordinate system has its origin at the top-left corner
   * of the canvas, with Y increasing downward. World coordinates use the
   * CAD coordinate system with Y typically increasing upward.
   * 
   * @param point - Point in client window coordinates
   * @returns Point in world coordinates
   * 
   * @example
   * ```typescript
   * const screenPoint = { x: 100, y: 200 }; // 100px right, 200px down
   * const worldPoint = view.cwcs2Wcs(screenPoint);
   * console.log('World coordinates:', worldPoint.x, worldPoint.y);
   * ```
   */
  abstract cwcs2Wcs(point: AcGePoint2dLike): AcGePoint2d
  
  /**
   * Converts a point from world coordinates to client window coordinates.
   * 
   * This is the inverse of `cwcs2Wcs()`, converting from the CAD world
   * coordinate system to screen pixel coordinates.
   * 
   * @param point - Point in world coordinates  
   * @returns Point in client window coordinates
   * 
   * @example
   * ```typescript
   * const worldPoint = new AcGePoint2d(10, 20); // CAD coordinates
   * const screenPoint = view.wcs2Cwcs(worldPoint);
   * console.log('Screen position:', screenPoint.x, screenPoint.y);
   * ```
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
