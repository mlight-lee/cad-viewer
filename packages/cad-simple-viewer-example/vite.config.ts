import { defineConfig, type ConfigEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command }: ConfigEnv) => {
  return {
    server: {
      port: 3000
    },
    build: {
      target: 'es2020'
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
