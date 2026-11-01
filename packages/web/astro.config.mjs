import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import viteCacheIsolation from 'astro-vite-cache-isolation'

export default defineConfig({
  build: {
    format: 'file',
  },
  output: 'static',
  prefetch: {
    defaultStrategy: 'viewport',
  },
  session: false,
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  trailingSlash: 'never',
  integrations: [react(), viteCacheIsolation()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@fontsource-variable/geist'],
    },
  },
})
