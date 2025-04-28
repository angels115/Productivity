import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Productivity/', // <-- This line is critical! Make sure it has the slashes and correct repo name.
})