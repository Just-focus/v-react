import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, '../packages/react/src'),
      // 'react/jsx-runtime': path.resolve(__dirname, '../packages/react/jsx-runtime'),
      // 'react/jsx-dev-runtime': path.resolve(__dirname, '../packages/react/src/jsx-dev-runtime'),
      // 'react-dom': path.resolve(__dirname, '../packages/react-dom/src'),
      // 'react-dom/client': path.resolve(__dirname, '../packages/react-dom/client'),
      // 'react-dom/server': path.resolve(__dirname, '../packages/react-dom/server'),
      // 'react-dom/server.browser': path.resolve(__dirname, '../packages/react-dom/server.browser'),
      // 'react-dom/test-utils': path.resolve(__dirname, '../packages/react-dom/test-utils'),
      // 'react-reconciler': path.resolve(__dirname, '../packages/react-reconciler/src'),
      // 'scheduler': path.resolve(__dirname, '../packages/scheduler/src'),
    },
  },
  optimizeDeps: {
    disabled: true,
  },
})