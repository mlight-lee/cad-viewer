import { AcApContext } from '../app'
import { AcEdCommand } from '../command'

export class AcApZoomCmd extends AcEdCommand {
  execute(context: AcApContext) {
    context.view.zoomToFit()
  }
}
