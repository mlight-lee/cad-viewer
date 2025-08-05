import {
  AcCmEventManager,
  acdbHostApplicationServices,
  AcDbOpenDatabaseOptions
} from '@mlightcad/data-model'

import {
  AcApConvertToSvgCmd,
  AcApOpenCmd,
  AcApPanCmd,
  AcApQNewCmd,
  AcApSelectCmd,
  AcApZoomCmd,
  AcApZoomToBoxCmd,
  AcEdCommandStack
} from '../command'
import { AcEdCalculateSizeCallback, eventBus } from '../editor'
import { AcTrView2d } from '../view'
import { AcApContext } from './AcApContext'
import { AcApDocCreator } from './AcApDocCreator'
import { AcApDocument } from './AcApDocument'
import { AcApFontLoader } from './AcApFontLoader'

export interface AcDbDocumentEventArgs {
  doc: AcApDocument
}

export class AcApDocManager {
  private _context: AcApContext
  private _fontLoader: AcApFontLoader
  private static _instance?: AcApDocManager

  public readonly events = {
    documentCreated: new AcCmEventManager<AcDbDocumentEventArgs>(),
    documentActivated: new AcCmEventManager<AcDbDocumentEventArgs>()
  }

  private constructor(canvas?: HTMLCanvasElement) {
    // Create one empty drawing
    const doc = new AcApDocument()
    doc.database.events.openProgress.addEventListener(args => {
      eventBus.emit('open-file-progress', {
        percentage: args.percentage,
        stage: args.stage,
        stageStatus: args.stageStatus
      })
    })
    const callback: AcEdCalculateSizeCallback = () => {
      return {
        width: window.innerWidth,
        height: window.innerHeight - 30
      }
    }
    const view = new AcTrView2d({ canvas, calculateSizeCallback: callback })
    this._context = new AcApContext(view, doc)
    this._fontLoader = new AcApFontLoader(view.renderer)
    acdbHostApplicationServices().workingDatabase = doc.database
    this.registerCommands()
    this.createExampleDoc()
  }

  static createInstance(canvas?: HTMLCanvasElement) {
    if (AcApDocManager._instance == null) {
      AcApDocManager._instance = new AcApDocManager(canvas)
    }
    return this._instance
  }

  static get instance() {
    if (!AcApDocManager._instance) {
      AcApDocManager._instance = new AcApDocManager()
    }
    return AcApDocManager._instance
  }

  /**
   * Current context
   */
  get context() {
    return this._context
  }

  /**
   * Current open drawing
   */
  get curDocument() {
    return this._context.doc
  }

  /**
   * For now, it is same as property `curDocument`.
   */
  get mdiActiveDocument() {
    return this._context.doc
  }

  /**
   * Current view used to show current drawing
   */
  get curView() {
    return this._context.view as AcTrView2d
  }

  get editor() {
    return this._context.view.editor
  }

  /**
   * Avaiable fonts to load. It means those fonts are avaiable to load. However, it
   * doesn't mean those fonts are already loaded and avaiable to use.
   */
  get avaiableFonts() {
    return this._fontLoader.avaiableFonts
  }

  /**
   * Load the specified fonts
   * @param fonts Input one list of font names
   */
  async loadFonts(fonts: string[]) {
    await this._fontLoader.load(fonts)
  }

  /**
   * Load default fonts
   */
  async loadDefaultFonts() {
    // const fontFiles = ['simsun']
    const fontFiles = ['simkai']
    await this._fontLoader.load(fontFiles)
  }

  createExampleDoc() {
    setTimeout(async () => {
      await this.loadDefaultFonts()
      AcApDocCreator.instance.createExampleDoc2(this.curDocument.database)
      this.setLayoutInfo()
      this.curView.zoomToFit()
    })
  }

  async openUrl(url: string, options?: AcDbOpenDatabaseOptions) {
    this.onBeforeOpenDocument()
    options = this.setOptions(options)
    // TODO: The correct way is to create one new context instead of using old context and document
    const isSuccess = await this.context.doc.openUri(url, options)
    this.onAfterOpenDocument(isSuccess)
  }

  async openDocument(
    fileName: string,
    content: string | ArrayBuffer,
    options: AcDbOpenDatabaseOptions
  ) {
    this.onBeforeOpenDocument()
    options = this.setOptions(options)
    // TODO: The correct way is to create one new context instead of using old context and document
    const isSuccess = await this.context.doc.openDocument(
      fileName,
      content,
      options
    )
    this.onAfterOpenDocument(isSuccess)
  }

  registerCommands() {
    const register = AcEdCommandStack.instance
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'pan',
      'pan',
      new AcApPanCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'select',
      'select',
      new AcApSelectCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'zoom',
      'zoom',
      new AcApZoomCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'zoomw',
      'zoomw',
      new AcApZoomToBoxCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'csvg',
      'csvg',
      new AcApConvertToSvgCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'qnew',
      'qnew',
      new AcApQNewCmd()
    )
    register.addCommand(
      AcEdCommandStack.SYSTEMT_COMMAND_GROUP_NAME,
      'open',
      'open',
      new AcApOpenCmd()
    )
  }

  sendStringToExecute(cmdStr: string) {
    const register = AcEdCommandStack.instance
    const cmd = register.lookupGlobalCmd(cmdStr)
    cmd?.execute(this.context)
  }

  protected onBeforeOpenDocument() {
    this.curView.clear()
  }

  protected onAfterOpenDocument(isSuccess: boolean) {
    if (isSuccess) {
      this.events.documentActivated.dispatch({
        doc: this.context.doc
      })
      this.setLayoutInfo()
      this.curView.zoomToFit()
    }
  }

  private setOptions(options?: AcDbOpenDatabaseOptions) {
    if (options == null) {
      options = { fontLoader: this._fontLoader }
    } else if (options.fontLoader == null) {
      options.fontLoader = this._fontLoader
    }
    return options
  }

  private setLayoutInfo() {
    const currentView = this.curView as AcTrView2d
    currentView.activeLayoutBtrId = this.curDocument.database.currentSpaceId
    currentView.modelSpaceBtrId = this.curDocument.database.currentSpaceId
  }
}
