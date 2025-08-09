import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import {
  AcDbDatabaseConverterManager,
  AcDbFileType,
  AcDbOpenDatabaseOptions
} from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'

class CadViewerApp {
  private canvas: HTMLCanvasElement
  private fileInput: HTMLInputElement
  private loadingElement: HTMLElement

  constructor() {
    // Get DOM elements
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.fileInput = document.getElementById(
      'fileInputElement'
    ) as HTMLInputElement
    this.loadingElement = document.getElementById('loading') as HTMLElement

    this.registerDwgConverters()
    this.initializeViewer()
    this.setupFileHandling()
  }

  private async initializeViewer() {
    try {
      // Initialize the document manager with the canvas
      AcApDocManager.createInstance(this.canvas)
      // Load default fonts
      await AcApDocManager.instance.loadDefaultFonts()
      console.log('CAD Simple Viewer initialized successfully')
    } catch (error) {
      console.error('Failed to initialize CAD viewer:', error)
      this.showMessage('Failed to initialize CAD viewer', 'error')
    }
  }

  private async registerDwgConverters() {
    try {
      const isDev = import.meta.env.DEV
      if (!isDev) {
        // Production mode - use dynamic import with explicit chunk name
        const instance = await import(
          /* webpackChunkName: "libredwg-web" */ '@mlightcad/libredwg-web'
        )
        const converter = new AcDbLibreDwgConverter(
          await instance.createModule()
        )
        AcDbDatabaseConverterManager.instance.register(
          AcDbFileType.DWG,
          converter
        )
      }
    } catch (error) {
      console.error('Failed to load libredwg-web: ', error)
    }

    // This is for development mode only. In production mode, the library is bundled
    window.addEventListener('libredwg-ready', event => {
      // @ts-expect-error this is one custom event and you can get details in index.html
      const instance = event.detail as LibreDwgEx
      const converter = new AcDbLibreDwgConverter(instance)
      AcDbDatabaseConverterManager.instance.register(
        AcDbFileType.DWG,
        converter
      )
    })
  }

  private setupFileHandling() {
    // File input change event
    this.fileInput.addEventListener('change', event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        this.loadFile(file)
      }
      this.fileInput.value = ''
    })
  }

  private async loadFile(file: File) {
    if (!AcApDocManager.instance) {
      this.showMessage('CAD viewer not initialized', 'error')
      return
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.dxf') && !fileName.endsWith('.dwg')) {
      this.showMessage('Please select a DXF or DWG file', 'error')
      return
    }

    this.showLoading(true)
    this.clearMessages()

    try {
      // Read the file content
      const fileContent = await this.readFile(file)
      
      // Add loaded class to move file input container to top-left
      const fileInputContainer = document.getElementById('fileInputContainer')
      if (fileInputContainer) {
        fileInputContainer.classList.add('loaded')
      }

      // Set database options
      const options: AcDbOpenDatabaseOptions = {
        minimumChunkSize: 1000,
        readOnly: true
      }

      // Open the document
      const success = await AcApDocManager.instance.openDocument(
        file.name,
        fileContent,
        options
      )

      if (success) {
        this.showMessage(`Successfully loaded: ${file.name}`, 'success')
      } else {
        this.showMessage(`Failed to load: ${file.name}`, 'error')
      }
    } catch (error) {
      console.error('Error loading file:', error)
      this.showMessage(`Error loading file: ${error}`, 'error')
    } finally {
      this.showLoading(false)
    }
  }

  private readFile(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string | ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.dxf')) {
        reader.readAsText(file)
      } else if (fileName.endsWith('.dwg')) {
        reader.readAsArrayBuffer(file)
      } else {
        reject(new Error('Unsupported file type'))
      }
    })
  }

  private showLoading(show: boolean) {
    this.loadingElement.style.display = show ? 'block' : 'none'
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    // Remove old persistent messages
    this.clearMessages()

    // Create popup message element
    const popup = document.createElement('div')
    popup.className = `popup-message ${type}`
    popup.textContent = message
    popup.style.position = 'fixed'
    popup.style.top = '2rem'
    popup.style.left = '50%'
    popup.style.transform = 'translateX(-50%)'
    popup.style.zIndex = '1000'
    popup.style.padding = '1rem 2rem'
    popup.style.borderRadius = '8px'
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
    popup.style.fontSize = '1.1rem'
    popup.style.opacity = '0.98'
    popup.style.transition = 'opacity 0.2s'
    if (type === 'error') {
      popup.style.background = '#ffe6e6'
      popup.style.color = '#dc3545'
      popup.style.border = '1px solid #ffcccc'
    } else if (type === 'success') {
      popup.style.background = '#e6ffe6'
      popup.style.color = '#28a745'
      popup.style.border = '1px solid #ccffcc'
    } else {
      popup.style.background = '#f0f0f0'
      popup.style.color = '#333'
      popup.style.border = '1px solid #ccc'
    }

    document.body.appendChild(popup)

    setTimeout(() => {
      popup.style.opacity = '0'
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup)
        }
      }, 200)
    }, 1000)
  }

  private clearMessages() {
    // Remove all popup messages
    document.querySelectorAll('.popup-message').forEach(el => el.remove())
  }
}

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CadViewerApp()
  })
} else {
  new CadViewerApp()
}
