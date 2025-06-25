import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // Exponer al LAN / ngrok
    port: 5173,
    open: '/login',        // Abre automáticamente la ruta /login al arrancar
    allowedHosts: [
      // tu subdominio exacto de ngrok:
      '9b65-47-211-148-9.ngrok-free.app',
      // y si quieres permitir cualquier *.ngrok-free.app:
      '.ngrok-free.app',
      // siempre localhost:
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
