import { AcApContext } from '../app'
import { AcEdCommand } from '../command'
import { AcEdCorsorType, AcEdViewMode } from '../editor'

export class AcApSelectCmd extends AcEdCommand {
  execute(context: AcApContext) {
    context.view.mode = AcEdViewMode.SELECTION
    context.view.setCursor(AcEdCorsorType.Crosshair)
  }
}
