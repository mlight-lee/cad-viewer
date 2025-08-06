import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { Alias, defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgLoader from 'vite-svg-loader'
import { visualizer } from 'rollup-plugin-visualizer'
import vue from '@vitejs/plugin-vue'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

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
    plugins: [
      vue(),
      svgLoader(),
      mode === 'analyze' ? visualizer() : undefined,
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
      command === 'serve' ? viteStaticCopy({
        targets: [
          {
            src: './node_modules/@mlightcad/libredwg-web/dist/libredwg-web.js',
            dest: 'assets'
          }
        ]
      }) : undefined,
      legacy({
        targets: ['ie >= 11']
      })
    ]
  }
})
