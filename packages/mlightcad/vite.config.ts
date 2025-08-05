import { resolve } from 'path'
import { Alias, defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { visualizer } from 'rollup-plugin-visualizer'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

export default defineConfig(({ command, mode }) => {
  const aliases: Alias[] = []
  if (command === 'serve') {
    aliases.push({
      find: /^@mlightcad\/(svg-renderer|three-renderer|viewer)$/,
      replacement: resolve(__dirname, '../$1/src')
    })
  }

  return {
    resolve: {
      alias: aliases
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'cad-viewer',
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    },
    plugins: [
      vue(),
      svgLoader(),
      mode === 'analyze' ? visualizer() : undefined,
      libInjectCss(),
      peerDepsExternal(),
      dts({
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts']
      })
    ]
  }
})
