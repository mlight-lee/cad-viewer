import { AcCmEventManager } from '@mlightcad/data-model'
import { AcDbObjectId } from '@mlightcad/data-model'

/**
 * Interface to define arguments of selection events.
 */
export interface AcEdSelectionEventArgs {
  ids: AcDbObjectId[]
}

/**
 * The class represents the selection set in current view.
 */
export class AcEdSelectionSet {
  private _ids: Set<AcDbObjectId>

  public readonly events = {
    selectionAdded: new AcCmEventManager<AcEdSelectionEventArgs>(),
    selectionRemoved: new AcCmEventManager<AcEdSelectionEventArgs>()
  }

  constructor(ids: AcDbObjectId[] = []) {
    this._ids = new Set<AcDbObjectId>(ids)
  }

  get ids() {
    return Array.from(this._ids)
  }

  get count() {
    return this._ids.size
  }

  add(value: AcDbObjectId | AcDbObjectId[]) {
    if (Array.isArray(value)) {
      value.forEach(item => this._ids.add(item))
      this.events.selectionAdded.dispatch({ ids: value })
    } else {
      this._ids.add(value)
      this.events.selectionAdded.dispatch({ ids: [value] })
    }
  }

  delete(value: AcDbObjectId | AcDbObjectId[]) {
    if (Array.isArray(value)) {
      value.forEach(item => this._ids.delete(item))
      this.events.selectionRemoved.dispatch({ ids: value })
    } else {
      this._ids.delete(value)
      this.events.selectionRemoved.dispatch({ ids: [value] })
    }
  }

  has(id: AcDbObjectId) {
    return this._ids.has(id)
  }

  clear() {
    if (this._ids.size > 0) {
      const ids = Array.from(this._ids)
      this._ids.clear()
      this.events.selectionRemoved.dispatch({ ids })
    }
  }
}
