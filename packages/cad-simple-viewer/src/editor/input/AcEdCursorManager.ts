/**
 * Enumeration of cursor types available in the CAD editor.
 * 
 * These cursor types provide visual feedback to users about the current
 * operation mode or expected input type. Each cursor has a specific
 * appearance and is used in different contexts.
 * 
 * @example
 * ```typescript
 * // Set crosshair cursor for precise point input
 * editor.setCursor(AcEdCorsorType.Crosshair);
 * 
 * // Set grab cursor for pan operations
 * editor.setCursor(AcEdCorsorType.Grab);
 * 
 * // Restore default cursor
 * editor.setCursor(AcEdCorsorType.NoSpecialCursor);
 * ```
 */
export enum AcEdCorsorType {
  /** No special cursor - uses browser default */
  NoSpecialCursor = -1,
  /** Crosshair cursor for precise point selection */
  Crosshair = 0,
  /** Rectangle cursor for area selection */
  RectCursor,
  /** Rubber band cursor for dynamic drawing */
  RubberBand,
  /** Non-rotated cursor */
  NotRotated,
  /** Target box cursor for object snapping */
  TargetBox,
  /** Rotated crosshair cursor */
  RotatedCrosshair,
  /** Crosshair that doesn't rotate with view */
  CrosshairNoRotate,
  /** Invisible cursor for hiding cursor */
  Invisible,
  /** Entity selection cursor */
  EntitySelect,
  /** Parallelogram cursor for skewed operations */
  Parallelogram,
  /** Entity select cursor without perspective */
  EntitySelectNoPersp,
  /** Cursor for pick-first or grips operations */
  PkfirstOrGrips,
  /** Dashed crosshair cursor */
  CrosshairDashed,
  /** Grab/hand cursor for panning */
  Grab
}

/**
 * Manages cursor appearance and behavior for the CAD editor.
 * 
 * This class creates and applies custom cursors to HTML elements,
 * providing visual feedback for different CAD operations. It supports
 * both built-in browser cursors and custom SVG-based cursors.
 * 
 * The cursor manager maintains a cache of cursor definitions to avoid
 * recreating them repeatedly, improving performance.
 * 
 * @internal This class is for internal use by the editor system
 * 
 * @example
 * ```typescript
 * const cursorManager = new AcEdCursorManager();
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
 * 
 * // Set crosshair cursor
 * cursorManager.setCursor(AcEdCorsorType.Crosshair, canvas);
 * 
 * // Set grab cursor for panning
 * cursorManager.setCursor(AcEdCorsorType.Grab, canvas);
 * ```
 */
export class AcEdCursorManager {
  /** Cache of cursor definitions mapped by cursor type */
  private _cursorMap: Map<AcEdCorsorType, string>
  
  /**
   * Creates a new cursor manager instance.
   * 
   * Initializes the cursor cache and creates default cursor definitions.
   */
  constructor() {
    this._cursorMap = new Map()
    this._cursorMap.set(
      AcEdCorsorType.Crosshair,
      this.createRectCrossIcon(10, 10)
    )
  }

  /**
   * Sets the cursor for the specified HTML element.
   * 
   * Applies the appropriate cursor style based on the cursor type.
   * For built-in cursor types, uses CSS cursor values. For custom
   * cursor types, uses cached SVG-based cursor definitions.
   * 
   * @param cursorType - The type of cursor to set
   * @param element - The HTML element to apply the cursor to
   * 
   * @example
   * ```typescript
   * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
   * cursorManager.setCursor(AcEdCorsorType.Crosshair, canvas);
   * ```
   */
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
   * Encodes an SVG string into a CSS cursor URL.
   * 
   * This method converts SVG markup into a data URI that can be used
   * as a CSS cursor value, with specified hotspot coordinates.
   * 
   * @param svgString - The SVG markup as a string
   * @param xOffset - X coordinate of the cursor hotspot
   * @param yOffset - Y coordinate of the cursor hotspot
   * @returns CSS cursor string in url() format
   * 
   * @example
   * ```typescript
   * const svgCursor = '<svg width="20" height="20">...</svg>';
   * const cursorUrl = cursorManager.encodeSvgToCursor(svgCursor, 10, 10);
   * element.style.cursor = cursorUrl;
   * ```
   */
  encodeSvgToCursor(svgString: string, xOffset: number, yOffset: number) {
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
    return this.encodeSvgToCursor(svg, halfSize + lineLength, halfSize + lineLength)
  }
}
