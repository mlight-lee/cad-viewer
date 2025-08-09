import { AcCmEventManager, AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view/AcEdBaseView'
import { AcEdBaseInput } from './AcEdBaseInput'

/**
 * A specialized input class for jig operations that provides continuous mouse tracking.
 * 
 * This class extends the base input functionality to provide real-time mouse position
 * tracking for interactive operations like drawing previews or dynamic objects that
 * follow the mouse cursor. It fires update events whenever the mouse moves, allowing
 * subscribers to respond to cursor movement.
 * 
 * Jig loops are commonly used in CAD applications for operations like:
 * - Drawing preview lines that stretch from a fixed point to the cursor
 * - Moving objects dynamically with the mouse
 * - Providing visual feedback during interactive operations
 * 
 * @template TResult - The type of result that this jig operation will return
 * 
 * @example
 * ```typescript
 * const jigLoop = new AcEdJigLoop<string>(view);
 * jigLoop.events.update.subscribe(() => {
 *   // Update preview based on jigLoop.curPos
 *   console.log(`Mouse at: ${jigLoop.curPos.x}, ${jigLoop.curPos.y}`);
 * });
 * const result = await jigLoop.start();
 * ```
 */
export class AcEdJigLoop<TResult> extends AcEdBaseInput<TResult> {
  /** Event manager for handling mouse movement updates */
  public readonly events = {
    /** Event fired when the mouse position updates */
    update: new AcCmEventManager<void>()
  }
  /** Current mouse position in screen coordinates */
  public curPos: AcGePoint2d

  /**
   * Creates a new jig loop instance.
   * 
   * @param view - The view that will handle this jig operation
   */
  constructor(view: AcEdBaseView) {
    super(view)
    this.curPos = new AcGePoint2d()
  }

  /**
   * Activates the jig loop operation.
   * Sets up the mouse move event listener to track cursor position.
   * Overrides the base class to add mouse move event handling.
   */
  activate() {
    super.activate()
    this.view.canvas.addEventListener('mousemove', this.onMouseMove)
  }

  /**
   * Deactivates the jig loop operation.
   * Removes the mouse move event listener.
   * Overrides the base class to clean up mouse move event handling.
   */
  deactivate() {
    super.deactivate()
    this.view.canvas.removeEventListener('mousemove', this.onMouseMove)
  }

  /**
   * Handles mouse move events to update the current cursor position.
   * Updates the current position and fires the update event to notify subscribers.
   * 
   * @param event - The mouse move event containing the new cursor position
   */
  private onMouseMove = (event: MouseEvent) => {
    this.curPos.set(event.clientX, event.clientY)
    this.events.update.dispatch()
  }
}
