import react from '@vitejs/plugin-react'
import { rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const outDir = resolve(root, 'dist')

// Serve MDAAS.html as the site's main page: at "/" in dev, and as
// dist/index.html in the build (so `vite preview` and any static host serve it at "/").
function mdaasAsIndex(): Plugin {
  return {
    name: 'mdaas-as-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '').split('?')
        if (path === '/' || path === '/index.html') {
          req.url = '/MDAAS.html' + (query ? `?${query}` : '')
        }
        next()
      })
    },
    async writeBundle() {
      await rename(resolve(outDir, 'MDAAS.html'), resolve(outDir, 'index.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mdaasAsIndex()],
  root,
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir,
    target: 'es2020',
    assetsInlineLimit: 2048,
    rolldownOptions: {
      input: {
        main: resolve(root, 'MDAAS.html'),
      },
    },
  },
})
