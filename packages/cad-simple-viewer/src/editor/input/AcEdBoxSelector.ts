import { AcCmColor, AcGeBox2d, AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view'
import { AcEdBaseInput } from './AcEdBaseInput'

const BORDER_COLOR = 0xffffff
const BORDER_WIDTH = '1px'

/**
 * Selector used to select entities by a box.
 * @internal
 */
export class AcEdBoxSelector extends AcEdBaseInput<AcGeBox2d> {
  private mouseDown = false
  private mouseMove = false
  private mouseDownPositionX = -1 // -1 means invalid point
  private mouseDownPositionY = -1

  // DOM element used to draw a box
  private boxDom?: HTMLDivElement
  // Selection box color
  public color: number
  private container: HTMLElement

  constructor(view: AcEdBaseView) {
    super(view)
    this.container = view.canvas
    this.color = BORDER_COLOR
  }

  activate() {
    super.activate()
    this.active = true
    this.container.addEventListener('pointerdown', this.mousedown)
    this.container.addEventListener('pointermove', this.mousemove)
    this.container.addEventListener('pointerup', this.mouseup)
  }

  deactivate() {
    super.deactivate()
    this.container.removeEventListener('pointerdown', this.mousedown)
    this.container.removeEventListener('pointermove', this.mousemove)
    this.container.removeEventListener('pointerup', this.mouseup)
    this.setRectDomVisible(false)
  }

  reject(reason: string) {
    super.reject(reason)
    this.boxDom?.remove()
    this.boxDom = undefined
  }

  private mousedown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.mouseDown = true
      const point = new AcGePoint2d(e.x, e.y)
      this.mouseDownPositionX = point.x
      this.mouseDownPositionY = point.y
    }
  }

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

  private setRectDomVisible(visible: boolean) {
    if (this.boxDom) {
      this.boxDom.style.display = visible ? 'inline-block' : 'none'
    }
  }

  private toWcs(box: AcGeBox2d) {
    const wcsBox = new AcGeBox2d()
    const p1 = new AcGePoint2d(box.min.x, box.min.y)
    const p2 = new AcGePoint2d(box.max.x, box.max.y)
    wcsBox.expandByPoint(this.view.cwcs2Wcs(p1))
    wcsBox.expandByPoint(this.view.cwcs2Wcs(p2))
    return wcsBox
  }
}
