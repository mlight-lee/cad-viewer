import { resolve } from 'path'
import { defineConfig, type ConfigEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command }: ConfigEnv) => {
  return {
    server: {
      port: 3000
    },
    build: {
      target: 'es2020',
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
      command === 'serve' ? viteStaticCopy({
        targets: [
          {
            src: './node_modules/@mlightcad/libredwg-web/dist/libredwg-web.js',
            dest: 'assets'
          }
        ]
      }) : undefined
    ]
  }
})
