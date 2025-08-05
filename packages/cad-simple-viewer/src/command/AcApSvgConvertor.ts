import { AcSvgRenderer } from '@mlightcad/svg-renderer'

import { AcApDocManager } from '../app'

export class AcApSvgConvertor {
  convert() {
    const entities =
      AcApDocManager.instance.curDocument.database.tables.blockTable.modelSpace.newIterator()
    const renderer = new AcSvgRenderer()
    for (const entity of entities) {
      entity.draw(renderer)
    }
    this.createFileAndDownloadIt(renderer.export())
  }

  private createFileAndDownloadIt(svgContent: string) {
    // Convert the SVG content into a Blob
    const svgBlob = new Blob([svgContent], {
      type: 'image/svg+xml;charset=utf-8'
    })

    // Create a URL for the Blob
    const url = URL.createObjectURL(svgBlob)

    // Create a download link and trigger the download
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'example.svg'

    // Append the link to the body (it needs to be in the DOM to work in some browsers)
    document.body.appendChild(downloadLink)

    // Trigger the download
    downloadLink.click()
  }
}
