import { AcCmColor, AcGeBox2d, AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view'
import { AcEdBaseInput } from './AcEdBaseInput'

/** Default border color for the selection box */
const BORDER_COLOR = 0xffffff
/** Default border width for the selection box */
const BORDER_WIDTH = '1px'

/**
 * Selector used to select entities by a box.
 *
 * This class provides interactive box selection functionality for the CAD editor.
 * Users can click and drag to create a selection rectangle, which is then converted
 * to world coordinates for entity selection operations.
 *
 * The selector handles mouse events to track the selection area and provides visual
 * feedback through a DOM overlay showing the selection bounds.
 *
 * @example
 * ```typescript
 * const boxSelector = new AcEdBoxSelector(view);
 * const selectionBox = await boxSelector.start();
 * // Use selectionBox to select entities
 * ```
 *
 * @internal
 */
export class AcEdBoxSelector extends AcEdBaseInput<AcGeBox2d> {
  /** Whether the mouse button is currently pressed */
  private mouseDown = false
  /** Whether the mouse has moved since being pressed */
  private mouseMove = false
  /** X coordinate where mouse was initially pressed (-1 indicates invalid) */
  private mouseDownPositionX = -1 // -1 means invalid point
  /** Y coordinate where mouse was initially pressed (-1 indicates invalid) */
  private mouseDownPositionY = -1

  /** DOM element used to draw the selection box */
  private boxDom?: HTMLDivElement
  /** Selection box border color */
  public color: number
  /** The container element for the selection box */
  private container: HTMLElement

  /**
   * Creates a new box selector instance.
   *
   * @param view - The view that will handle this box selection operation
   */
  constructor(view: AcEdBaseView) {
    super(view)
    this.container = view.canvas
    this.color = BORDER_COLOR
  }

  /**
   * Activates the box selector.
   * Sets up mouse event listeners for tracking selection area.
   * Overrides the base class to add mouse event handling.
   */
  activate() {
    super.activate()
    this.active = true
    this.container.addEventListener('pointerdown', this.mousedown)
    this.container.addEventListener('pointermove', this.mousemove)
    this.container.addEventListener('pointerup', this.mouseup)
  }

  /**
   * Deactivates the box selector.
   * Removes mouse event listeners and hides the selection box.
   * Overrides the base class to clean up mouse event handling.
   */
  deactivate() {
    super.deactivate()
    this.container.removeEventListener('pointerdown', this.mousedown)
    this.container.removeEventListener('pointermove', this.mousemove)
    this.container.removeEventListener('pointerup', this.mouseup)
    this.setRectDomVisible(false)
  }

  /**
   * Rejects the box selection operation.
   * Cleans up the selection box DOM element.
   *
   * @param reason - The reason for rejecting the selection operation
   */
  reject(reason: string) {
    super.reject(reason)
    this.boxDom?.remove()
    this.boxDom = undefined
  }

  /**
   * Handles mouse down events to start box selection.
   * Records the initial mouse position for the selection area.
   *
   * @param e - The mouse event
   */
  private mousedown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.mouseDown = true
      const point = new AcGePoint2d(e.x, e.y)
      this.mouseDownPositionX = point.x
      this.mouseDownPositionY = point.y
    }
  }

  /**
   * Handles mouse move events to update the selection box.
   * Creates and updates the visual selection rectangle as the user drags.
   *
   * @param e - The mouse event
   */
  private mousemove = (e: MouseEvent) => {
    if (!this.mouseDown) {
      return
    }
    const point = new AcGePoint2d(e.x, e.y)
    if (this.mouseDownPositionX >= 0 && this.mouseDownPositionY >= 0) {
      const TOLERANCE = 5
      if (
        Math.abs(point.x - this.mouseDownPositionX) >= TOLERANCE ||
        Math.abs(point.y - this.mouseDownPositionY) >= TOLERANCE
      ) {
        this.mouseMove = true
        const leftTop = new AcGePoint2d(
          Math.min(this.mouseDownPositionX, point.x),
          Math.min(this.mouseDownPositionY, point.y)
        )
        const rightBottom = new AcGePoint2d(
          Math.max(this.mouseDownPositionX, point.x),
          Math.max(this.mouseDownPositionY, point.y)
        )
        this.drawRect(leftTop, rightBottom)
      }
    }
  }

  /**
   * Handles mouse up events to complete box selection.
   * Calculates the final selection area and resolves the promise with the result.
   *
   * @param e - The mouse event
   */
  private mouseup = (e: MouseEvent) => {
    if (this.mouseDown && this.mouseMove) {
      const point = new AcGePoint2d(e.x, e.y)
      const min = new AcGePoint2d(
        Math.min(this.mouseDownPositionX, point.x),
        Math.min(this.mouseDownPositionY, point.y)
      )
      const max = new AcGePoint2d(
        Math.max(this.mouseDownPositionX, point.x),
        Math.max(this.mouseDownPositionY, point.y)
      )
      const bbox = new AcGeBox2d(min, max)
      this.resolve(this.toWcs(bbox))
    }
    this.mouseDown = false
    this.mouseMove = false
    // reset
    this.mouseDownPositionX = -1
    this.mouseDownPositionY = -1
  }

  /**
   * Draws the selection rectangle on screen.
   * Creates or updates the DOM element representing the selection box.
   *
   * @param leftTop - The top-left corner of the selection rectangle
   * @param rightBottom - The bottom-right corner of the selection rectangle
   */
  private drawRect(leftTop: AcGePoint2d, rightBottom: AcGePoint2d) {
    if (!this.boxDom) {
      const color = new AcCmColor()
      color.color = this.color
      this.boxDom = document.createElement('div')
      this.boxDom.style.cssText = `position: absolute;border: ${BORDER_WIDTH} solid ${color.cssColor};`
      document.body.appendChild(this.boxDom)
    }
    this.setRectDomVisible(true)

    // Adjust leftTop and rightBottom position to make them always in container bounding box
    // Otherwise, the box may exceed the container bounding box and scrollbar will be shown.
    if (leftTop.x <= 0) {
      leftTop.x = 0
    }
    if (leftTop.y <= 0) {
      leftTop.y = 0
    }
    if (rightBottom.x >= this.container.clientWidth - 2) {
      rightBottom.x = this.container.clientWidth - 2
    }
    if (rightBottom.y >= this.container.clientHeight - 2) {
      rightBottom.y = this.container.clientHeight - 2
    }

    this.boxDom.style.left = `${leftTop.x}px`
    this.boxDom.style.top = `${leftTop.y}px`
    const width = Math.abs(rightBottom.x - leftTop.x)
    const height = Math.abs(rightBottom.y - leftTop.y)
    this.boxDom.style.width = `${width}px`
    this.boxDom.style.height = `${height}px`
  }

  /**
   * Sets the visibility of the selection rectangle DOM element.
   *
   * @param visible - Whether the selection rectangle should be visible
   */
  private setRectDomVisible(visible: boolean) {
    if (this.boxDom) {
      this.boxDom.style.display = visible ? 'inline-block' : 'none'
    }
  }

  /**
   * Converts a screen coordinate box to world coordinate system.
   * Transforms the selection box from screen coordinates to world coordinates
   * for use in entity selection operations.
   *
   * @param box - The selection box in screen coordinates
   * @returns The selection box in world coordinates
   */
  private toWcs(box: AcGeBox2d) {
    const wcsBox = new AcGeBox2d()
    const p1 = new AcGePoint2d(box.min.x, box.min.y)
    const p2 = new AcGePoint2d(box.max.x, box.max.y)
    wcsBox.expandByPoint(this.view.cwcs2Wcs(p1))
    wcsBox.expandByPoint(this.view.cwcs2Wcs(p2))
    return wcsBox
  }
}
