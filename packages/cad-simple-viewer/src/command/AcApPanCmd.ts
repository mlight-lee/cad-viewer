import { AcApContext } from '../app'
import { AcEdCommand } from '../command'
import { AcEdCorsorType, AcEdViewMode } from '../editor'

export class AcApPanCmd extends AcEdCommand {
  execute(context: AcApContext) {
    context.view.mode = AcEdViewMode.PAN
    context.view.setCursor(AcEdCorsorType.Grab)
  }
}
