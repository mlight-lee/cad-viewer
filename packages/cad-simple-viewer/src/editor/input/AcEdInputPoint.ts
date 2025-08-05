import { AcGePoint2d } from '@mlightcad/data-model'

import { AcEdBaseView } from '../view/AcEdBaseView'
import { AcEdBaseInput } from './AcEdBaseInput'

/**
 * Class used to input one point
 * @internal
 */
export class AcEdInputPoint extends AcEdBaseInput<AcGePoint2d> {
  constructor(view: AcEdBaseView) {
    super(view)
  }

  activate() {
    super.activate()
    this.view.canvas.addEventListener('click', this.onClick)
  }

  deactivate() {
    super.deactivate()
    this.view.canvas.removeEventListener('click', this.onClick)
  }

  private onClick = (event: MouseEvent) => {
    this.resolve(this.view.cwcs2Wcs({ x: event.clientX, y: event.clientY }))
  }
}
