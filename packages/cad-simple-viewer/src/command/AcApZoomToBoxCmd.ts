import { AcApContext } from '../app'
import { AcApDocManager } from '../app'
import { AcEdCommand } from '../command'
import { AcEdBaseView, AcEdJig } from '../editor'

export class AcApZoomToBoxJig extends AcEdJig<boolean> {
  constructor(view: AcEdBaseView) {
    super(view)
  }

  async sampler() {
    await AcApDocManager.instance.editor.getSelection().then(box => {
      return this.view.zoomTo(box, 1)
    })
  }
}

export class AcApZoomToBoxCmd extends AcEdCommand {
  async execute(context: AcApContext) {
    const jig = new AcApZoomToBoxJig(context.view)
    await jig.drag()
  }
}
