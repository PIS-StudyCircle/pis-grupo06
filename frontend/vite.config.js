import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Esto es para que quede mas prolijo el ruteo, en el doc de drive (Documentacion/Configuracion/Proyecto) esta explicado
    },
  },
})
