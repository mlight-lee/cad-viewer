import { AcEdBaseView } from '../view'
import { AcEdJigLoop } from './AcEdJigLoop'

/**
 * Base class for interactive drawing operations (jigs) in the CAD editor.
 * 
 * A jig is an interactive operation that allows users to dynamically preview
 * and modify geometric elements during creation. Common examples include:
 * - Drawing lines with real-time preview as the mouse moves
 * - Selecting rectangular areas with visual feedback
 * - Dynamic entity placement with instant visual updates
 * 
 * The jig system provides:
 * - Real-time visual feedback during user interaction
 * - Event-driven updates based on mouse movement
 * - Asynchronous completion handling
 * - Cancellation and error handling
 * 
 * @template TResult - The type of result returned when the jig completes
 * 
 * @example
 * ```typescript
 * class RectangleSelectionJig extends AcEdJig<Rectangle> {
 *   private startPoint?: Point;
 *   private currentPoint?: Point;
 * 
 *   async sampler() {
 *     // Get start point
 *     this.startPoint = await this.view.editor.getPoint();
 *     
 *     // Continue updating until complete
 *     this.view.events.mouseMove.addEventListener(this.onMouseMove);
 *   }
 * 
 *   update() {
 *     if (this.startPoint && this.currentPoint) {
 *       // Update preview rectangle
 *       this.drawPreviewRectangle(this.startPoint, this.currentPoint);
 *     }
 *   }
 * 
 *   private onMouseMove = (args) => {
 *     this.currentPoint = args;
 *     // Jig loop will call update() automatically
 *   }
 * }
 * 
 * // Usage
 * const jig = new RectangleSelectionJig(view);
 * const rectangle = await jig.drag();
 * ```
 */
export class AcEdJig<TResult> {
  /** Internal jig loop that handles the interactive operation */
  private _jigLoop: AcEdJigLoop<TResult>
  /** The view associated with this jig */
  private _view: AcEdBaseView

  /**
   * Creates a new jig instance for the specified view.
   * 
   * Sets up the jig loop and connects update event handling.
   * 
   * @param view - The view this jig will operate in
   */
  constructor(view: AcEdBaseView) {
    this._view = view
    this._jigLoop = new AcEdJigLoop(view)
    this._jigLoop.events.update.addEventListener(this.onUpdate)
  }

  /**
   * Gets the view associated with this jig.
   * 
   * @returns The view instance
   */
  get view() {
    return this._view
  }

  /**
   * Resolves the jig operation with the specified result.
   * 
   * This method should be called when the jig operation completes successfully.
   * It cleans up event listeners and resolves the underlying promise.
   * 
   * @param result - The result to return from the jig operation
   * 
   * @example
   * ```typescript
   * // In a line drawing jig, when user completes the line
   * if (this.hasValidEndPoint()) {
   *   const line = new Line(this.startPoint, this.endPoint);
   *   this.resolve(line);
   * }
   * ```
   */
  resolve(result: TResult) {
    this._jigLoop.events.update.removeEventListener(this.onUpdate)
    this._jigLoop.resolve(result)
  }

  /**
   * Rejects the jig operation with an error.
   * 
   * This method should be called when the jig operation fails or is cancelled.
   * It cleans up event listeners and rejects the underlying promise.
   * 
   * @param reason - The reason for the rejection
   * 
   * @example
   * ```typescript
   * // If user cancels or invalid input is detected
   * if (userPressedEscape) {
   *   this.reject('Operation cancelled by user');
   * }
   * ```
   */
  reject(reason: string) {
    this._jigLoop.events.update.removeEventListener(this.onUpdate)
    this._jigLoop.reject(reason)
  }

  /**
   * Starts the interactive jig operation.
   * 
   * This method initiates both the jig loop and the sampling process.
   * It returns a promise that resolves when the jig operation completes
   * or rejects if an error occurs.
   * 
   * @returns Promise that resolves when the jig operation completes
   * 
   * @example
   * ```typescript
   * const jig = new MyCustomJig(view);
   * try {
   *   const result = await jig.drag();
   *   console.log('Jig completed with result:', result);
   * } catch (error) {
   *   console.log('Jig was cancelled or failed:', error);
   * }
   * ```
   */
  async drag() {
    const promise1 = this._jigLoop.start()
    const promise2 = this.sampler()
    await Promise.allSettled([promise1, promise2])
  }

  /**
   * Abstract method for handling jig input sampling.
   * 
   * This method should be overridden by subclasses to implement
   * the specific input handling logic for the jig. It typically:
   * - Gets initial user input (like a start point)
   * - Sets up event listeners for dynamic updates
   * - Handles user interaction until completion
   * 
   * The sampler runs concurrently with the jig loop and should
   * call `resolve()` or `reject()` when the operation completes.
   * 
   * @example
   * ```typescript
   * async sampler() {
   *   // Get initial point
   *   const startPoint = await this.view.editor.getPoint();
   *   
   *   // Set up mouse tracking for dynamic preview
   *   this.view.events.mouseMove.addEventListener(this.onMouseMove);
   *   this.view.events.mouseClick.addEventListener(this.onMouseClick);
   * }
   * ```
   */
  async sampler() {
    // Do nothing for now
  }

  /**
   * Called during each update cycle to refresh the jig display.
   * 
   * This method should be overridden by subclasses to implement
   * the visual update logic. It's called automatically by the jig loop
   * whenever the display needs to be refreshed (typically on mouse movement).
   * 
   * Common update operations include:
   * - Redrawing preview geometry
   * - Updating dimension displays
   * - Refreshing visual feedback elements
   * 
   * @example
   * ```typescript
   * update() {
   *   if (this.startPoint && this.currentMousePoint) {
   *     // Clear previous preview
   *     this.clearPreview();
   *     
   *     // Draw new preview line
   *     this.drawPreviewLine(this.startPoint, this.currentMousePoint);
   *   }
   * }
   * ```
   */
  update() {
    // Do nothing for now
  }

  /** Internal event handler for jig loop updates */
  private onUpdate = () => {
    this.update()
  }
}
