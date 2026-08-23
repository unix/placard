import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { noImageEndpoint } from 'astro-no-image-endpoint/cloudflare'
import viteCacheIsolation from 'astro-vite-cache-isolation'

export default defineConfig({
  adapter: cloudflare({ imageService: 'passthrough' }),
  output: 'server',
  prefetch: {
    defaultStrategy: 'viewport',
  },
  session: false,
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  trailingSlash: 'never',
  integrations: [react(), viteCacheIsolation(), noImageEndpoint()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@fontsource-variable/geist'],
    },
    optimizeDeps: {
      // The passthrough image service is resolved through a virtual module, so
      // Vite's source scan cannot discover it before Cloudflare imports the worker.
      include: ['astro/assets/services/noop'],
    },
  },
})
