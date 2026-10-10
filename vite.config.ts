import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'quest' ? [basicSsl()] : [])],
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
}))
