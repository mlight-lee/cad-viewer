import { AcEdBaseView } from '../editor/view/AcEdBaseView'
import { AcTrView2d } from '../view'
import { AcApDocument } from './AcApDocument'

export class AcApContext {
  private _view: AcEdBaseView
  private _doc: AcApDocument

  /**
   * Construct one context to bind one drawing database with its viewer
   * @param view Input the view used to show the specified drawing
   * @param doc Input the document associated with the drawing database
   */
  constructor(view: AcEdBaseView, doc: AcApDocument) {
    this._view = view
    this._doc = doc

    // Add entity to scene
    doc.database.events.entityAppended.addEventListener(args => {
      this.view.addEntity(args.entity)
    })

    // Update entity
    doc.database.events.entityModified.addEventListener(args => {
      this.view.updateEntity(args.entity)
    })

    // Set layer visibility
    doc.database.events.layerModified.addEventListener(args => {
      this._view.setLayerVisibility(args.layer.name, !args.layer.isOff)
    })

    // Set point display mode
    doc.database.events.headerSysVarChanged.addEventListener(args => {
      if (args.name == 'pdmode') {
        ;(this._view as AcTrView2d).rerenderPoints(args.database.pdmode)
      }
    })

    // Show their grip points when entities are selected
    view.selectionSet.events.selectionAdded.addEventListener(args => {
      view.highlight(args.ids)
    })

    // Hide their grip points when entities are deselected
    view.selectionSet.events.selectionRemoved.addEventListener(args => {
      view.unhighlight(args.ids)
    })
  }

  get view() {
    return this._view
  }

  get doc(): AcApDocument {
    return this._doc
  }
}
