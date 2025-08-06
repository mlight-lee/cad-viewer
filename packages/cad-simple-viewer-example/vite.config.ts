import fs from 'fs'
import path from 'path'
import { defineConfig, type UserConfig, type ConfigEnv } from 'vite'

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
    async config(_config: UserConfig, { command }: ConfigEnv) {
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

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    target: 'es2020'
  },
  plugins: [copyFileInDevMode()]
})
