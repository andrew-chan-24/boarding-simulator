import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins : [react()],
  base    : '/boarding-simulator/',   // ← must exactly match your repo name
})