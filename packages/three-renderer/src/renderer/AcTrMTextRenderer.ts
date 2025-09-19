import {
  ColorSettings,
  MTextData,
  MTextObject,
  TextStyle,
  UnifiedRenderer
} from '@mlightcad/mtext-renderer'

/**
 * Singleton class for managing MText rendering using WebWorkerRenderer
 */
export class AcTrMTextRenderer {
  private static _instance: AcTrMTextRenderer | null = null
  private _renderer?: UnifiedRenderer

  private constructor() {
    // Do nothing for now
  }

  /**
   * Get the singleton instance of AcTrMTextRenderer
   */
  public static getInstance(): AcTrMTextRenderer {
    if (!AcTrMTextRenderer._instance) {
      AcTrMTextRenderer._instance = new AcTrMTextRenderer()
    }
    return AcTrMTextRenderer._instance
  }

  /**
   * Get the WebWorkerRenderer instance
   */
  async renderMText(
    mtextContent: MTextData,
    textStyle: TextStyle,
    colorSettings: ColorSettings = {
      byLayerColor: 0xffffff,
      byBlockColor: 0xffffff
    }
  ): Promise<MTextObject> {
    if (!this._renderer) {
      throw new Error('AcTrMTextRenderer not initialized!')
    }
    return await this._renderer!.renderMText(
      mtextContent,
      textStyle,
      colorSettings
    )
  }

  /**
   * Initialize the renderer with worker URL
   * @param workerUrl - URL to the worker script
   */
  public initialize(workerUrl: string): void {
    this._renderer = new UnifiedRenderer('worker', { workerUrl })
  }

  /**
   * Dispose of the renderer and reset the singleton
   */
  public dispose(): void {
    if (this._renderer) {
      this._renderer.destroy()
      this._renderer = undefined
    }
    AcTrMTextRenderer._instance = null
  }
}
