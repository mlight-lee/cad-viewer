import { AcApContext } from '../app'
import { AcEdCommand } from '../command'
import { AcApSvgConvertor } from './AcApSvgConvertor'

export class AcApConvertToSvgCmd extends AcEdCommand {
  execute(_context: AcApContext) {
    const converter = new AcApSvgConvertor()
    converter.convert()
  }
}
