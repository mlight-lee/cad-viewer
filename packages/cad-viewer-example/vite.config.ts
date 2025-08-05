import legacy from '@vitejs/plugin-legacy'
import path, { resolve } from 'path'
import fs from 'fs'
import { Alias, defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { visualizer } from 'rollup-plugin-visualizer'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

// Custom plugin to copy a file in dev server
function copyFileInDevMode() {
  let copied = false

  // Array of file pairs with source and destination
  const filesToCopy = [
    {
      src: './node_modules/@mlightcad/libredwg-web/dist/libredwg-web.js',
      dest: 'public/assets/libredwg-web.js'
    }
  ]

  return {
    name: 'copy-file-before-build', // Plugin name

    // This hook runs when Vite is starting the build or dev server
    async config(config, { command }) {
      if (command === 'serve') {
        if (copied) return // Prevent multiple executions
        copied = true
        // Loop through each file pair and copy it
        filesToCopy.forEach(({ src, dest }) => {
          const srcPath = path.resolve(__dirname, src) // Resolve source file path
          const destPath = path.resolve(__dirname, dest) // Resolve destination path

          if (fs.existsSync(srcPath)) {
            // Ensure the destination directory exists
            const destDir = path.dirname(destPath)
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }
            fs.copyFileSync(srcPath, destPath) // Perform the copy
            console.log(`✅ Copied file from ${srcPath} to ${destPath}`)
          } else {
            console.error(`❌ File not found: ${srcPath}`)
          }
        })
      } else {
        // Not in dev mode: remove the files from their destination paths
        filesToCopy.forEach(({ dest }) => {
          const destPath = path.resolve(__dirname, dest)
          if (fs.existsSync(destPath)) {
            try {
              fs.unlinkSync(destPath)
              console.log(`🗑️ Removed file: ${destPath}`)
            } catch (err) {
              console.error(`❌ Failed to remove file: ${destPath}`, err)
            }
          } else {
            // File does not exist, nothing to remove
            // Optionally log: console.log(`ℹ️ File not found for removal: ${destPath}`)
          }
        })
      }
    }
  }
}

export default defineConfig(({ command, mode }) => {
  const aliases: Alias[] = []
  if (command === 'serve') {
    aliases.push({
      find: /^@mlightcad\/(svg-renderer|three-renderer|cad-simple-viewer|cad-viewer)$/,
      replacement: resolve(__dirname, '../$1/src')
    })
  }
  return {
    base: './',
    resolve: {
      alias: aliases
    },
    build: {
      outDir: 'dist',
      modulePreload: false,
      rollupOptions: {
        // Main entry point for the app
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: id => {
            if (id.includes('@mlightcad/libredwg-web')) {
              return 'libredwg-web'
            }
          }
        }
      }
    },
    ssr: {
      noExternal: ['@mlightcad/libredwg-web']
    },
    optimizeDeps: {
      exclude: ['@mlightcad/libredwg-web']
    },
    experimental: {
      renderBuiltUrl(
        filename: string,
        { hostType }: { hostType: 'js' | 'css' | 'html' }
      ) {
        if (hostType === 'js' && filename.includes('libredwg-web')) {
          return { relative: true }
        }
      }
    },
    plugins: [
      vue(),
      svgLoader(),
      mode === 'analyze' ? visualizer() : undefined,
      AutoImport({
        // Remove ElementPlusResolver since we're importing globally
      }),
      Components({
        // Remove ElementPlusResolver since we're importing globally
      }),
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons({
            scale: 1.2,
            warn: true
          })
        ],
        transformers: [transformerDirectives(), transformerVariantGroup()]
      }),
      copyFileInDevMode(),
      legacy({
        targets: ['ie >= 11']
      })
    ]
  }
})
