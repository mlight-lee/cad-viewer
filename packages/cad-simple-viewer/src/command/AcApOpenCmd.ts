import { AcApContext } from '../app'
import { AcEdCommand } from '../command'
import { eventBus } from '../editor'

export class AcApOpenCmd extends AcEdCommand {
  execute(_context: AcApContext) {
    eventBus.emit('open-file', {})
  }
}
