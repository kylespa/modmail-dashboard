import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Endpoints served by the modmail bot's web server
const API_PATHS = ['/users', '/threads', '/logs', '/avatars', '/stream', '/me', '/logout']

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.DASHBOARD_API || 'http://127.0.0.1:8080'

  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // variables.scss uses @import, map-get() and darken()/lighten() which
          // Dart Sass flags as deprecated; they still compile.
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div']
        }
      }
    },
    server: {
      proxy: Object.fromEntries(API_PATHS.map(p => [p, { target, changeOrigin: true }]))
    }
  }
})
