import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbOpenDatabaseOptions } from '@mlightcad/data-model'

class CadViewerApp {
  private canvas: HTMLCanvasElement
  private fileInput: HTMLInputElement
  private fileInputContainer: HTMLElement
  private loadingElement: HTMLElement
  private messagesContainer: HTMLElement
  private fileInfoElement: HTMLElement

  constructor() {
    // Get DOM elements
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.fileInput = document.getElementById(
      'fileInputElement'
    ) as HTMLInputElement
    this.fileInputContainer = document.getElementById(
      'fileInput'
    ) as HTMLElement
    this.loadingElement = document.getElementById('loading') as HTMLElement
    this.messagesContainer = document.getElementById('messages') as HTMLElement
    this.fileInfoElement = document.getElementById('fileInfo') as HTMLElement

    this.initializeViewer()
    this.setupFileHandling()
  }

  private initializeViewer() {
    try {
      // Initialize the document manager with the canvas
      AcApDocManager.createInstance(this.canvas)
      console.log('CAD Simple Viewer initialized successfully')
    } catch (error) {
      console.error('Failed to initialize CAD viewer:', error)
      this.showMessage('Failed to initialize CAD viewer', 'error')
    }
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

    // Click to open file dialog
    this.fileInput.addEventListener('click', event => {
      event.stopPropagation()
    })

    this.fileInputContainer.addEventListener('click', () => {
      console.log('enter fileInputContainer click event')
      this.fileInput.click()
    })

    // Drag and drop functionality
    this.fileInputContainer.addEventListener('dragover', event => {
      event.preventDefault()
      this.fileInputContainer.classList.add('dragover')
    })

    this.fileInputContainer.addEventListener('dragleave', () => {
      this.fileInputContainer.classList.remove('dragover')
    })

    this.fileInputContainer.addEventListener('drop', event => {
      event.preventDefault()
      this.fileInputContainer.classList.remove('dragover')

      const files = event.dataTransfer?.files
      if (files && files.length > 0) {
        this.loadFile(files[0])
      }
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
    this.fileInfoElement.textContent = `Loading: ${file.name}`

    try {
      // Read the file content
      const arrayBuffer = await this.readFileAsArrayBuffer(file)

      // Set database options
      const options: AcDbOpenDatabaseOptions = {
        minimumChunkSize: 1000,
        readOnly: true
      }

      // Open the document
      const success = await AcApDocManager.instance.openDocument(
        file.name,
        arrayBuffer,
        options
      )

      if (success) {
        this.showMessage(`Successfully loaded: ${file.name}`, 'success')
        this.fileInfoElement.textContent = `Loaded: ${file.name}`

        // Auto zoom to fit after a short delay to ensure rendering is complete
        setTimeout(() => {
          this.zoomToFit()
        }, 500)
      } else {
        this.showMessage(`Failed to load: ${file.name}`, 'error')
        this.fileInfoElement.textContent = 'Failed to load file'
      }
    } catch (error) {
      console.error('Error loading file:', error)
      this.showMessage(`Error loading file: ${error}`, 'error')
      this.fileInfoElement.textContent = 'Error loading file'
    } finally {
      this.showLoading(false)
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  private zoomToFit() {
    try {
      // Execute zoom to extents command
      const context = AcApDocManager.instance.context
      if (context && context.view) {
        // Try to zoom to the extents of the drawing
        context.view.zoomToFit()
      }
    } catch (error) {
      console.error('Error zooming to fit:', error)
    }
  }
  private showLoading(show: boolean) {
    this.loadingElement.style.display = show ? 'block' : 'none'
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    this.clearMessages()

    const messageElement = document.createElement('div')
    messageElement.className = type
    messageElement.textContent = message

    this.messagesContainer.appendChild(messageElement)

    // Auto-remove success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement)
        }
      }, 3000)
    }
  }

  private clearMessages() {
    this.messagesContainer.innerHTML = ''
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
