import { AcEdBaseView } from '../view/AcEdBaseView'
import { AcEdBoxSelector } from './AcEdBoxSelector'
import { AcEdCorsorType, AcEdCursorManager } from './AcEdCursorManager'
import { AcEdInputPoint } from './AcEdInputPoint'

/**
 * This class is one advanced wrapper for all kinds of inputs such as inputting string, number, angle,
 * distance, point, selection and so on. The mouse events and keyborad events are hidden for API users.
 * It means API users should never listen mouse events and keyborad events. They should always use methods
 * provided by this classes to get user inputs.
 */
export class AcEditor {
  private _previousCursor?: AcEdCorsorType
  private _currentCursor?: AcEdCorsorType
  private _cursorManager: AcEdCursorManager
  protected _view: AcEdBaseView

  constructor(view: AcEdBaseView) {
    this._view = view
    this._cursorManager = new AcEdCursorManager()
  }

  get currentCursor() {
    return this._currentCursor
  }

  restoreCursor() {
    if (this._previousCursor != null) {
      this.setCursor(this._previousCursor)
    }
  }

  setCursor(cursorType: AcEdCorsorType) {
    this._cursorManager.setCursor(cursorType, this._view.canvas)
    this._previousCursor = this._currentCursor
    this._currentCursor = cursorType
  }

  /**
   * Get user input for a point.
   */
  async getPoint() {
    const inputter = new AcEdInputPoint(this._view)
    return await inputter.start()
  }

  /**
   * Get the selection set obtained.
   */
  async getSelection() {
    const selector = new AcEdBoxSelector(this._view)
    return await selector.start()
  }
}
