import 'uno.css'
import 'element-plus/dist/index.css'
import 'element-plus/dist/index.css'

import { i18n } from '@mlightcad/cad-viewer'
import {
  AcDbDatabaseConverterManager,
  AcDbFileType
} from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'
import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'

const registerConverters = async () => {
  try {
    const isDev = import.meta.env.DEV
    if (!isDev) {
      // Production mode - use dynamic import with explicit chunk name
      const instance = await import(
        /* webpackChunkName: "libredwg-web" */ '@mlightcad/libredwg-web'
      )
      const converter = new AcDbLibreDwgConverter(await instance.createModule())
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
    AcDbDatabaseConverterManager.instance.register(AcDbFileType.DWG, converter)
  })
}

const initApp = () => {
  const app = createApp(App)
  app.use(i18n)
  app.use(ElementPlus)
  app.mount('#app')

  // Register converters after the app is mounted with a small delay
  // so that the app can be loaded faster
  setTimeout(() => {
    registerConverters().catch(error => {
      console.error('Failed to register converters:', error)
    })
  }, 100)

  // Hide the loading spinner
  const loader = document.getElementById('loader')
  if (loader) {
    loader.style.display = 'none'
  }
}

initApp()
