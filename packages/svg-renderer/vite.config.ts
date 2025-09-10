import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { defineConfig, PluginOption } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'svg-renderer',
      fileName: 'index'
    }
  },
  plugins: [peerDepsExternal() as PluginOption]
})
