export enum AcEdCorsorType {
  NoSpecialCursor = -1,
  Crosshair = 0,
  RectCursor,
  RubberBand,
  NotRotated,
  TargetBox,
  RotatedCrosshair,
  CrosshairNoRotate,
  Invisible,
  EntitySelect,
  Parallelogram,
  EntitySelectNoPersp,
  PkfirstOrGrips,
  CrosshairDashed,
  Grab
}

/**
 * The class to create and manage cursor
 * @internal
 */
export class AcEdCursorManager {
  private _cursorMap: Map<AcEdCorsorType, string>
  constructor() {
    this._cursorMap = new Map()
    this._cursorMap.set(
      AcEdCorsorType.Crosshair,
      this.createRectCrossIcon(10, 10)
    )
  }

  setCursor(cursorType: AcEdCorsorType, element: HTMLElement) {
    if (cursorType <= AcEdCorsorType.NoSpecialCursor) {
      element.style.cursor = 'default'
    } else if (cursorType == AcEdCorsorType.Grab) {
      element.style.cursor = 'grab'
    } else {
      const cursor = this._cursorMap.get(cursorType)
      if (cursor) {
        element.style.cursor = cursor
      }
    }
  }

  /**
   * Encode SVG string to one cursor defined using url() in CSS
   * @param svgString Input svg string
   * @param xOffset Input x offset for cursor hotspot
   * @param yOffset Input y offset for cursor hotspot
   * @returns
   */
  private encodeSvg(
    svgString: string,
    xOffset: number = 0,
    yOffset: number = 0
  ) {
    return `url('data:image/svg+xml;base64,${btoa(svgString)}') ${xOffset} ${yOffset}, auto`
  }

  /**
   * Create one svg icon with one rectangle plus two cross lines
   * @param rectSize Input the width and height of rectangle
   * @param crossLineLength Input the length of one cross line
   * @param lineColor Input line color
   * @returns Return svg string of the icon
   */
  private createRectCrossIcon(
    rectSize: number,
    lineLength: number,
    lineColor: string = 'white'
  ) {
    const halfSize = rectSize / 2
    const svgSize = rectSize + 2 * lineLength
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
        <rect x="${lineLength}" y="${lineLength}" width="${rectSize}" height="${rectSize}" fill="none" stroke="${lineColor}" />
        <line x1="${halfSize + lineLength}" y1="0" x2="${halfSize + lineLength}" y2="${lineLength}" stroke="${lineColor}" />
        <line x1="${rectSize + lineLength}" y1="${halfSize + lineLength}" x2="${rectSize + 2 * lineLength}" y2="${halfSize + lineLength}" stroke="${lineColor}" />
        <line x1="${halfSize + lineLength}" y1="${rectSize + lineLength}" x2="${halfSize + lineLength}" y2="${rectSize + 2 * lineLength}" stroke="${lineColor}" />
        <line x1="0" y1="${halfSize + lineLength}" x2="${lineLength}" y2="${halfSize + lineLength}" stroke="${lineColor}" />
      </svg>
    `
    return this.encodeSvg(svg, halfSize + lineLength, halfSize + lineLength)
  }
}
