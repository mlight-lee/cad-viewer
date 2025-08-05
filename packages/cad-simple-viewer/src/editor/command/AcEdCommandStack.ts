import { AcEdCommand } from './AcEdCommand'
import { AcEdCommandIterator } from './AcEdCommandIterator'

export interface AcEdCommandGroup {
  groupName: string
  commandsByGlobalName: Map<string, AcEdCommand>
  commandsByLocalName: Map<string, AcEdCommand>
}

/**
 * The class to create, define, and register command objects.
 */
export class AcEdCommandStack {
  static SYSTEMT_COMMAND_GROUP_NAME = 'ACAD'
  static DEFAUT_COMMAND_GROUP_NAME = 'USER'
  private _commandsByGroup: AcEdCommandGroup[]
  private _systemCommandGroup: AcEdCommandGroup
  private _defaultCommandGroup: AcEdCommandGroup
  private static _instance?: AcEdCommandStack

  private constructor() {
    this._commandsByGroup = []
    this._systemCommandGroup = {
      groupName: AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      commandsByGlobalName: new Map(),
      commandsByLocalName: new Map()
    }
    this._defaultCommandGroup = {
      groupName: AcEdCommandStack.DEFAUT_COMMAND_GROUP_NAME,
      commandsByGlobalName: new Map(),
      commandsByLocalName: new Map()
    }
    this._commandsByGroup.push(this._systemCommandGroup)
    this._commandsByGroup.push(this._defaultCommandGroup)
  }

  static get instance() {
    if (!AcEdCommandStack._instance) {
      AcEdCommandStack._instance = new AcEdCommandStack()
    }
    return AcEdCommandStack._instance
  }

  addCommand(
    cmdGroupName: string,
    cmdGlobalName: string,
    cmdLocalName: string,
    cmd: AcEdCommand
  ) {
    if (!cmdGlobalName) {
      throw new Error(
        '[AcEdCommandStack] The global name of the command is required!'
      )
    }
    if (!cmdLocalName) {
      cmdLocalName = cmdGlobalName
    }

    let commandGroup = this._defaultCommandGroup
    if (cmdGroupName) {
      const tmp = this._commandsByGroup.find(
        value => value.groupName == cmdGroupName
      )
      if (!tmp) {
        commandGroup = {
          groupName: cmdGroupName,
          commandsByGlobalName: new Map(),
          commandsByLocalName: new Map()
        }
      } else {
        commandGroup = tmp
      }
    }
    if (commandGroup.commandsByGlobalName.has(cmdGlobalName)) {
      throw new Error(
        `[AcEdCommandStack] The command with global name '${cmdGlobalName}' already exists!`
      )
    }
    if (commandGroup.commandsByLocalName.has(cmdLocalName)) {
      throw new Error(
        `[AcEdCommandStack] The command with local name '${cmdLocalName}' already exists!`
      )
    }

    commandGroup.commandsByGlobalName.set(cmdGlobalName, cmd)
    commandGroup.commandsByLocalName.set(cmdLocalName, cmd)
    cmd.globalName = cmdGlobalName
    cmd.localName = cmdLocalName
  }

  /**
   * Return an iterator that can be used to traverse all of command objects in this command stack
   * (that is, the iterator iterates through all commands in all groups).
   * @returns Return an iterator that can be used to traverse all of command objects in this command
   * stack.
   */
  iterator() {
    return new AcEdCommandIterator(this._commandsByGroup)
  }

  /**
   * Search through all of the global and untranslated names in all of the command groups in the command
   * stack starting at the top of the stack trying to find a match with cmdName. If a match is found, the
   * matched AcEdCommand object is returned. Otherwise undefined is returned to indicate that the command
   * could not be found. If more than one command of the same name is present in the command stack (that
   * is, in separate command groups), then the first one found is used.
   * @param cmdName Input the command name to search for
   * @returns Return the matched AcEdCommand object if a match is found. Otherwise, return undefined.
   */
  lookupGlobalCmd(cmdName: string) {
    let result: AcEdCommand | undefined = undefined
    for (const group of this._commandsByGroup) {
      result = group.commandsByGlobalName.get(cmdName)
      if (result) break
    }
    return result
  }

  /**
   * Search through all of the local and translated names in all of the command groups in the command stack
   * starting at the top of the stack trying to find a match with cmdName. If a match is found, the matched
   * AcEdCommand object is returned. Otherwise undefined is returned to indicate that the command could not
   * be found. If more than one command of the same name is present in the command stack (that is, in
   * separate command groups), then the first one found is used.
   * @param cmdName Input the command name to search for
   * @returns Return the matched AcEdCommand object if a match is found. Otherwise, return undefined.
   */
  lookupLocalCmd(cmdName: string) {
    let result: AcEdCommand | undefined = undefined
    for (const group of this._commandsByGroup) {
      result = group.commandsByLocalName.get(cmdName)
      if (result) break
    }
    return result
  }

  /**
   * Remove the command with the global and untranslated name `cmdGlobalName` from the `cmdGroupName`
   * command group. Return true if successful. Return false if no command with the global and untranslated
   * name `cmdGlobalName` is found in the `cmdGroupName` command group.
   * @param cmdGroupName Input the name of the command group containing the command to be removed
   * @param cmdGlobalName Input the command name which is to be removed from cmdGroupName
   * @returns Return true if successful. Return false if no command with the global and untranslated
   * name `cmdGlobalName` is found in the `cmdGroupName` command group.
   */
  removeCmd(cmdGroupName: string, cmdGlobalName: string) {
    for (const group of this._commandsByGroup) {
      if (group.groupName == cmdGroupName) {
        return group.commandsByGlobalName.delete(cmdGlobalName)
      }
    }
    return false
  }

  /**
   * Remove the command group with the name `GroupName` from the command stack and delete the command group
   * dictionary object and all the AcEdCommand objects stored within it.
   * @param groupName Input the name of the command group to be removed from the command stack.
   * @returns Return true if successful. Return false if no command group is found with the name `GroupName`.
   */
  removeGroup(groupName: string) {
    let tmp = -1
    this._commandsByGroup.some((group, index) => {
      tmp = index
      return group.groupName == groupName
    })
    if (tmp >= 0) {
      this._commandsByGroup.splice(tmp, 1)
      return true
    }
    return false
  }
}
