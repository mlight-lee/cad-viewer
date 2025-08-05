import { AcApContext } from '../app'
import { AcApDocManager } from '../app'
import { AcEdCommand } from '../command'

export class AcApQNewCmd extends AcEdCommand {
  execute(_context: AcApContext) {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/mlight-lee/cad-data/templates/'
    AcApDocManager.instance.openUrl(baseUrl + 'acadiso.dxf')
  }
}
