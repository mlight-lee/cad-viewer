import { AcDbFontInfo, AcDbFontLoader } from '@mlightcad/data-model'
import { AcTrRenderer } from '@mlightcad/three-renderer'
import { find, findIndex } from 'lodash-es'

import { eventBus } from '../editor'

export class AcApFontLoader implements AcDbFontLoader {
  private _cadRenderer: AcTrRenderer
  private _avaiableFonts: AcDbFontInfo[]

  constructor(renderer: AcTrRenderer) {
    this._cadRenderer = renderer
    this._avaiableFonts = []
  }

  /**
   * Avaiable fonts to load.
   */
  get avaiableFonts() {
    return this._avaiableFonts
  }

  /**
   * @inheritdoc
   */
  async getAvaiableFonts() {
    if (this._avaiableFonts.length == 0) {
      const baseUrl = 'https://cdn.jsdelivr.net/gh/mlight-lee/cad-data/fonts/'
      const fontMetaDataUrl = baseUrl + 'fonts.json'
      try {
        const response = await fetch(fontMetaDataUrl)
        this._avaiableFonts = (await response.json()) as AcDbFontInfo[]
      } catch (_) {
        eventBus.emit('failed-to-get-avaiable-fonts', {
          url: fontMetaDataUrl
        })
      }

      this._avaiableFonts.forEach(font => {
        font.url = baseUrl + font.file
      })
    }
    return this._avaiableFonts
  }

  /**
   * @inheritdoc
   */
  async load(fontNames: string[]) {
    await this.getAvaiableFonts()

    const urls: string[] = []
    fontNames.forEach(font => {
      const lowerCaseFontName = font.toLowerCase()
      const result = find(this._avaiableFonts, (item: AcDbFontInfo) => {
        return (
          findIndex(item.name, name => {
            return name.toLowerCase() == lowerCaseFontName
          }) >= 0
        )
      })
      if (result) urls.push(result.url)
    })
    const loadStatus = await this._cadRenderer.loadFonts(urls)
    loadStatus.forEach(item => {
      if (!item.status) {
        eventBus.emit('font-not-loaded', {
          fontName: item.fontName,
          url: item.url
        })
      }
    })
  }
}
