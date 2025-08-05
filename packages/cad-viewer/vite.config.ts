import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { visualizer } from 'rollup-plugin-visualizer'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

export default defineConfig(({ mode }) => {
  return {
    outDir: 'dist',
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'cad-viewer',
        fileName: 'index',
        formats: ['es']
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
