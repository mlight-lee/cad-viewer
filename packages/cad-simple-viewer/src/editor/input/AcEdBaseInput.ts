import { AcEdBaseView } from '../view/AcEdBaseView'

/**
 * The base class for all of classes to get user inputs such as string, angle, number, point, selection,
 * and so on.
 * @internal
 */
export abstract class AcEdBaseInput<TResult> {
  protected view: AcEdBaseView
  protected active = false
  protected isResolvedOrRejected = false

  private _resolve?: (value: TResult) => void
  private _reject?: (reason: string) => void

  constructor(view: AcEdBaseView) {
    this.view = view
  }

  get isActive() {
    return this.active
  }

  activate() {
    if (this.isActive) {
      console.warn('Something wrong here!')
    }
    this.active = true
    this.view.canvas.addEventListener('keydown', this.onKeyDown)
  }

  deactivate() {
    this.active = false
    this.view.canvas.removeEventListener('keydown', this.onKeyDown)
  }

  resolve(result: TResult) {
    this.deactivate()
    if (this._resolve && !this.isResolvedOrRejected) {
      this._resolve(result)
      this.isResolvedOrRejected = true
    }
  }

  reject(reason: string) {
    this.deactivate()
    if (this._reject && !this.isResolvedOrRejected) {
      this._reject(reason)
      this.isResolvedOrRejected = true
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      this.reject('Canceled by user!')
    }
  }

  /**
   * Start inputting
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
