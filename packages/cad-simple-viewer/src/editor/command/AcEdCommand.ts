import { AcCmEventManager } from '@mlightcad/data-model'

import { AcApContext } from '../../app'

/**
 * Interface to define arguments of one command event.
 */
export interface AcEdCommandEventArgs {
  command: AcEdCommand
}

/**
 * Base class of all commands.
 */
export abstract class AcEdCommand {
  private _globalName: string
  private _localName: string

  constructor() {
    this._globalName = ''
    this._localName = ''
  }

  public readonly events = {
    commandWillStart: new AcCmEventManager<AcEdCommandEventArgs>(),
    commandEnded: new AcCmEventManager<AcEdCommandEventArgs>()
  }

  /**
   * The global or untranslated name associated with the command.
   */
  get globalName() {
    return this._globalName
  }
  set globalName(value: string) {
    this._globalName = value
  }

  /**
   * The local or translated name associated with the command.
   */
  get localName() {
    return this._localName
  }
  set localName(value: string) {
    this._localName = value
  }

  /**
   * Trigger this command. The children class should not override this method to keep event notification
   * work correctly.
   * @param context Input current context to execute this command.
   */
  tirgger(context: AcApContext) {
    this.events.commandWillStart.dispatch({ command: this })
    this.execute(context)
    this.events.commandEnded.dispatch({ command: this })
  }

  /**
   * Execute this command. The children class should override this method to add business logic of this command.
   * @param _context Input current context to execute this command.
   */
  execute(_context: AcApContext) {
    // Do nothing
  }
}
