import { AcCmEventManager, AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view/AcEdBaseView'
import { AcEdBaseInput } from './AcEdBaseInput'

export class AcEdJigLoop<TResult> extends AcEdBaseInput<TResult> {
  public readonly events = {
    update: new AcCmEventManager<void>()
  }
  public curPos: AcGePoint2d

  constructor(view: AcEdBaseView) {
    super(view)
    this.curPos = new AcGePoint2d()
  }

  activate() {
    super.activate()
    this.view.canvas.addEventListener('mousemove', this.onMouseMove)
  }

  deactivate() {
    super.deactivate()
    this.view.canvas.removeEventListener('mousemove', this.onMouseMove)
  }

  private onMouseMove = (event: MouseEvent) => {
    this.curPos.set(event.clientX, event.clientY)
    this.events.update.dispatch()
  }
}
