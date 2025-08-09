import { AcEdBaseView } from '../view/AcEdBaseView'

/**
 * The base class for all of classes to get user inputs such as string, angle, number, point, selection,
 * and so on.
 * 
 * This abstract class provides a common framework for handling user input operations in the CAD editor.
 * It manages the input lifecycle including activation, deactivation, and promise-based resolution.
 * Subclasses must implement specific input behaviors while this base class handles common functionality
 * like keyboard event handling and promise management.
 * 
 * @template TResult - The type of result that this input operation will return
 * 
 * @example
 * ```typescript
 * class MyInput extends AcEdBaseInput<string> {
 *   // Implement specific input behavior
 * }
 * const input = new MyInput(view);
 * const result = await input.start();
 * ```
 * 
 * @internal
 */
export abstract class AcEdBaseInput<TResult> {
  /** The view associated with this input operation */
  protected view: AcEdBaseView
  /** Whether this input is currently active */
  protected active = false
  /** Flag to prevent multiple resolutions of the same promise */
  protected isResolvedOrRejected = false

  /** Promise resolve function for completing the input operation */
  private _resolve?: (value: TResult) => void
  /** Promise reject function for canceling the input operation */
  private _reject?: (reason: string) => void

  /**
   * Creates a new base input instance.
   * 
   * @param view - The view that will handle this input operation
   */
  constructor(view: AcEdBaseView) {
    this.view = view
  }

  /**
   * Gets whether this input is currently active.
   * 
   * @returns True if the input is active, false otherwise
   */
  get isActive() {
    return this.active
  }

  /**
   * Activates this input operation.
   * Sets up event listeners and marks the input as active.
   * Subclasses should call super.activate() when overriding.
   */
  activate() {
    if (this.isActive) {
      console.warn('Something wrong here!')
    }
    this.active = true
    this.view.canvas.addEventListener('keydown', this.onKeyDown)
  }

  /**
   * Deactivates this input operation.
   * Removes event listeners and marks the input as inactive.
   * Subclasses should call super.deactivate() when overriding.
   */
  deactivate() {
    this.active = false
    this.view.canvas.removeEventListener('keydown', this.onKeyDown)
  }

  /**
   * Resolves the input operation with the specified result.
   * Automatically deactivates the input and prevents multiple resolutions.
   * 
   * @param result - The result to resolve the promise with
   */
  resolve(result: TResult) {
    this.deactivate()
    if (this._resolve && !this.isResolvedOrRejected) {
      this._resolve(result)
      this.isResolvedOrRejected = true
    }
  }

  /**
   * Rejects the input operation with the specified reason.
   * Automatically deactivates the input and prevents multiple rejections.
   * 
   * @param reason - The reason for rejecting the input operation
   */
  reject(reason: string) {
    this.deactivate()
    if (this._reject && !this.isResolvedOrRejected) {
      this._reject(reason)
      this.isResolvedOrRejected = true
    }
  }

  /**
   * Handles keyboard events for the input operation.
   * By default, cancels the operation when Escape is pressed.
   * 
   * @param e - The keyboard event
   */
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      this.reject('Canceled by user!')
    }
  }

  /**
   * Starts the input operation and returns a promise that resolves with the result.
   * This method activates the input and returns a promise that will be resolved
   * when the user completes the input operation.
   * 
   * @returns A promise that resolves with the input result
   */
  async start(): Promise<TResult> {
    this.isResolvedOrRejected = false
    return new Promise<TResult>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
      this.activate()
    })
  }
}
