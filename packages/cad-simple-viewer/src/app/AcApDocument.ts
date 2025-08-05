import {
  AcDbDatabase,
  AcDbFileType,
  AcDbOpenDatabaseOptions
} from '@mlightcad/data-model'

import { eventBus } from '../editor'

export class AcApDocument {
  private _uri?: string
  private _database: AcDbDatabase
  private _fileName: string = ''
  private _docTitle: string = ''
  private _isReadOnly: boolean = true

  constructor() {
    this._database = new AcDbDatabase()
    this.docTitle = 'Untitled'
  }

  async openUri(uri: string, options: AcDbOpenDatabaseOptions) {
    this._uri = uri
    this._isReadOnly = (options && options.readOnly) || false
    this._fileName = this.getFileNameFromUri(uri)
    let isSuccess = true
    try {
      await this._database.openUri(uri, options)
      this.docTitle = this._fileName
    } catch (_) {
      isSuccess = false
      eventBus.emit('failed-to-open-file', { fileName: uri })
    }
    return isSuccess
  }

  async openDocument(
    fileName: string,
    content: string | ArrayBuffer,
    options: AcDbOpenDatabaseOptions
  ) {
    let isSuccess = true
    this._fileName = fileName
    try {
      const fileExtension = fileName.split('.').pop()?.toLocaleLowerCase()
      await this._database.read(
        content,
        options,
        fileExtension == 'dwg' ? AcDbFileType.DWG : AcDbFileType.DXF
      )
      this.docTitle = this._fileName
    } catch (e) {
      isSuccess = false
      eventBus.emit('failed-to-open-file', { fileName: fileName })
      console.error(e)
    }
    return isSuccess
  }

  get uri() {
    return this._uri
  }

  /**
   * The database object being used by this document instance.
   */
  get database() {
    return this._database
  }

  /**
   * The window title of the document
   */
  get docTitle() {
    return this._docTitle
  }
  set docTitle(value: string) {
    this._docTitle = value
    // Update browser title when document title changes
    if (typeof document !== 'undefined') {
      document.title = value
    }
  }

  /**
   * Return true if the document is read only; otherwise, returns false.
   */
  get isReadOnly() {
    return this._isReadOnly
  }

  private getFileNameFromUri(uri: string): string {
    try {
      // Create a new URL object
      const url = new URL(uri)
      // Get the pathname from the URL
      const pathParts = url.pathname.split('/')
      // Return the last part of the pathname as the file name
      return pathParts[pathParts.length - 1] || ''
    } catch (error) {
      console.error('Invalid URI:', error)
      return ''
    }
  }
}
