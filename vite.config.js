import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set this to your repo name for GitHub Pages: e.g. '/my-journal/'
  // Leave as '/' if using a custom domain or user/org page
  base: '/journal-app/',
})
