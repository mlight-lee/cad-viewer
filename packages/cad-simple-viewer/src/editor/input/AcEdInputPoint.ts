import { AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view/AcEdBaseView'
import { AcEdBaseInput } from './AcEdBaseInput'

/**
 * Class used to input one point from user interaction.
 *
 * This class provides functionality for capturing a single point input from the user
 * by handling mouse click events. When the user clicks on the canvas, the click
 * coordinates are converted from screen coordinates to world coordinates and
 * returned as the result.
 *
 * The input operation can be canceled by pressing the Escape key (handled by the base class).
 *
 * @example
 * ```typescript
 * const pointInput = new AcEdInputPoint(view);
 * const point = await pointInput.start();
 * console.log(`User clicked at: ${point.x}, ${point.y}`);
 * ```
 *
 * @internal
 */
export class AcEdInputPoint extends AcEdBaseInput<AcGePoint2d> {
  /**
   * Creates a new point input instance.
   *
   * @param view - The view that will handle this point input operation
   */
  constructor(view: AcEdBaseView) {
    super(view)
  }

  /**
   * Activates the point input operation.
   * Sets up the click event listener to capture user point selection.
   * Overrides the base class to add click event handling.
   */
  activate() {
    super.activate()
    this.view.canvas.addEventListener('click', this.onClick)
  }

  /**
   * Deactivates the point input operation.
   * Removes the click event listener.
   * Overrides the base class to clean up click event handling.
   */
  deactivate() {
    super.deactivate()
    this.view.canvas.removeEventListener('click', this.onClick)
  }

  /**
   * Handles mouse click events to capture the selected point.
   * Converts the click coordinates from screen space to world coordinates
   * and resolves the input operation with the resulting point.
   *
   * @param event - The mouse click event containing the screen coordinates
   */
  private onClick = (event: MouseEvent) => {
    this.resolve(this.view.cwcs2Wcs({ x: event.clientX, y: event.clientY }))
  }
}
