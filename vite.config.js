// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        openlayers: resolve(__dirname, 'openlayers/index.html'),
        // cart: resolve(__dirname, 'cart/index.html'),
      },
    },
  },
})