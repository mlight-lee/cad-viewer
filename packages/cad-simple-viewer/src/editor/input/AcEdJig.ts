import { AcEdBaseView } from '../view'
import { AcEdJigLoop } from './AcEdJigLoop'

export class AcEdJig<TResult> {
  private _jigLoop: AcEdJigLoop<TResult>
  private _view: AcEdBaseView

  constructor(view: AcEdBaseView) {
    this._view = view
    this._jigLoop = new AcEdJigLoop(view)
    this._jigLoop.events.update.addEventListener(this.onUpdate)
  }

  get view() {
    return this._view
  }

  resolve(result: TResult) {
    this._jigLoop.events.update.removeEventListener(this.onUpdate)
    this._jigLoop.resolve(result)
  }

  reject(reason: string) {
    this._jigLoop.events.update.removeEventListener(this.onUpdate)
    this._jigLoop.reject(reason)
  }

  async drag() {
    const promise1 = this._jigLoop.start()
    const promise2 = this.sampler()
    await Promise.allSettled([promise1, promise2])
  }

  async sampler() {
    // Do nothing for now
  }

  update() {
    // Do nothing for now
  }

  private onUpdate = () => {
    this.update()
  }
}
